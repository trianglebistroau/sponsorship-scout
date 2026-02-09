"use client";

import { uploadThreeVideosToGCS } from "@/lib/gcsUpload";
import {
    confirmOnboarding,
    createOnboardingSession,
    getOnboardingState,
    sendOnboardingMessage,
    startOnboardingSession,
    submitOnboardingVideos,
    type OnboardingStage,
    type OnboardingStateSnapshot,
} from "@/lib/onboarding-rest";
import { createOrUpdateUser } from "@/lib/user-data";
import { useUserStore } from "@/store/user-store";
import { subscribeOnboardingEvents, type OnboardingEventRow } from "@/lib/onboardingEvents";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

// ---- UI helpers (keep minimal / replace with your own components) ----
type ChatMsg = { role: "user" | "assistant"; content: React.ReactNode; ts: number };

type TasteAnalysis = { tone: string; energy: string; formatBias: string };
type Superpower = { title?: string; description?: string; evidence?: string };
type GrowthZone = { title?: string; description?: string; suggestion?: string };
// type Goal = { title?: string; description?: string };

type Stage =
    | "awaiting-name"
    | "awaiting-taste-videos"
    | "analyzing-taste"
    | "awaiting-taste-validation"
    | "taste-clarification"
    | "awaiting-best-videos"
    | "analyzing-best"
    | "superpowers-clarification"
    | "awaiting-superpowers-validation"
    | "awaiting-growth-videos"
    | "analyzing-growth"
    | "awaiting-growth-validation"
    | "growth-clarification"
    | "waiting-goal-prompt"
    | "waiting-goal-prompt"
    | "awaiting-goal-confirmation"
    | "goal-refinement"
    | "goal-add"
    | "goal-finalizing"
    | "completion";


function Card(props: { children: React.ReactNode }) {
return <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">{props.children}</div>;
}
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" }) {
const variant = props.variant ?? "primary";
const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
const cls =
    variant === "primary"
    ? `${base} bg-foreground text-background hover:opacity-90`
    : `${base} border border-border hover:bg-muted`;
return (
    <button {...props} className={`${cls} ${props.className ?? ""}`}>
    {props.children}
    </button>
);
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
return (
    <input
    {...props}
    className={`w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 ${
        props.className ?? ""
    }`}
    />
);
}

function Pill(props: { children: React.ReactNode }) {
return <span className="inline-flex items-center rounded-full border border-border px-2 py-1 text-xs">{props.children}</span>;
}

function deriveStageFromSnapshot(s: { values: OnboardingStateSnapshot["values"] }): Stage {
  const v = s.values;

  if (v.is_complete) return "completion";
  if (!v.user_name) return "awaiting-name";

  // Taste
  if (v.taste_video_count < 3) return "awaiting-taste-videos";
  if (!v.taste_has_analysis) return "analyzing-taste";
  if (!v.taste_confirmed) return "awaiting-taste-validation";

  // Performance
  if (v.performance_video_count < 3) return "awaiting-best-videos";
  if (!v.performance_has_analysis) return "analyzing-best";
  if (!v.performance_confirmed) return "awaiting-superpowers-validation";

  // Low-performance / growth
  if (v.low_performance_video_count < 3) return "awaiting-growth-videos";
  if (!v.low_performance_has_analysis) return "analyzing-growth";
  if (!v.low_performance_confirmed) return "awaiting-growth-validation";

  // Goal
  if (!v.goal_confirmed) return "awaiting-goal-confirmation";

  return "goal-finalizing";
}

