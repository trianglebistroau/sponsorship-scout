"use client";

import styled from "@emotion/styled";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import Card, { IdeaData } from "../components/Card";
import DotGrid from "../components/DotGrid";
import { generateNextCard } from "../lib/generateToCard";

import {
  loadDeck,
  saveDeck,
  loadDeckIndex,
  saveDeckIndex,
  upsertCommittedToPlan,
} from "@/lib/planStore";

const COMMIT_TARGET = 5;

const Container = styled.div<{ $isDark: boolean }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  perspective: 1200px;
  background-color: ${(props) => (props.$isDark ? "#0a0a0a" : "#e5e5e5")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
`;

const DeckWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  backdrop-filter: blur(3px) brightness(120%);
`;

function makePlaceholderCard(id: number, msg?: string): IdeaData {
  return {
    id,
    title: "Ready to generate",
    hook: msg ?? "Press Next to generate a fresh idea.",
    beats: ["Instant", "Uses your themes", "Costs 1 credit"],
    rationale: "",
    contentMd:
      "### Ready when you are\n\n- **Reject/Commit** the current one and I’ll generate a replacement.\n",
    status: "ready",
  };
}

function isPlaceholder(idea: IdeaData) {
  return idea.status === "ready" || idea.status === "generating";
}

/**
 * Ensures:
 * - deck is not empty
 * - only ONE trailing placeholder
 * - trailing placeholder is "ready" (not stuck in "generating" on refresh)
 */
function normalizeDeck(items: IdeaData[], takeId: () => number): IdeaData[] {
  let copy = [...items];

  // If empty, create one placeholder
  if (copy.length === 0) {
    copy.push(makePlaceholderCard(takeId()));
    return copy;
  }

  // If any trailing "generating" placeholder exists (e.g. refresh mid-gen), reset it to ready
  const last = copy[copy.length - 1];
  if (last.status === "generating") {
    copy[copy.length - 1] = {
      ...last,
      status: "ready",
      title: "Ready to generate",
      hook: "Press Next to generate a fresh idea.",
      beats: ["Instant", "Uses your themes", "Costs 1 credit"],
      contentMd:
        "### Ready when you are\n\n- **Reject/Commit** the current one and I’ll generate a replacement.\n",
    };
  }

  // Remove extra trailing placeholders (keep exactly one)
  while (
    copy.length >= 2 &&
    isPlaceholder(copy[copy.length - 1]) &&
    isPlaceholder(copy[copy.length - 2])
  ) {
    copy.pop();
  }

  // Ensure there is a trailing placeholder
  if (!isPlaceholder(copy[copy.length - 1])) {
    copy.push(makePlaceholderCard(takeId()));
  }

  return copy;
}

const DAILY_GEN_LIMIT = 6;
const QUOTA_KEY = "idea_gen_quota_v1";

type QuotaState = {
  date: string; // "YYYY-MM-DD"
  used: number;
};

function todayKey(): string {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function loadQuota(): QuotaState {
  if (typeof window === "undefined") return { date: todayKey(), used: 0 };
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    if (!raw) return { date: todayKey(), used: 0 };
    const parsed = JSON.parse(raw) as QuotaState;
    if (parsed.date !== todayKey()) return { date: todayKey(), used: 0 };
    if (typeof parsed.used !== "number") return { date: todayKey(), used: 0 };
    return parsed;
  } catch {
    return { date: todayKey(), used: 0 };
  }
}

function saveQuota(q: QuotaState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUOTA_KEY, JSON.stringify(q));
}

