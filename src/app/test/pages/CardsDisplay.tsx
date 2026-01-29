"use client";
import styled from "@emotion/styled";
import DotGrid from "../components/DotGrid";
import Card, { IdeaData } from "../components/Card";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { generateNextCard } from "../lib/generateToCard";

const Container = styled.div<{ $isDark: boolean }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  perspective: 1200px;
  background-color: ${props => props.$isDark ? "#0a0a0a" : "#e5e5e5"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
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

const DAILY_GEN_LIMIT = 6;
const QUOTA_KEY = "idea_gen_quota_v1";

type QuotaState = {
  date: string;     // "YYYY-MM-DD"
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

    // reset if it's a new day
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
  const idCounter = useRef(1);           // positive ids for real cards
  const placeholderCounter = useRef(-1); // negative ids for placeholders

  const takePlaceholderId = () => {
    const id = placeholderCounter.current;
    placeholderCounter.current -= 1;
    return id;
  };

  const [ideas, setIdeas] = useState<IdeaData[]>(() => [
    makePlaceholderCard(takePlaceholderId()),
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isDark, setIsDark] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // setup quota state to make sure user doesn't exceed daily limit
  const [quota, setQuota] = useState<QuotaState>(() => loadQuota());

  const remaining = Math.max(0, DAILY_GEN_LIMIT - quota.used);
  const quotaReached = remaining <= 0;

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

  // TODO: replace these with real user data later
  const USER_PROFILE = "Test User Profile";
  const MACRO_THEMES = ["Technology", "Innovation", "Future Trends"];
  const USER_PROMPT = "Generate 1 strong idea card for a tech sponsorship video.";

  
  async function generateIntoPlaceholderAndAdvance() {
    if (loading) return;

    if (quotaReached) {
      setIdeas((prev) => {
        const copy = [...prev];
        const last = copy.length - 1;
        const ph = copy[last];
        if (ph?.status === "ready") {
          copy[last] = { ...ph, hook: `Daily limit reached (${DAILY_GEN_LIMIT}/day). Come back tomorrow.` };
        }
        return copy;
      });
      setErrorMsg(`Daily limit reached (${DAILY_GEN_LIMIT}/day).`);
      return;
    }

    const lastIndex = ideas.length - 1;
    const hasReadyPlaceholder = lastIndex >= 0 && ideas[lastIndex]?.status === "ready";
    const placeholderId = hasReadyPlaceholder ? ideas[lastIndex].id : takePlaceholderId();

    setIdeas((prev) => {
      const copy = [...prev];
      if (!hasReadyPlaceholder) {
        copy.push(makePlaceholderCard(placeholderId));
      }
      const idx = copy.length - 1;
      copy[idx] = {
        ...copy[idx],
        title: "Generating...",
        hook: "Synthesizing a fresh idea...",
        beats: [],
        rationale: "",
        contentMd: "",
        status: "hidden",
      };
      return copy;
    });

    setLoading(true);
    setErrorMsg(null);

    try {
      const nextId = idCounter.current++;

      const generated = await generateNextCard({
        user_profile: USER_PROFILE,
        macro_themes: MACRO_THEMES,
        user_prompt: USER_PROMPT,
        nextId,
      });

      // ✅ increment quota here if you want (you currently aren’t)

      setIdeas((prev) => {
        const copy = prev.map((idea) =>
          idea.id === placeholderId
            ? { ...generated, id: idea.id, status: "shown" }
            : idea
        );
        copy.push(makePlaceholderCard(takePlaceholderId()));
        return copy;
      });

      setCurrentIndex((prev) => prev);
    } catch (e: any) {
      setIdeas((prev) => {
        return prev.map((idea) =>
          idea.id === placeholderId
            ? {
                ...idea,
                title: "Ready to generate",
                hook: e.message || "Failed to generate.",
                status: "ready",
              }
            : idea
        );
      });
      setErrorMsg(e.message || "Failed to generate.");
    } finally {
      setLoading(false);
    }
  }




  // Fetch first idea on load (matches your integration doc flow)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      if (quotaReached) {
        setErrorMsg(`Daily limit reached (${DAILY_GEN_LIMIT}/day). Come back tomorrow.`);
        setIdeas([]);
        setLoading(false);
        return;
      }

      try {
        const placeholderId = ideas[0]?.id ?? takePlaceholderId();
        setIdeas((prev) => {
          const copy = prev.length ? [...prev] : [makePlaceholderCard(placeholderId)];
          copy[0] = {
            ...copy[0],
            title: "Generating...",
            hook: "Synthesizing your first idea...",
            beats: [],
            rationale: "",
            contentMd: "",
            status: "hidden",
          };
          return copy;
        });

        const firstId = idCounter.current++;
        const first = await generateNextCard({
          user_profile: USER_PROFILE,
          macro_themes: MACRO_THEMES,
          user_prompt: USER_PROMPT,
          nextId: firstId,
        });

        setIdeas((prev) => {
          const copy = prev.map((idea) =>
            idea.id === placeholderId
              ? { ...first, id: idea.id, status: "shown" }
              : idea
          );
          copy.push(makePlaceholderCard(takePlaceholderId()));
          return copy;
        });
        setCurrentIndex(0);
      } catch (e: any) {
        setErrorMsg(e.message || "Failed to fetch initial idea.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const ideasToRender =
  ideas.length > 0
    ? ideas
    : [{
        id: -1,
        title: loading ? "Generating..." : "No ideas yet",
        hook: errorMsg
          ? `${errorMsg} (Remaining today: ${remaining})`
          : loading
            ? `Please wait (Remaining today: ${remaining})`
            : `Remaining today: ${remaining}`,
        beats: [],
        rationale: "",
        status: "shown",
      } satisfies IdeaData];



  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 40, damping: 20 });

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    mouseX.set(e.clientX - innerWidth / 2);
    mouseY.set(e.clientY - innerHeight / 2);
  };

  const rotateX = useTransform(mouseYSpring, [-500, 500], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-500, 500], [-10, 10]);
  const bgX = useTransform(mouseXSpring, [-500, 500], [40, -40]);
  const bgY = useTransform(mouseYSpring, [-500, 500], [40, -40]);

  const handleNext = async () => {
    if (currentIndex < ideas.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (ideas[currentIndex].status === "ready") {
        ideas[currentIndex].status = "shown";
        setIdeas([...ideas]);
      }
      return;
    }
  };

  const handlePrev = async (index: number) => {
    setCurrentIndex(index);
    
  };

  const handleReject = async (id: number) => {
    const placeholderIndex = ideas.length - 1;

    setIdeas((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: "rejected" } : it))
    );

    setCurrentIndex(placeholderIndex);
    await generateIntoPlaceholderAndAdvance();
  };


  const onCommit = async (id: number) => {
    const placeholderIndex = ideas.length - 1;
    console.log("Committing id:", id);

    console.log("Ideas before commit:", ideas);
    setIdeas((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: "committed" } : it))
    );

    // jump to placeholder and generate
    setCurrentIndex(placeholderIndex);
    await generateIntoPlaceholderAndAdvance();
  };



  const handleUpdate = (updated: IdeaData) => {
    const newIdeas = [...ideas];
    newIdeas[currentIndex] = updated;
    setIdeas(newIdeas);
  };


  return (
    <Container $isDark={isDark} onMouseMove={handleMouseMove}>
      <DotGrid style={{ x: bgX, y: bgY }}  />

      <DeckWrapper>
        {ideasToRender.map((idea, index) => {
          const isHistory = index < currentIndex;
          const isActive = index === currentIndex;
          const isFuture = index > currentIndex;
          const offset = index - currentIndex;

          const isPlaceholder = idea.status === "ready";

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
                cursor: isHistory ? "pointer" : "default"
              }}
              initial={false}
              animate={{
                x: isHistory ? -550 + (offset * 40) :
                   isFuture ? 550 + (offset * 40) : 0,
                scale: isActive ? 1 : 0.85,
                opacity: isActive ? 1 : isHistory ? 0.6 : 0.3,
                rotateZ: isHistory ? -10 + (offset * 2) : isFuture ? 5 : 0,
              }}
              whileHover={isHistory ? {
                x: -480 + (offset * 40),
                opacity: 1,
                scale: 0.9,
                rotateZ: -5 + (offset * 2)
              } : {}}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Card
                data={idea}
                uiStatus={isActive ? "active" : isHistory ? "history" : "future"}
                onUpdate={isPlaceholder ? () => {} : handleUpdate}
                onCommit={isPlaceholder ? async () => {} : onCommit}
                onReject={isPlaceholder ? async () => {} : handleReject}
                onNext={isPlaceholder ? async () => {} : handleNext}
                id={idea.id}
              />
            </motion.div>
          );
        })}
      </DeckWrapper>
    </Container>
  );
}