export default function ConversationPage() {
const router = useRouter();

const { email: userEmail } = useUserStore();

const [sessionId, setSessionId] = useState<string | null>(null);
const [stage, setStage] = useState<Stage>("awaiting-name");
const [messages, setMessages] = useState<ChatMsg[]>([]);
const [input, setInput] = useState("");

const [userName, setUserName] = useState("");
const [isLoading, setIsLoading] = useState(false);

const [tasteFiles, setTasteFiles] = useState<File[]>([]);
const [bestFiles, setBestFiles] = useState<File[]>([]);
const [growthFiles, setGrowthFiles] = useState<File[]>([]);
const [uploadProgress, setUploadProgress] = useState<{ uploaded: number; total: number } | null>(null);

const [tasteAnalysis, setTasteAnalysis] = useState<TasteAnalysis | null>(null);
const [superpowers, setSuperpowers] = useState<Superpower[] | null>(null);
const [growthZones, setGrowthZones] = useState<GrowthZone[] | null>(null);

const bottomRef = useRef<HTMLDivElement | null>(null);

const subscribedRef = useRef<string | null>(null);
const startSentRef = useRef<string | null>(null);

const seenEventIdsRef = useRef<Set<number>>(new Set());

const tasteConfirmedRef = useRef(false);
const superpowersConfirmedRef = useRef(false);
const growthConfirmedRef = useRef(false);

const goalPromptedRef = useRef(false);
const goalConfirmedRef = useRef(false);

const stageHint = useMemo(() => {
if (stage === "awaiting-name") return "Type your name";
if (stage === "taste-clarification") return "Tell me what’s off";
if (stage === "superpowers-clarification") return "What’s off about the performance analysis?";
if (stage === "growth-clarification") return "What’s off about the growth zones?";
if (stage === "goal-refinement") return "What direction would you prefer?";
if (stage === "goal-add") return "Add a goal (one line)";
return "";
}, [stage]);



    useEffect(() => {
    if (!sessionId) return;

    // avoid re-subscribing for same sessionId
    if (subscribedRef.current === sessionId) return;
    subscribedRef.current = sessionId;

    const unsub = subscribeOnboardingEvents({
      sessionId,
      onInsert: handleEvent,
      onStatus: (status) => {
        // Supabase v2 statuses: SUBSCRIBED, CHANNEL_ERROR, TIMED_OUT, CLOSED
        if (status === "SUBSCRIBED") {
          // StrictMode-safe: only start once per sessionId
          if (startSentRef.current !== sessionId) {
            startSentRef.current = sessionId;
            startOnboardingSession(sessionId).catch(console.error);
          }
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Onboarding realtime failed:", status);
        }
      },
    });

    return () => {
      unsub?.();
      // allow resubscribe if session changes
      if (subscribedRef.current === sessionId) subscribedRef.current = null;
    };
  }, [sessionId]);

const addAssistant = (content: React.ReactNode) =>
    setMessages((m) => [...m, { role: "assistant", content, ts: Date.now() }]);
const addUser = (content: React.ReactNode) => setMessages((m) => [...m, { role: "user", content, ts: Date.now() }]);

useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages.length]);


