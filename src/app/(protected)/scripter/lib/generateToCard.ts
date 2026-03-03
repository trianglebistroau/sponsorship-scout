import { callGenerate } from "@/lib/generate-api";
import type { IdeaData } from "../components/Card";

/** Strip Unicode surrogate characters that cause UTF-8 encode errors on the backend. */
function stripSurrogates(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\uD800-\uDFFF]/g, "");
}

function sanitizePayload<T extends { user_profile: string; macro_themes: string[]; user_prompt?: string; current_feedback?: string }>(p: T): T {
  return {
    ...p,
    user_profile: stripSurrogates(p.user_profile),
    macro_themes: p.macro_themes.map(stripSurrogates),
    ...(p.user_prompt !== undefined && { user_prompt: stripSurrogates(p.user_prompt) }),
    ...(p.current_feedback !== undefined && { current_feedback: stripSurrogates(p.current_feedback) }),
  };
}

type VideoIdea = {
  title: string;
  hook: string;
  tags?: string[];
  script_outline: string;
  estimated_length?: string;
};

function stripQuotes(s: string): string {
  return s.trim().replace(/^"|"$/g, "").trim();
}

function extractBeats(scriptOutline: string): string[] {
  const beats: string[] = [];
  const lines = scriptOutline.split("\n").map((l) => l.trim());

  // Prefer time-beat lines like: **0:00-0:03 - The Hook**
  for (const line of lines) {
    const m = line.match(/^\*\*([^*]{3,80})\*\*/);
    if (m?.[1]) {
      const label = m[1].trim();
      if (label && !beats.includes(label)) beats.push(label);
      if (beats.length >= 3) return beats;
    }
  }

  // Next: headings (## / ###)
  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("### ")) {
      const label = line.replace(/^#{2,3}\s+/, "").replace(/\*\*/g, "").trim();
      if (label && !beats.includes(label)) beats.push(label);
      if (beats.length >= 3) return beats;
    }
  }

  return ["Hook", "Build", "Payoff"];
}

function findIdeaInState(state: any): VideoIdea | null {
  const seen = new Set<any>();

  function dfs(x: any): VideoIdea | null {
    if (!x || typeof x !== "object") return null;
    if (seen.has(x)) return null;
    seen.add(x);

    if (
      typeof x.title === "string" &&
      typeof x.hook === "string" &&
      typeof x.script_outline === "string"
    ) {
      return x as VideoIdea;
    }

    for (const v of Object.values(x)) {
      const found = dfs(v);
      if (found) return found;
    }
    return null;
  }

  return dfs(state);
}

export interface GenerateCardResult {
  card: IdeaData;
  sessionId: string;
}

async function doGenerate(
  payload: Parameters<typeof callGenerate>[0],
  nextId: number,
  macroThemes: string[]
): Promise<GenerateCardResult> {
  const response = await callGenerate(sanitizePayload(payload));

  console.log("[generateNextCard] API response:", {
    session_id: response.session_id,
    status: response.status,
    has_idea: !!response.generated_idea,
  });

  if (response.status === "error" || response.error) {
    throw new Error(response.error || "Generation failed with unknown error");
  }

  const structuredIdea = findIdeaInState(response.generated_idea);
  console.log("[generateNextCard] structuredIdea resolved:", structuredIdea);

  if (!structuredIdea) {
    throw new Error("Generation finished but generated_idea was not found.");
  }

  const beats = extractBeats(structuredIdea.script_outline);
  console.log("[generateNextCard] Extracted beats:", beats);

  const card: IdeaData = {
    id: nextId,
    title: structuredIdea.title.trim() || "Generated Idea",
    hook: stripQuotes(structuredIdea.hook) || "—",
    beats,
    rationale: `Generated from themes: ${macroThemes.join(", ")}`,
    contentMd: structuredIdea.script_outline,
    tags: Array.isArray(structuredIdea.tags) ? structuredIdea.tags : [],
    estimatedLength: structuredIdea.estimated_length,
    status: "shown",
  };

  console.log("[generateNextCard] Card built:", card);
  return { card, sessionId: response.session_id };
}

export async function generateNextCard(params: {
  user_profile: string;
  macro_themes: string[];
  user_prompt?: string;
  nextId: number;
  /** Pass the saved session_id to reuse the same LangGraph thread */
  threadId?: string;
  /** true = regenerate with feedback, false = accept/end session, undefined = new session */
  resume?: boolean;
  /** Feedback text when resume=true */
  currentFeedback?: string;
}): Promise<GenerateCardResult> {
  console.log("[generateNextCard] Calling generate API:", {
    macro_themes: params.macro_themes,
    user_prompt: params.user_prompt,
    nextId: params.nextId,
    thread_id: params.threadId,
    resume: params.resume,
    has_feedback: !!params.currentFeedback,
  });

  const basePayload = {
    user_profile: params.user_profile,
    macro_themes: params.macro_themes,
    user_prompt: params.user_prompt,
    thread_id: params.threadId,
    resume: params.resume,
    current_feedback: params.currentFeedback,
  };

  // If resuming an existing session, fall back to a fresh session on error
  if (params.threadId) {
    try {
      return await doGenerate(basePayload, params.nextId, params.macro_themes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        "[generateNextCard] Resuming session failed, starting fresh session:",
        msg
      );
      // Fall through to new session
    }
  }

  // New session (no thread_id)
  return await doGenerate(
    {
      user_profile: params.user_profile,
      macro_themes: params.macro_themes,
      user_prompt: params.user_prompt,
    },
    params.nextId,
    params.macro_themes
  );
}