export default function DeckPage() {
  const router = useRouter();

  // Global sequential id generator: 0,1,2,3...
  const nextIdRef = useRef(0);
  const takeId = () => nextIdRef.current++;

  // Load deck from session storage and set nextIdRef to max+1
  const [ideas, setIdeas] = useState<IdeaData[]>(() => {
    const saved = loadDeck();
    const maxId = saved.reduce((m, x) => Math.max(m, x.id ?? -1), -1);
    nextIdRef.current = Math.max(0, maxId + 1);

    const base = saved.length ? saved : [makePlaceholderCard(takeId())];
    return normalizeDeck(base, takeId);
  });

  // Load currentIndex and clamp later
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const idx = loadDeckIndex();
    return Number.isFinite(idx) ? idx : 0;
  });

  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [quota, setQuota] = useState<QuotaState>(() => loadQuota());
  const remaining = Math.max(0, DAILY_GEN_LIMIT - quota.used);
  const quotaReached = remaining <= 0;

  // Reset quota when day changes
  useEffect(() => {
    const id = window.setInterval(() => {
      setQuota((prev) => {
        const t = todayKey();
        if (prev.date !== t) {
          const next = { date: t, used: 0 };
          saveQuota(next);
          return next;
        }
        return prev;
      });
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Clamp currentIndex whenever ideas length changes
  useEffect(() => {
    setCurrentIndex((idx) => {
      const max = Math.max(0, ideas.length - 1);
      if (idx < 0) return 0;
      if (idx > max) return max;
      return idx;
    });
  }, [ideas.length]);

  // Persist deck + index in session storage
  useEffect(() => {
    saveDeck(ideas);
  }, [ideas]);

  useEffect(() => {
    saveDeckIndex(currentIndex);
  }, [currentIndex]);

  // Export committed to plan store + redirect once when reaching target
  const didRedirectRef = useRef(false);
  useEffect(() => {
    upsertCommittedToPlan(ideas);

    const committedCount = ideas.filter((i) => i.status === "committed").length;
    if (!didRedirectRef.current && committedCount >= COMMIT_TARGET) {
      didRedirectRef.current = true;
      router.push("/plan?from=deck");
    }
  }, [ideas, router]);

  // Detect theme (dark/light)
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-500, 500], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-500, 500], [-10, 10]);
  const bgX = useTransform(mouseXSpring, [-500, 500], [40, -40]);
  const bgY = useTransform(mouseYSpring, [-500, 500], [40, -40]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    mouseX.set(e.clientX - innerWidth / 2);
    mouseY.set(e.clientY - innerHeight / 2);
  };

  // TODO: replace with real user data later
  const USER_PROFILE = "Test User Profile";
  const MACRO_THEMES = ["Technology", "Innovation", "Future Trends"];
  const USER_PROMPT = "Generate 1 strong idea card for a tech sponsorship video, but change up the style each time.";
  const [userFeedback, setUserFeedback] = useState<string[]>([]);

  async function generateIntoTrailingPlaceholder(extraFeedback?: string) {
    if (loading) return;
    if (quotaReached) return;

    let targetId: number | null = null;
    let targetIndex = -1;
    const lastReal =
      [...ideas]
        .reverse()
        .find((it) => it.status !== "ready" && it.status !== "generating");
    const lastContext = lastReal
      ? [
          lastReal.title ? `PREV_TITLE: ${lastReal.title}` : "",
          Array.isArray(lastReal.tags) && lastReal.tags.length
            ? `PREV_TAGS: ${lastReal.tags.join(", ")}`
            : "",
          lastReal.hook ? `PREV_HOOK: ${lastReal.hook}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";
    const feedback = extraFeedback ? [...userFeedback, extraFeedback] : userFeedback;
    const effectivePrompt = [USER_PROMPT, lastContext, ...feedback]
      .filter(Boolean)
      .join("\n");

    if (extraFeedback) {
      setUserFeedback((prev) => [...prev, extraFeedback]);
    }

    // 1) Ensure a trailing placeholder exists, then mark it generating
    setIdeas((prev) => {
      const normalized = normalizeDeck(prev, takeId);
      targetIndex = normalized.length - 1;
      targetId = normalized[targetIndex].id;

      normalized[targetIndex] = {
        ...normalized[targetIndex],
        title: "Generating...",
        hook: "Synthesizing a fresh idea...",
        beats: [],
        rationale: "",
        contentMd: "",
        status: "generating",
      };

      return normalized;
    });

    // Move view to the placeholder we are generating into
    if (targetIndex >= 0) setCurrentIndex(targetIndex);

    setLoading(true);
    setErrorMsg(null);

    try {
      // Use the placeholder id as the generator id (so it stays 0..n)
      const generated = await generateNextCard({
        user_profile: USER_PROFILE,
        macro_themes: MACRO_THEMES,
        user_prompt: effectivePrompt,
        nextId: targetId ?? 0,
      });

      // 2) Replace that placeholder by id, then append a fresh placeholder (new increasing id)
      setIdeas((prev) => {
        const replaced = prev.map((idea) =>
          idea.id === targetId ? { ...generated, id: idea.id, status: "shown" } : idea
        );

        const withNewPlaceholder = [...replaced, makePlaceholderCard(takeId())];
        return normalizeDeck(withNewPlaceholder, takeId);
      });

      // increment quota
      setQuota((prev) => {
        const t = todayKey();
        const base = prev.date === t ? prev : { date: t, used: 0 };
        const next = { ...base, used: base.used + 1 };
        saveQuota(next);
        return next;
      });
    } catch (e: any) {
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === targetId
            ? {
                ...idea,
                title: "Ready to generate",
                hook: e?.message || "Failed to generate.",
                status: "ready",
              }
            : idea
        )
      );
      setErrorMsg(e?.message || "Failed to generate.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate first card ONLY if we don't already have a real one in session storage
  useEffect(() => {
    const hasReal = ideas.some((i) => !isPlaceholder(i));
    if (hasReal) return;

    if (quotaReached) {
      setErrorMsg(`Daily limit reached (${DAILY_GEN_LIMIT}/day). Come back tomorrow.`);
      return;
    }

    // Generate into the (only) placeholder on first load
    generateIntoTrailingPlaceholder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrev = (index: number) => {
    setCurrentIndex(index);
  };

  const handleNext = async () => {
    const active = ideas[currentIndex];
    if (!active) return;

    // If you're on the placeholder, Next means "generate"
    if (active.status === "ready") {
      await generateIntoTrailingPlaceholder();
      return;
    }

    // Otherwise advance one step if possible
    if (currentIndex < ideas.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleReject = async (id: number) => {
    const rejected = ideas.find((it) => it.id === id);
    const feedback = rejected?.title ? `user hate title: ${rejected.title}` : undefined;
    setIdeas((prev) => prev.map((it) => (it.id === id ? { ...it, status: "rejected" } : it)));

    // Always generate into the trailing placeholder after reject
    await generateIntoTrailingPlaceholder(feedback);
  };

  const onCommit = async (id: number) => {
    const committed = ideas.find((it) => it.id === id);
    const feedback = committed?.title ? `user like title: ${committed.title}` : undefined;
    // Compute stable planId once
    const existingPlanId = ideas.find((it) => it.id === id)?.planId;
    const planId = existingPlanId ?? crypto.randomUUID();

    setIdeas((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, status: "committed" as const, planId } : it
      )
    );

    // Generate the next one
    await generateIntoTrailingPlaceholder(feedback);
  };

  const handleUpdate = (updated: IdeaData) => {
    setIdeas((prev) => {
      const copy = [...prev];
      if (currentIndex >= 0 && currentIndex < copy.length) {
        copy[currentIndex] = updated;
      }
      return copy;
    });
  };

  // Fallback render if needed
  const ideasToRender =
    ideas.length > 0
      ? ideas
      : ([
          {
            id: 0,
            title: loading ? "Generating..." : "No ideas yet",
            hook: errorMsg
              ? `${errorMsg} (Remaining today: ${remaining})`
              : loading
              ? `Please wait (Remaining today: ${remaining})`
              : `Remaining today: ${remaining}`,
            beats: [],
            rationale: "",
            status: "shown",
          } satisfies IdeaData,
        ] as IdeaData[]);

  return (
    <Container $isDark={isDark} onMouseMove={handleMouseMove}>
      <DotGrid style={{ x: bgX, y: bgY }} />

      <DeckWrapper>
        {ideasToRender.map((idea, index) => {
          const isHistory = index < currentIndex;
          const isActive = index === currentIndex;
          const isFuture = index > currentIndex;
          const offset = index - currentIndex;

          const isReadyPlaceholder = idea.status === "ready";

          return (
            <motion.div
              key={idea.id}
              onClick={() => isHistory && handlePrev(index)}
              style={{
                position: "absolute",
                zIndex: isActive ? 10 : 10 - Math.abs(offset),
                transformStyle: "preserve-3d",
                rotateX: isActive ? rotateX : 0,
                rotateY: isActive ? rotateY : 0,
                cursor: isHistory ? "pointer" : "default",
              }}
              initial={false}
              animate={{
                x: isHistory ? -550 + offset * 40 : isFuture ? 550 + offset * 40 : 0,
                scale: isActive ? 1 : 0.85,
                opacity: isActive ? 1 : isHistory ? 0.6 : 0.3,
                rotateZ: isHistory ? -10 + offset * 2 : isFuture ? 5 : 0,
              }}
              whileHover={
                isHistory
                  ? {
                      x: -480 + offset * 40,
                      opacity: 1,
                      scale: 0.9,
                      rotateZ: -5 + offset * 2,
                    }
                  : {}
              }
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Card
                data={idea}
                uiStatus={isActive ? "active" : isHistory ? "history" : "future"}
                onUpdate={isReadyPlaceholder ? () => {} : handleUpdate}
                onCommit={isReadyPlaceholder ? async () => {} : onCommit}
                onReject={isReadyPlaceholder ? async () => {} : handleReject}
                onNext={handleNext}
                id={idea.id}
              />
            </motion.div>
          );
        })}
      </DeckWrapper>
    </Container>
  );
}
