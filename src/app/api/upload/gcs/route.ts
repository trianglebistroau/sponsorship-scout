import { Storage } from "@google-cloud/storage";
import crypto from "crypto";
import { NextResponse } from "next/server";

const bucketName = process.env.GCS_BUCKET;
const projectId = process.env.GCP_PROJECT_ID;
const saJson = process.env.GCP_SA_JSON;

if (!bucketName) throw new Error("Missing env GCS_BUCKET");
if (!projectId) throw new Error("Missing env GCP_PROJECT_ID");
if (!saJson) throw new Error("Missing env GCP_SA_JSON");

const storage = new Storage({
  projectId,
  credentials: JSON.parse(saJson),
});

// Allowed onboarding stages (match ad-crawler /videos/submit)
const ALLOWED_STAGES = new Set(["taste", "performance", "low_performance"]);

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function safeFileName(name: string) {
  const base = name.split("/").pop() || "upload.bin";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function safePath(input: string) {
  const p = input.trim().replace(/^\/+/, "");
  if (!p || p.includes("..")) return null;
  return p;
}

/**
 * POST /api/upload/gcs
 * Body (JSON): { sessionId, stage, fileName, contentType, stageIndex?, userName?, objectPath? }
 * Returns: { ok, signedUrl, gcsUri, objectPath }
 *
 * The client then PUTs the raw file bytes directly to `signedUrl` (bypasses Vercel's 4.5 MB limit).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sessionId =
      typeof body.sessionId === "string" && body.sessionId.trim()
        ? body.sessionId.trim()
        : null;
    const stage =
      typeof body.stage === "string" && body.stage.trim() ? slugify(body.stage) : null;

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400 });
    }
    if (!stage || !ALLOWED_STAGES.has(stage)) {
      return NextResponse.json(
        { ok: false, error: `Invalid stage. Must be one of: ${Array.from(ALLOWED_STAGES).join(", ")}` },
        { status: 400 }
      );
    }

    const contentType =
      typeof body.contentType === "string" && body.contentType.trim()
        ? body.contentType.trim()
        : "video/mp4";
    const fileName =
      typeof body.fileName === "string" && body.fileName.trim()
        ? safeFileName(body.fileName)
        : "upload.mp4";
    const userName =
      typeof body.userName === "string" && body.userName.trim()
        ? slugify(body.userName)
        : "anonymous";
    const stageIndex =
      typeof body.stageIndex === "string" || typeof body.stageIndex === "number"
        ? String(body.stageIndex)
        : "";

    let objectPath: string | null = null;
    if (typeof body.objectPath === "string" && body.objectPath.trim()) {
      objectPath = safePath(body.objectPath);
      if (!objectPath) {
        return NextResponse.json({ ok: false, error: "Invalid objectPath" }, { status: 400 });
      }
    } else {
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const rand = crypto.randomBytes(8).toString("hex");
      objectPath = `onboarding/${sessionId}/${stage}/${userName}/${ts}-${stageIndex}-${rand}-${fileName}`;
    }

    const bucket = storage.bucket(bucketName);
    const gcsFile = bucket.file(objectPath);

    // Generate a signed PUT URL valid for 15 minutes.
    // The browser PUTs the raw file bytes directly to GCS — no multipart form,
    // no CORS preflight mismatch with POST policy.
    const [signedUrl] = await gcsFile.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    const gcsUri = `gs://${bucketName}/${objectPath}`;

    return NextResponse.json({
      ok: true,
      signedUrl, // plain string URL — client does PUT
      gcsUri,
      objectPath,
      bucket: bucketName,
      contentType,
      sessionId,
      stage,
    });
  } catch (e: any) {
    console.error("gcs signed-url error:", e);
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
