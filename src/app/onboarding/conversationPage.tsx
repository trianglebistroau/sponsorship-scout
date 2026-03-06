"use client";

import { authClient } from "@/lib/auth-client";
import { uploadThreeVideosToGCS } from "@/lib/gcsUpload";
import { createOrUpdateUser } from "@/lib/user-data";
import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalysisMode = "taste" | "performance" | "low_performance";

type AnalysisResult = {
  mode: AnalysisMode;
  analysis: unknown;
};

type AppStep = "upload" | "analysing" | "synthesizing" | "done" | "error";

type CategoryStatus = "idle" | "uploading" | "analysing" | "done" | "error";

// ─── API helpers ──────────────────────────────────────────────────────────────

async function analyzeVideos(videoUrls: string[], mode: AnalysisMode): Promise<AnalysisResult> {
  const res = await fetch("/api/v1/onboarding/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_urls: videoUrls, mode }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Video analysis failed (${res.status}): ${text}`);
  }
  return (await res.json()) as AnalysisResult;
}

async function synthesizeProfile(params: {
  username: string;
  taste_profile: unknown;
  performance_insights?: unknown;
  low_performance_insights?: unknown;
  creative_goal?: unknown;
}): Promise<{ username: string; profile: unknown }> {

  const res = await fetch("/api/v1/onboarding/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Profile synthesis failed (${res.status}): ${text}`);
  }
  return (await res.json()) as { username: string; profile: unknown };
}

// ─── Tiny UI primitives ───────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-background p-6 shadow-sm ${className ?? ""}`}>
      {children}
    </div>
  );
}

