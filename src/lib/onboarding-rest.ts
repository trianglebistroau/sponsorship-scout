// src/lib/adCrawler.ts
export type OnboardingStage = "taste" | "performance" | "low_performance";

type OnboardingStateMessage = { role: string; content: string; timestamp?: string | null };

export type OnboardingStateSnapshot = {
  session_id: string;
  has_checkpoint: boolean;
  values: {
    current_part: number;
    user_name?: string | null;
    confirmed?: "true" | "false" | "add";

    taste_video_count: number;
    taste_has_analysis: boolean;
    taste_confirmed: boolean;

    performance_video_count: number;
    performance_has_analysis: boolean;
    performance_confirmed: boolean;

    low_performance_video_count: number;
    low_performance_has_analysis: boolean;
    low_performance_confirmed: boolean;

    goal_confirmed: boolean;
    has_final_profile: boolean;
    is_complete: boolean;
  };
  messages: OnboardingStateMessage[];
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${url} failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

export async function createOnboardingSession(initialMessage?: string) {
  return postJson<{ session_id: string }>("/api/v1/onboarding/session/create", {
    initial_message: initialMessage ?? null,
  });
}

export async function startOnboardingSession(sessionId: string) {
  return postJson<{ status: string }>(`/api/v1/onboarding/${sessionId}/start`, {});
}

export async function sendOnboardingMessage(sessionId: string, content: string) {
  return postJson<{ status: string }>(`/api/v1/onboarding/${sessionId}/message`, { content });
}

export async function submitOnboardingVideos(sessionId: string, stage: OnboardingStage, gcsUris: string[]) {
  return postJson<{ status: string }>(`/api/v1/onboarding/${sessionId}/videos/submit`, {
    stage,
    gcs_uris: gcsUris,
  });
}

export async function confirmOnboarding(
  sessionId: string,
  confirmed: "true" | "false" | "add",
  content?: string
) {
  return postJson<{ status: string }>(`/api/v1/onboarding/${sessionId}/confirm`, {
    confirmed,
    content: content ?? null,
  });
}

export async function getOnboardingState(sessionId: string) {
  return getJson<OnboardingStateSnapshot>(`/api/v1/onboarding/${sessionId}/state`);
}
