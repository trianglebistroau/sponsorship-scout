import type { IdeaData } from "../components/Card";
import { createGenerateSession } from "@/lib/generate-api";
import { GenerateWebSocket } from "@/lib/generate-websocket";

type VideoIdea = {
  title: string;
  hook: string;
  script_outline: string;
  estimated_length?: string;
};

function extractBeats(scriptOutline: string): string[] {
  const headings = scriptOutline
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("## "))
    .map((l) => l.replace(/^##\s+/, ""));
  return headings.length ? headings.slice(0, 3) : ["Hook", "Build", "Payoff"];
}

/**
 * Robustly find an object anywhere in `state` that looks like a VideoIdea
 */
function findIdeaInState(state: any): VideoIdea | null {
  const seen = new Set<any>();

  function dfs(x: any): VideoIdea | null {
    if (!x || typeof x !== "object") return null;
    if (seen.has(x)) return null;
    seen.add(x);

    // Looks like idea?
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

function pickTitle(md: string): string {
  // matches: **Title**: My Secret to a Healthy $2 Lunch in 5 Minutes!
  const m = md.match(/^\*\*Title\*\*:\s*(.+)$/m);
  if (m?.[1]) return m[1].trim();

  // fallback: matches markdown heading: ### **Video Idea 1: ...**
  const h = md.match(/^###\s+\*\*(.+?)\*\*/m);
  if (h?.[1]) return h[1].trim();

  return "Generated Idea";
}

function pickHook(md: string): string {
  const m = md.match(/^\*\*Hook\*\*:\s*(.+)$/m);
  if (m?.[1]) return m[1].replace(/^"|"$/g, "").trim();

  // fallback: first quoted line
  const q = md.match(/"([^"]{10,200})"/);
  if (q?.[1]) return q[1].trim();

  return "—";
}

function pickBeats(md: string): string[] {
  // quick heuristic: grab a few bold bullet-ish lines or headings
  const beats: string[] = [];

  // capture table row labels like **0-3s (Hook)** etc (from your response file)
  const rowLabels = Array.from(md.matchAll(/^\|\s+\*\*([^*]+)\*\*\s+\|/gm)).map(x => x[1].trim());
  for (const r of rowLabels) {
    if (!beats.includes(r)) beats.push(r);
    if (beats.length >= 3) break;
  }

  if (beats.length) return beats;

  // fallback to headings
  const headings = Array.from(md.matchAll(/^####\s+(.+)$/gm)).map(x => x[1].trim());
  return headings.slice(0, 3).length ? headings.slice(0, 3) : ["Hook", "Build", "Payoff"];
}


export async function generateNextCard(params: {
  user_profile: string;
  macro_themes: string[];
  user_prompt?: string;
  nextId: number;
}): Promise<IdeaData> {

    const { session_id } = await createGenerateSession({
    user_profile: params.user_profile,
    macro_themes: params.macro_themes,
    user_prompt: params.user_prompt,
  });

  return await new Promise<IdeaData>((resolve, reject) => {
      let unstructuredMd: string | null = null;

const ws = new GenerateWebSocket({
    sessionId: session_id,

    onNodeComplete: (node, state) => {
        if (node === "generate_unstructured" && typeof state?.unstructured_ideas === "string") {
        unstructuredMd = state.unstructured_ideas;
        }
    },

    onComplete: () => {
        if (!unstructuredMd) {
        ws.disconnect();
        reject(new Error("Generation finished but unstructured_ideas was not found."));
        return;
        }

        const md = unstructuredMd;

        const card: IdeaData = {
        id: params.nextId,
        title: pickTitle(md),
        hook: pickHook(md),
        beats: pickBeats(md),
        rationale: `Generated from themes: ${params.macro_themes.join(", ")}`,
        contentMd: md,
        status: "shown",
        };

        ws.disconnect();
        resolve(card);
    },

    onError: (msg) => {
        ws.disconnect();
        reject(new Error(msg));
    },
    });

    ws.connect();
    
      // Wait a tick for connect, then start
    const startInterval = setInterval(() => {
    if (ws.isConnected()) {
        clearInterval(startInterval);
        ws.start();
    }
    }, 50);
});
}