// Create/reuse session
useEffect(() => {
    let cancelled = false;

    async function boot() {
    try {
        setIsLoading(true);
        const cached = typeof window !== "undefined" ? sessionStorage.getItem("onboarding_session_id") : null;
        
        if (cached) {
        // Try to resume
        const snap = await getOnboardingState(cached);

        if (cancelled) return;

        setSessionId(cached);

        // Restore stage
        setStage(deriveStageFromSnapshot(snap));

        // Restore chat history (from checkpoint)
        setMessages(
          (snap.messages || []).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content:
              m.role === "assistant" ? (
                <div className="text-sm whitespace-pre-wrap">
                  <ReactMarkdown>{String(m.content ?? "")}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">{String(m.content ?? "")}</div>
              ),
            ts: m.timestamp ? Date.parse(m.timestamp) : Date.now(),
          }))
        );

        // If finished, clear sessionStorage so next visit starts fresh
        if (snap.values?.is_complete) {
          sessionStorage.removeItem("onboarding_session_id");
        }

        return;
        }
        
        // No cached session -> create new
        const created = await createOnboardingSession();
        if (cancelled) return;
        setSessionId(created.session_id);
        sessionStorage.setItem("onboarding_session_id", created.session_id);
    } catch (e) {
        console.error(e);
        addAssistant(<p className="text-sm text-red-600">Failed to create/resume session.</p>);
    } finally {
        if (!cancelled) setIsLoading(false);
    }
    }

    boot();
    return () => {
    cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Supabase event handler
const handleEvent = (row: OnboardingEventRow) => {
    const type = row.type;
    const payload = row.payload ?? {};

    if (row?.id && seenEventIdsRef.current.has(row.id)) return;
    if (row?.id) seenEventIdsRef.current.add(row.id);

    if (type === "assistant_message") {
    const text = String(payload?.content ?? "");
    addAssistant(
        <div className="text-sm whitespace-pre-wrap">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );

    if (text.includes("Now let's look at what actually PERFORMS")) {
        setStage("awaiting-best-videos");
    }
    const isGoalPrompt =
        text.includes("Does this direction feel exciting") ||
        text.includes("add your own goals");

    if (isGoalPrompt && !goalConfirmedRef.current) {
        goalPromptedRef.current = true;
        setStage("awaiting-goal-confirmation");
    }


    return;
    }

    if (type === "analysis_update") {
    const analysisType = payload?.analysis_type as string;
    const data = payload?.data ?? {};

    if (analysisType === "taste") {
        const ta: TasteAnalysis = {
            tone: data.tone ?? data.tone_summary ?? "",
            energy: data.energy ?? data.energy_summary ?? "",
            formatBias: data.formatBias ?? data.format_bias ?? data.format_bias_summary ?? "",

        };
        setTasteAnalysis(ta);

        if (!tasteConfirmedRef.current) {
            setStage("awaiting-taste-validation");
        }
        return;
        }


    if (analysisType === "performance") {
        const items: Superpower[] =
        Array.isArray(data?.superpowers) ? data.superpowers : Array.isArray(data) ? data : [];
        setSuperpowers(items);
        if (!superpowersConfirmedRef.current) {
            setStage("awaiting-superpowers-validation");
        }
        return;
    }

    if (analysisType === "low_performance") {
        const items: GrowthZone[] =
        Array.isArray(data?.growth_zones) ? data.growth_zones : Array.isArray(data) ? data : [];
        setGrowthZones(items);
        if (!growthConfirmedRef.current) {
            setStage("awaiting-growth-validation");
        }
        return;
    }
    if (analysisType === "goal") {
        const items: GrowthZone[] =
        Array.isArray(data?.growth_zones) ? data.growth_zones : Array.isArray(data) ? data : [];
        setGrowthZones(items);
        if (!growthConfirmedRef.current) {
            setStage("awaiting-goal-confirmation");
        }
        return;
    }
    }

    if (type === "complete") {
        setStage("completion");
        // Extract username from payload and route to profile
        const completionData = payload?.data ?? payload;
        const profileUsername = completionData?.username ?? userName ?? "unknown";
        
        // Create/update user in Supabase
        (async () => {
            try {
                await createOrUpdateUser({
                    username: profileUsername,
                    email: userEmail ?? undefined,
                    recommendation_json: completionData,
                });
            } catch (e) {
                console.error("Failed to create user:", e);
            }
        })();
        
        setTimeout(() => {
            router.push(`/profile/${encodeURIComponent(profileUsername)}`);
        }, 2000);
    return;
    }

    if (type === "error") {
    addAssistant(
        <div className="space-y-2">
        <p className="text-sm font-semibold text-red-600">Something went wrong</p>
        <p className="text-sm text-muted-foreground">{payload?.message ?? "Unknown error"}</p>
        </div>
    );
    }
};


// ---- actions ----
const onSubmitName = async () => {
    if (!sessionId) return;
    const name = input.trim();
    if (!name) return;

    setUserName(name);
    addUser(<p className="text-sm">{name}</p>);
    setInput("");

    setIsLoading(true);
    try {
    await sendOnboardingMessage(sessionId, name);
    } catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Failed to send name.</p>);
    } finally {
    setIsLoading(false);
    }

    addAssistant(
    <div className="space-y-2">
        <p className="text-sm font-semibold">Step 1: Your taste</p>
        <p className="text-sm text-muted-foreground">Upload 3 videos that feel most “you”.</p>
    </div>
    );
    setStage("awaiting-taste-videos");
};