function Btn({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const cls =
    variant === "primary"
      ? `${base} bg-foreground text-background hover:opacity-90`
      : `${base} border border-border hover:bg-muted`;
  return (
    <button {...props} className={`${cls} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: CategoryStatus }) {
  const map: Record<CategoryStatus, { label: string; color: string }> = {
    idle: { label: "Waiting", color: "text-muted-foreground" },
    uploading: { label: "Uploading…", color: "text-blue-500" },
    analysing: { label: "Analysing...", color: "text-yellow-500" },
    done: { label: "Done ✓", color: "text-green-500" },
    error: { label: "Error", color: "text-red-500" },
  };
  const { label, color } = map[status];
  return <span className={`text-xs font-medium ${color}`}>{label}</span>;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-foreground/60"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Video file picker component ──────────────────────────────────────────────

function VideoPicker({
  label,
  description,
  files,
  onChange,
  status,
  disabled,
}: {
  label: string;
  description: string;
  files: File[];
  onChange: (files: File[]) => void;
  status: CategoryStatus;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 cursor-pointer hover:bg-muted/50 transition"
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(e) => onChange(Array.from(e.target.files ?? []).slice(0, 3))}
        />
        {files.length === 0 ? (
          <p className="text-xs text-muted-foreground">Click to select up to 3 videos</p>
        ) : (
          <ul className="w-full space-y-1">
            {files.map((f, i) => (
              <li key={i} className="text-xs truncate text-muted-foreground">
                {i + 1}. {f.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-right">{files.length}/3 selected</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ConversationPage() {
  const router = useRouter();
  const { email: userEmail } = useUserStore();
  

  // UI step
  const [step, setStep] = useState<AppStep>("upload");
  const [errorMsg, setErrorMsg] = useState<string>("");


  const { username: rawUsername, setUsername } = useUserStore();
  const username = rawUsername ?? "";

  // Files
  const [tasteFiles, setTasteFiles] = useState<File[]>([]);
  const [perfFiles, setPerfFiles] = useState<File[]>([]);
  const [lowPerfFiles, setLowPerfFiles] = useState<File[]>([]);

  // Per-category upload/analysis status
  const [tasteStatus, setTasteStatus] = useState<CategoryStatus>("idle");
  const [perfStatus, setPerfStatus] = useState<CategoryStatus>("idle");
  const [lowPerfStatus, setLowPerfStatus] = useState<CategoryStatus>("idle");
  const [synthStatus, setSynthStatus] = useState<CategoryStatus>("idle");

  // Stored analyses
  const tasteResultRef = useRef<unknown>(null);
  const perfResultRef = useRef<unknown>(null);
  const lowPerfResultRef = useRef<unknown>(null);

  // Stable session ID (local, just for GCS path naming)
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );

  const canStart =
    username.trim().length > 0 &&
    tasteFiles.length === 3 &&
    perfFiles.length === 3 &&
    lowPerfFiles.length === 3;

  // ── Upload + analyse one category ──────────────────────────────────────────

  async function uploadAndAnalyse(
    mode: AnalysisMode,
    files: File[],
    setStatus: (s: CategoryStatus) => void
  ): Promise<unknown> {
    setStatus("uploading");
    const gcsUris = await uploadThreeVideosToGCS({
      files,
      sessionId: sessionIdRef.current,
      stage: mode,
      userName: username.trim(),
    });


    setStatus("analysing");
    const result = await analyzeVideos(gcsUris, mode);
    setStatus("done");
    return result.analysis;
  }

  // ── Start the full pipeline ─────────────────────────────────────────────────

  async function handleStart() {
    if (!canStart) return;
    setStep("analysing");

    try {
      // Upload + analyse all 3 categories simultaneously
      const [taste, perf, lowPerf] = await Promise.all([
        uploadAndAnalyse("taste", tasteFiles, setTasteStatus),
        uploadAndAnalyse("performance", perfFiles, setPerfStatus),
        uploadAndAnalyse("low_performance", lowPerfFiles, setLowPerfStatus),
      ]);

      tasteResultRef.current = taste;
      perfResultRef.current = perf;
      lowPerfResultRef.current = lowPerf;

      // ── Synthesize profile ─────────────────────────────────────────────────
      setStep("synthesizing");
      setSynthStatus("analysing");

      // The videos endpoint returns plain strings; wrap each so the profile
      // endpoint receives the required dicts (it JSON-serialises them internally).
      const wrapAnalysis = (v: unknown) =>
        typeof v === "string" ? { analysis: v } : v;

      const { profile } = await synthesizeProfile({
        username: username.trim(),
        taste_profile: wrapAnalysis(taste),
        performance_insights: wrapAnalysis(perf),
        low_performance_insights: wrapAnalysis(lowPerf),
      });

      setSynthStatus("done");

      // ── Persist user row ───────────────────────────────────────────────────
      try {
        const session = await authClient.getSession();
        const sessionEmail = session?.data?.user?.email ?? userEmail ?? undefined;

        // Update auth display name
        authClient.updateUser({ name: username.trim() }).catch(console.error);

        await createOrUpdateUser({
          username: username.trim(),
          email: sessionEmail,
          recommendation_json: profile,
        });
      } catch (e) {
        console.error("[onboarding] Failed to persist user:", e);
      }

      setStep("done");

      setTimeout(() => {
        router.push(`/profile/${encodeURIComponent(username.trim())}`);
      }, 2000);
    } catch (e: unknown) {
      console.error("[onboarding] Pipeline error:", e);
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStep("error");
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-2xl flex-col items-center justify-center gap-6 p-4">
      {/* ── Step: Upload ─────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="w-full space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">Build your creator profile</h1>
            <p className="text-sm text-muted-foreground">
              Upload 3 videos for each category. We'll analyse them together to map your creative
              identity.
            </p>
          </div>

          <Card>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="username-input">
                Your username
              </label>
              <input
                id="username-input"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </Card>

          <div className="grid gap-4">
            <VideoPicker
              label="Taste videos"
              description="3 videos that feel most 'you' — content you love making"
              files={tasteFiles}
              onChange={setTasteFiles}
              status={tasteStatus}
              disabled={false}
            />
            <VideoPicker
              label="Best-performing videos"
              description="3 videos that got the most views or engagement"
              files={perfFiles}
              onChange={setPerfFiles}
              status={perfStatus}
              disabled={false}
            />
            <VideoPicker
              label="Low-performing videos"
              description="3 videos that underperformed — helps identify growth areas"
              files={lowPerfFiles}
              onChange={setLowPerfFiles}
              status={lowPerfStatus}
              disabled={false}
            />
          </div>

          <Btn className="w-full" disabled={!canStart} onClick={handleStart}>
            Analyse my profile →
          </Btn>

          {!canStart && (
            <p className="text-center text-xs text-muted-foreground">
              Enter your username and select exactly 3 videos per category to continue.
            </p>
          )}
        </div>
      )}

      {/* ── Step: Analyzing ──────────────────────────────────────── */}
      {step === "analysing" && (
        <div className="w-full space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">Analysing your content…</h1>
            <p className="text-sm text-muted-foreground">
              Uploading and analysing all three categories simultaneously. This may take a minute.
            </p>
          </div>

          <Card className="space-y-4">
            {(
              [
                { label: "Taste videos", status: tasteStatus },
                { label: "Best-performing videos", status: perfStatus },
                { label: "Low-performing videos", status: lowPerfStatus },
              ] as { label: string; status: CategoryStatus }[]
            ).map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-2">
                  {(status === "uploading" || status === "analysing") && <Spinner />}
                  <StatusBadge status={status} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── Step: Synthesizing ───────────────────────────────────── */}
      {step === "synthesizing" && (
        <div className="w-full space-y-6">
          <Card className="flex flex-col items-center gap-4 py-10">
            <Spinner />
            <div className="text-center space-y-1">
              <p className="text-base font-semibold">Building your creator profile…</p>
              <p className="text-sm text-muted-foreground">
                Synthesising insights from all three analyses.
              </p>
            </div>
            <StatusBadge status={synthStatus} />
          </Card>
        </div>
      )}

      {/* ── Step: Done ───────────────────────────────────────────── */}
      {step === "done" && (
        <div className="w-full">
          <Card className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="text-4xl">🎉</div>
            <div className="space-y-1">
              <p className="text-xl font-bold">Profile created!</p>
              <p className="text-sm text-muted-foreground">
                Redirecting you to your creator profile…
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ── Step: Error ──────────────────────────────────────────── */}
      {step === "error" && (
        <div className="w-full space-y-4">
          <Card className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="text-3xl">⚠️</div>
            <p className="text-base font-semibold text-red-500">Something went wrong</p>
            <p className="text-sm text-muted-foreground max-w-sm">{errorMsg}</p>
          </Card>
          <Btn
            variant="outline"
            className="w-full"
            onClick={() => {
              setStep("upload");
              setTasteStatus("idle");
              setPerfStatus("idle");
              setLowPerfStatus("idle");
              setSynthStatus("idle");
              setErrorMsg("");
            }}
          >
            Try again
          </Btn>
        </div>
      )}
    </div>
  );
}
