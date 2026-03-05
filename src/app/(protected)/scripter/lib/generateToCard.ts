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
  music_suggestions?: string;
  caption?: string;
};

function stripQuotes(s: string): string {
  return s.trim().replace(/^"|"$/g, "").trim();
}
/**
 * Extracts "Music Suggestions", "Caption" / "Hashtags" from the markdown.
 * Handles both heading-delimited sections (## Music Suggestions)
 * and inline label formats (**Music Suggestions:** / Music Suggestions:).
 * Returns clean strings and a contentMd with those sections stripped out.
 */
function extractSectionsFromMd(md: string): {
  musicSuggestions?: string;
  caption?: string;
  cleanedMd: string;
} {
  let text = md.replace(/\r\n/g, "\n");

  let musicSuggestions: string | undefined;
  let caption: string | undefined;

  // ── 1. Heading-delimited sections ───────────────────────────────────────
  // Split on any line that starts with # (top-level or sub) so we can scan blocks.
  // We capture the heading line + everything until the next same-or-higher heading.
  const headingBlockRe =
    /^(#{1,3}[ \t]+(.+?))[ \t]*\n([\s\S]*?)(?=^#{1,3}[ \t]|(?![\s\S]))/gim;

  const headingBlocks: { heading: string; body: string; raw: string }[] = [];
  let hm: RegExpExecArray | null;
  while ((hm = headingBlockRe.exec(text)) !== null) {
    headingBlocks.push({
      heading: hm[2].trim().toLowerCase(),
      body: hm[3].trim(),
      raw: hm[0],
    });
  }

  // ── 2. Bold-label or plain inline sections ───────────────────────────────
  // Handles: **Music Suggestions:** body  OR  Music Suggestions: body
  // The (?:\*{1,2})?[ \t]*\n? after the colon consumes any closing ** and the
  // label-only line break so the body starts on the actual content, not "**".
  const inlineLabelRe =
    /^[ \t]*(?:\*{1,2})?(music\s+suggestions?|caption|hashtags?)(?:\*{1,2})?[ \t]*:[ \t]*(?:\*{1,2})?[ \t]*\n?([\s\S]*?)(?=\n[ \t]*\n|\n[ \t]*(?:\*{1,2})?(?:music\s+suggestions?|caption|hashtags?|primary|alternative|hook|script|beats?|tags?)(?:\*{1,2})?[ \t]*:|$)/gim;

  const inlineMatches: { key: string; body: string; raw: string }[] = [];
  let im: RegExpExecArray | null;
  while ((im = inlineLabelRe.exec(text)) !== null) {
    // Strip any stray leading ** left over from bold-label formatting (e.g. "**Music Suggestions:**\n**...")
    const body = im[2].trim().replace(/^\*{1,2}/, "").trim();
    inlineMatches.push({
      key: im[1].trim().toLowerCase(),
      body,
      raw: im[0],
    });
  }

  // ── 3. Assign values (heading blocks take precedence over inline) ────────
  const musicHeading = headingBlocks.find((b) => b.heading.includes("music"));
  const captionHeading = headingBlocks.find((b) => b.heading === "caption");
  const hashtagHeading = headingBlocks.find((b) =>
    b.heading.includes("hashtag")
  );

  if (musicHeading) musicSuggestions = musicHeading.body;
  if (captionHeading) caption = captionHeading.body;
  if (hashtagHeading && !caption) caption = hashtagHeading.body;

  for (const im of inlineMatches) {
    if (im.key.includes("music") && !musicSuggestions && im.body)
      musicSuggestions = im.body;
    if (im.key === "caption" && im.body) caption = im.body;
    if (im.key.includes("hashtag") && !caption && im.body)
      caption = im.body;
  }

  // ── 4. Strip the extracted blocks from the markdown ─────────────────────
  let cleanedMd = text;

  const rawsToStrip = [
    ...(musicHeading ? [musicHeading.raw] : []),
    ...(captionHeading ? [captionHeading.raw] : []),
    ...(hashtagHeading ? [hashtagHeading.raw] : []),
    ...inlineMatches.map((im) => im.raw),
  ];

  for (const raw of rawsToStrip) {
    cleanedMd = cleanedMd.split(raw).join("");
  }

  // Remove orphaned section headings and tidy whitespace
  cleanedMd = cleanedMd
    .replace(
      /^#{1,3}[ \t]+(music\s+suggestions?|caption|hashtags?)[ \t]*\n?/gim,
      ""
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // ── 5. Fallback: bare "Primary:" / "Alternative:" block after --- separator ─
  // Handles the case where the music section has no explicit heading label,
  // just a --- rule followed by bullet lines starting with "Primary:" / "Alternative:".
  if (!musicSuggestions) {
    const hrBlockRe = /^---[ \t]*\n((?:[ \t]*[-*][ \t]+(?:Primary|Alternative)[^\n]*\n?)+)/gim;
    let hrm: RegExpExecArray | null;
    while ((hrm = hrBlockRe.exec(cleanedMd)) !== null) {
      musicSuggestions = hrm[1].trim();
      cleanedMd = cleanedMd.split(hrm[0]).join("").replace(/\n{3,}/g, "\n\n").trim();
      break;
    }
  }

  return { musicSuggestions, caption, cleanedMd };
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



  if (response.status === "error" || response.error) {
    throw new Error(response.error || "Generation failed with unknown error");
  }

  const structuredIdea = findIdeaInState(response.generated_idea);

  if (!structuredIdea) {
    throw new Error("Generation finished but generated_idea was not found.");
  }

  const beats = extractBeats(structuredIdea.script_outline);

  const { musicSuggestions, caption, cleanedMd } = extractSectionsFromMd(structuredIdea.script_outline);

  const card: IdeaData = {
    id: nextId,
    title: structuredIdea.title.trim() || "Generated Idea",
    hook: stripQuotes(structuredIdea.hook) || "—",
    beats,
    rationale: `Generated from themes: ${macroThemes.join(", ")}`,
    contentMd: cleanedMd,
    tags: Array.isArray(structuredIdea.tags) ? structuredIdea.tags : [],
    estimatedLength: structuredIdea.estimated_length,
    // Parsed from markdown first; fall back to top-level JSON fields if present
    musicSuggestions: musicSuggestions || structuredIdea.music_suggestions,
    caption: caption || structuredIdea.caption,
    status: "shown",
  };

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