async function uploadAndAnalyze(stageName: OnboardingStage, files: File[]) {
    if (!sessionId) return;

    setIsLoading(true);
    setUploadProgress({ uploaded: 0, total: 3 });

    try {
    const gcsUris = await uploadThreeVideosToGCS({
        files,
        sessionId,
        stage: stageName,
        userName,
        onProgress: setUploadProgress,
    });

    await submitOnboardingVideos(sessionId, stageName, gcsUris);
    } finally {
    setUploadProgress(null);
    setIsLoading(false);
    }
}

const startTaste = async () => {
    if (tasteFiles.length < 3 || !sessionId) return;
    setStage("analyzing-taste");
    try {
    await uploadAndAnalyze("taste", tasteFiles);
    } catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Taste upload/analyze failed.</p>);
    setStage("awaiting-taste-videos");
    }
};

const confirmTaste = async (ok: boolean) => {
    if (!sessionId) return;

    addUser(<p className="text-sm">{ok ? "Yes" : "Not really"}</p>);

    if (!ok) {
        // ✅ Important: do NOT call backend yet
        addAssistant(<p className="text-sm text-muted-foreground">Tell me what’s off so I can refine it.</p>);
        setStage("taste-clarification");
        return;
    }

    // ok === true: call backend
    setIsLoading(true);
    
    try {
        await confirmOnboarding(sessionId, "true");
    } catch (e) {
        console.error(e);
        addAssistant(<p className="text-sm text-red-600">Confirm failed.</p>);
    } finally {
        setIsLoading(false);
    }

    tasteConfirmedRef.current = true;
    setStage("analyzing-best");
    };


const submitTasteClarification = async () => {
    if (!sessionId) return;
    const msg = input.trim();
    if (!msg) return;

    addUser(<p className="text-sm">{msg}</p>);
    setInput("");

    setIsLoading(true);
    try {
    await confirmOnboarding(sessionId, "false", msg);
    } catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Failed to send clarification.</p>);
    } finally {
    setIsLoading(false);
    }
};

const startBest = async () => {
    if (bestFiles.length < 3 || !sessionId) return;
    setStage("analyzing-best");
    try {
    await uploadAndAnalyze("performance", bestFiles);
    } catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Best upload/analyze failed.</p>);
    setStage("awaiting-best-videos");
    }
};

const confirmSuperpowers = async (ok: boolean) => {
if (!sessionId) return;

addUser(<p className="text-sm">{ok ? "Yes" : "Not really"}</p>);

if (!ok) {
    // ✅ do NOT call backend yet
    addAssistant(
    <p className="text-sm text-muted-foreground">
        Got it — what feels off? (hooks, topics, retention, engagement). One sentence is enough.
    </p>
    );
    setStage("superpowers-clarification");
    return;
}

// ok === true: call backend to proceed
setIsLoading(true);
try {
    await confirmOnboarding(sessionId, "true");
} catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Confirm failed.</p>);
    return;
} finally {
    setIsLoading(false);
}

    superpowersConfirmedRef.current = true;
    setStage("awaiting-growth-videos");
};
const submitSuperpowersClarification = async () => {
if (!sessionId) return;
const msg = input.trim();
if (!msg) return;

addUser(<p className="text-sm">{msg}</p>);
setInput("");

setIsLoading(true);
try {
    await confirmOnboarding(sessionId, "false", msg);
} catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Failed to send clarification.</p>);
} finally {
    setIsLoading(false);
}
};



