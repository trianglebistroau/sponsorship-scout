export interface CreateGenerateSessionRequest {
  user_profile: string;
  macro_themes: string[];
  user_prompt?: string;
}

export interface CreateGenerateSessionResponse {
  session_id: string;
}

const API_BASE = "/api/v1/generate";

export async function createGenerateSession(
  payload: CreateGenerateSessionRequest
): Promise<CreateGenerateSessionResponse> {
  const res = await fetch(`${API_BASE}/session/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create generate session (${res.status}): ${text}`);
  }

  return res.json();
}
