const API_BASE = "/api/v1/generate";

export interface GenerateRequest {
  user_profile: string;
  macro_themes: string[];
  user_prompt?: string;
  thread_id?: string;
  resume?: boolean;
  current_feedback?: string;
}

export interface GenerateResponse {
  session_id: string;
  status: "active" | "completed" | "error";
  created_at: string;
  updated_at: string;
  generated_idea?: Record<string, unknown>;
  error?: string;
}

export async function callGenerate(
  payload: GenerateRequest
): Promise<GenerateResponse> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Generate API error (${res.status}): ${text}`);
  }

  return res.json();
}