const startGrowth = async () => {
    if (growthFiles.length < 3 || !sessionId) return;
    setStage("analyzing-growth");
    try {
    await uploadAndAnalyze("low_performance", growthFiles);
    } catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Growth upload/analyze failed.</p>);
    setStage("awaiting-growth-videos");
    }
};

const confirmGrowth = async (ok: boolean) => {
if (!sessionId) return;

addUser(<p className="text-sm">{ok ? "Yes" : "Not really"}</p>);

if (!ok) {
    // ✅ do NOT call backend yet
    addAssistant(
    <p className="text-sm text-muted-foreground">
        Tell me what’s off about these growth zones (what you think the real issue is), and I’ll refine.
    </p>
    );
    setStage("growth-clarification");
    return;
}

setIsLoading(true);
try {
    await confirmOnboarding(sessionId, "true");
} catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Confirm failed.</p>);
    return;
} finally {
    setIsLoading(false);
}

growthConfirmedRef.current = true;
setStage("waiting-goal-prompt");
};

const submitGrowthClarification = async () => {
if (!sessionId) return;
const msg = input.trim();
if (!msg) return;

addUser(<p className="text-sm">{msg}</p>);
setInput("");

setIsLoading(true);
try {
    await confirmOnboarding(sessionId, "false", msg);
} catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Failed to send clarification.</p>);
} finally {
    setIsLoading(false);
}
};

const confirmGoals = async (ok: boolean) => {
  if (!sessionId) return;

  addUser(<p className="text-sm">{ok ? "Yes, exciting" : "Not really"}</p>);

  if (!ok) {
    addAssistant(<p className="text-sm text-muted-foreground">Tell me what direction you prefer, or add goals.</p>);
    setStage("goal-refinement");
    return;
  }

  setIsLoading(true);
  try {
    goalConfirmedRef.current = true;
    await confirmOnboarding(sessionId, "true"); // no extra content needed
  } catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Confirm failed.</p>);
    goalConfirmedRef.current = false;
    return;
  } finally {
    setIsLoading(false);
  }

  setStage("goal-finalizing");
};

const startGoalRefinement = () => {
  addUser(<p className="text-sm">Not really</p>);
  addAssistant(<p className="text-sm text-muted-foreground">Tell me what direction you want instead.</p>);
  setStage("goal-refinement");
};

const submitGoalRefinement = async () => {
  if (!sessionId) return;
  const msg = input.trim();
  if (!msg) return;

  addUser(<p className="text-sm">{msg}</p>);
  setInput("");

  setIsLoading(true);
  try {
    await confirmOnboarding(sessionId, "false", msg);
    // backend will loop back to wait_goal_confirmation and ask again
    setStage("awaiting-goal-confirmation");
  } catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Failed to send refinement.</p>);
  } finally {
    setIsLoading(false);
  }
};

const startGoalAdd = () => {
  addUser(<p className="text-sm">attempting to add or remove a goal</p>);
  addAssistant(<p className="text-sm text-muted-foreground">Type your goal (one line). You can add multiple, one at a time.</p>);
  setStage("goal-add");
};

const submitGoalAdjust = async () => {
  if (!sessionId) return;
  const msg = input.trim();
  if (!msg) return;

  addUser(<p className="text-sm">{msg}</p>);
  setInput("");

  setIsLoading(true);
  try {
    await confirmOnboarding(sessionId, "add", msg);
    setStage("awaiting-goal-confirmation");
  } catch (e) {
    console.error(e);
    addAssistant(<p className="text-sm text-red-600">Failed to add goal.</p>);
  } finally {
    setIsLoading(false);
  }
};






