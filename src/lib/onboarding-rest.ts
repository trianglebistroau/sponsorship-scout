// src/lib/adCrawler.ts
export type OnboardingStage = "taste" | "performance" | "low_performance";

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

export async function createOnboardingSession(initialMessage?: string) {
  return postJson<{ session_id: string }>("/api/v1/onboarding/session/create", {
    initial_message: initialMessage ?? null,
  });
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
