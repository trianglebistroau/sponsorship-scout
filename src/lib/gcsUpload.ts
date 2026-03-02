// src/lib/gcsUpload.ts
import type { OnboardingStage } from "./onboarding-rest";

type SignedUrlOk = {
  ok: true;
  signedUrl: { url: string; fields: Record<string, string> };
  gcsUri: string;
  objectPath: string;
  contentType: string;
};

type UploadErr = { ok: false; error: string };

export async function uploadOneVideoToGCS(params: {
  file: File;
  sessionId: string;
  stage: OnboardingStage;
  stageIndex: number;
  userName?: string;
}): Promise<string> {
  // Step 1: Ask the API for a signed URL (tiny JSON request, no file bytes)
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

  const { url, fields } = (meta as SignedUrlOk).signedUrl;

  // Step 2: Upload the file directly to GCS using the signed POST policy
  // This bypasses Vercel's 4.5 MB serverless body limit entirely.
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  fd.append("file", params.file); // must be last per GCS signed-POST spec

  const uploadRes = await fetch(url, { method: "POST", body: fd });
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(`GCS upload failed (${uploadRes.status}): ${text}`);
  }

  return (meta as SignedUrlOk).gcsUri;
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