return (
    <div className="mx-auto flex h-[calc(100vh-40px)] max-w-3xl flex-col gap-4 p-4">
    <div className="flex items-center justify-between">
        <div className="space-y-1">
        <div className="text-sm font-semibold">Conversation</div>
        <div className="text-xs text-muted-foreground">
            {sessionId ? <span>Session: {sessionId.slice(0, 8)}…</span> : <span>Creating session…</span>}
            {"Stage: " + stage}
        </div>
        </div>
        <div className="flex items-center gap-2">
        {isLoading ? <Pill>working…</Pill> : <Pill>ready</Pill>}
        {uploadProgress ? (
            <Pill>
            uploading {uploadProgress.uploaded}/{uploadProgress.total}
            </Pill>
        ) : null}
        </div>
    </div>

    <Card>
        <div className="h-[60vh] overflow-y-auto space-y-3 pr-1">
        {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-foreground text-background" : "bg-muted"}`}>
                {m.content}
            </div>
            </div>
        ))}
        <div ref={bottomRef} />
        </div>
    </Card>

    <Card>
        {stage === "awaiting-name" && (
        <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && sessionId && !isLoading && input.trim()) {
                  e.preventDefault();
                  onSubmitName();
                }
              }}
              placeholder={stageHint} 
            />
            <Button disabled={!sessionId || isLoading || !input.trim()} onClick={onSubmitName}>
            Send
            </Button>
        </div>
        )}

        {stage === "awaiting-taste-videos" && (
        <div className="space-y-3">
            <div className="text-sm font-semibold">Upload 3 taste videos</div>
            <input type="file" accept="video/*" multiple onChange={(e) => setTasteFiles(Array.from(e.target.files ?? []).slice(0, 3))} />
            <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{tasteFiles.length}/3 selected</div>
            <Button disabled={!sessionId || tasteFiles.length < 3 || isLoading} onClick={startTaste}>
                Upload & Analyze
            </Button>
            </div>
        </div>
        )}

        {stage === "analyzing-taste" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Analyzing taste…</div>
            <div className="text-xs text-muted-foreground">Waiting for Supabase events.</div>
        </div>
        )}

        {stage === "awaiting-taste-validation" && (
        <div className="flex items-center gap-2">
            <Button variant="outline" disabled={isLoading} onClick={() => confirmTaste(false)}>
            Not really
            </Button>
            <Button disabled={isLoading} onClick={() => confirmTaste(true)}>
            Yes
            </Button>
        </div>
        )}

        {stage === "taste-clarification" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Clarify your taste</div>
            <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && sessionId && !isLoading && input.trim()) {
                  e.preventDefault();
                  submitTasteClarification();
                }
              }}
              placeholder={stageHint} 
            />
            <Button disabled={!sessionId || isLoading || !input.trim()} onClick={submitTasteClarification}>
                Send
            </Button>
            </div>
        </div>
        )}

        {stage === "awaiting-best-videos" && (
        <div className="space-y-3">
            <div className="text-sm font-semibold">Upload 3 best-performing videos</div>
            <input type="file" accept="video/*" multiple onChange={(e) => setBestFiles(Array.from(e.target.files ?? []).slice(0, 3))} />
            <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{bestFiles.length}/3 selected</div>
            <Button disabled={!sessionId || bestFiles.length < 3 || isLoading} onClick={startBest}>
                Upload & Analyze
            </Button>
            </div>
        </div>
        )}

        {stage === "analyzing-best" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Analyzing performance…</div>
            <div className="text-xs text-muted-foreground">Waiting for Supabase events.</div>
        </div>
        )}

        {stage === "awaiting-superpowers-validation" && (
        <div className="flex items-center gap-2">
            <Button variant="outline" disabled={isLoading} onClick={() => confirmSuperpowers(false)}>
            Not really
            </Button>
            <Button disabled={isLoading} onClick={() => confirmSuperpowers(true)}>
            Yes
            </Button>
        </div>
        )}

        {stage === "awaiting-growth-videos" && (
        <div className="space-y-3">
            <div className="text-sm font-semibold">Upload 3 low-performing videos</div>
            <input type="file" accept="video/*" multiple onChange={(e) => setGrowthFiles(Array.from(e.target.files ?? []).slice(0, 3))} />
            <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{growthFiles.length}/3 selected</div>
            <Button disabled={!sessionId || growthFiles.length < 3 || isLoading} onClick={startGrowth}>
                Upload & Analyze
            </Button>
            </div>
        </div>
        )}

        {stage === "analyzing-growth" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Analyzing growth zones…</div>
            <div className="text-xs text-muted-foreground">Waiting for Supabase events.</div>
        </div>
        )}

        {stage === "superpowers-clarification" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Clarify what’s off</div>
            <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && sessionId && !isLoading && input.trim()) {
                  e.preventDefault();
                  submitSuperpowersClarification();
                }
              }}
              placeholder={stageHint} 
            />
            <Button disabled={!sessionId || isLoading || !input.trim()} onClick={submitSuperpowersClarification}>
                Send
            </Button>
            </div>
        </div>
        )}

        {stage === "growth-clarification" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Clarify what’s off</div>
            <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && sessionId && !isLoading && input.trim()) {
                  e.preventDefault();
                  submitGrowthClarification();
                }
              }}
              placeholder={stageHint} 
            />
            <Button disabled={!sessionId || isLoading || !input.trim()} onClick={submitGrowthClarification}>
                Send
            </Button>
            </div>
        </div>
        )}


        {stage === "awaiting-growth-validation" && (
        <div className="flex items-center gap-2">
            <Button variant="outline" disabled={isLoading} onClick={() => confirmGrowth(false)}>
            Not really
            </Button>
            <Button disabled={isLoading} onClick={() => confirmGrowth(true)}>
            Yes
            </Button>
        </div>
        )}

        {stage === "waiting-goal-prompt" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Goals</div>
            <div className="text-xs text-muted-foreground">Waiting for the goal direction prompt…</div>
        </div>
        )}


        {stage === "awaiting-goal-confirmation" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Confirm your direction</div>
            <div className="text-xs text-muted-foreground">
            If you want, you can also add goals (optional) by clicking “Not really”.
            </div>
            <div className="flex items-center gap-2">
            <Button variant="outline" disabled={isLoading} onClick={() => confirmGoals(false)}>
                Not really
            </Button>
            <Button disabled={isLoading} onClick={() => confirmGoals(true)}>
                Yes, exciting
            </Button>
            </div>
        </div>
        )}

        {stage === "goal-refinement" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Refine direction</div>
            <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && sessionId && !isLoading && input.trim()) {
                  e.preventDefault();
                  submitGoalRefinement();
                }
              }}
              placeholder={stageHint} 
            />
            <Button disabled={!sessionId || isLoading || !input.trim()} onClick={submitGoalRefinement}>
                Send
            </Button>
            </div>
        </div>
        )}

        {stage === "goal-add" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Add a goal</div>
            <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && sessionId && !isLoading && input.trim()) {
                  e.preventDefault();
                  submitGoalAdjust();
                }
              }}
              placeholder={stageHint} 
            />
            <Button disabled={!sessionId || isLoading || !input.trim()} onClick={submitGoalAdjust}>
                Add
            </Button>
            </div>
        </div>
        )}

        {stage === "goal-finalizing" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Finalizing…</div>
        </div>
        )}


        {stage === "completion" && (
        <div className="space-y-2">
            <div className="text-sm font-semibold">Complete ✅</div>
            <div className="text-xs text-muted-foreground">Route to dashboard/profile next.</div>
            <div className="flex gap-2">
            {/* <Button
                variant="outline"
                onClick={() => {
                sessionStorage.removeItem("onboarding_session_id");
                window.location.reload();
                }}
            >
                Restart
            </Button> */}
            </div>
        </div>
        )}
    </Card>

    <div className="text-xs text-muted-foreground">
        {tasteAnalysis ? <span className="mr-3">taste✅</span> : <span className="mr-3">taste—</span>}
        {superpowers ? <span className="mr-3">best✅</span> : <span className="mr-3">best—</span>}
        {growthZones ? <span className="mr-3">growth✅</span> : <span className="mr-3">growth—</span>}
    </div>
    </div>
);
}
