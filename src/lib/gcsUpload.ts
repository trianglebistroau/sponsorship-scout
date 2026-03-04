// src/lib/gcsUpload.ts
import type { OnboardingStage } from "./onboarding-rest";

type SignedUrlOk = {
  ok: true;
  signedUrl: string; // plain PUT URL
  gcsUri: string;
  objectPath: string;
  contentType: string;
};

type UploadErr = { ok: false; error: string };

/** PUT the raw file bytes to GCS with exponential-backoff retries. */
async function putWithRetry(
  signedUrl: string,
  file: File,
  contentType: string,
  maxAttempts = 3
): Promise<void> {
  let lastErr: Error = new Error("Upload failed");
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (res.ok) return; // 200 — upload complete
      const text = await res.text().catch(() => "");
      lastErr = new Error(`GCS upload failed (${res.status}): ${text}`);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
    if (attempt < maxAttempts - 1) {
      // Exponential backoff: 1 s, 2 s
      await new Promise((r) => setTimeout(r, 1_000 * 2 ** attempt));
      console.warn(`[gcsUpload] Retrying upload (attempt ${attempt + 2}/${maxAttempts})…`);
    }
  }
  throw lastErr;
}

export async function uploadOneVideoToGCS(params: {
  file: File;
  sessionId: string;
  stage: OnboardingStage;
  stageIndex: number;
  userName?: string;
}): Promise<string> {
  // Step 1: Ask our API for a signed PUT URL (tiny JSON round-trip, no file bytes)
  const metaRes = await fetch("/api/upload/gcs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: params.sessionId,
      stage: params.stage,
      stageIndex: params.stageIndex,
      userName: params.userName ?? "",
      fileName: params.file.name,
      contentType: params.file.type || "video/mp4",
    }),
  });

  const meta = (await metaRes.json().catch(() => null)) as SignedUrlOk | UploadErr | null;
  if (!metaRes.ok || !meta || (meta as any).ok !== true) {
    const msg = (meta as any)?.error || `Failed to get upload URL (${metaRes.status})`;
    throw new Error(msg);
  }

  const { signedUrl, contentType, gcsUri } = meta as SignedUrlOk;

  console.log(`[gcsUpload] Uploading "${params.file.name}" → ${gcsUri}`);

  // Step 2: PUT the raw file bytes directly to GCS (bypasses Vercel's 4.5 MB limit).
  // Retries up to 3 times with exponential backoff before throwing.
  await putWithRetry(signedUrl, params.file, contentType);

  console.log(`[gcsUpload] Upload complete: ${gcsUri}`);
  return gcsUri;
}

export async function uploadThreeVideosToGCS(params: {
  files: File[];
  sessionId: string;
  stage: OnboardingStage;
  userName?: string;
  onProgress?: (p: { uploaded: number; total: number }) => void;
}): Promise<string[]> {
  // DEBUG: relaxed to 1+ during testing (was: slice(0,3) + require 3)
  const files = params.files.slice(0, 3);
  if (files.length < 3) throw new Error("Need exactly 3 videos");

  const out: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const uri = await uploadOneVideoToGCS({
      file: files[i],
      sessionId: params.sessionId,
      stage: params.stage,
      stageIndex: i,
      userName: params.userName,
    });
    out.push(uri);
    params.onProgress?.({ uploaded: i + 1, total: files.length });
  }
  return out;
}
