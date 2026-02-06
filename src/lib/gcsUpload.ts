// src/lib/gcsUpload.ts
import type { OnboardingStage } from "./onboarding-rest";

type UploadOk = {
  ok: true;
  gcsUri: string;
  bucket: string;
  objectPath: string;
  contentType: string;
  size: number;
  sessionId?: string;
  stage?: string;
};

type UploadErr = { ok: false; error: string };

export async function uploadOneVideoToGCS(params: {
  file: File;
  sessionId: string;
  stage: OnboardingStage;
  stageIndex: number;
  userName?: string;
}): Promise<string> {
  const fd = new FormData();
  fd.append("file", params.file);
  fd.append("sessionId", params.sessionId);
  fd.append("stage", params.stage);
  fd.append("stageIndex", String(params.stageIndex));
  if (params.userName) fd.append("userName", params.userName);

  const res = await fetch("/api/upload/gcs", { method: "PUT", body: fd });
  const json = (await res.json().catch(() => null)) as UploadOk | UploadErr | null;

  if (!res.ok || !json || (json as any).ok !== true) {
    const msg = (json as any)?.error || `Upload failed (${res.status})`;
    throw new Error(msg);
  }

  return (json as UploadOk).gcsUri;
}

export async function uploadThreeVideosToGCS(params: {
  files: File[];
  sessionId: string;
  stage: OnboardingStage;
  userName?: string;
  onProgress?: (p: { uploaded: number; total: number }) => void;
}): Promise<string[]> {
  const files = params.files.slice(0, 3);
  if (files.length < 3) throw new Error("Need 3 videos");

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
