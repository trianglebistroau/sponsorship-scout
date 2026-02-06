import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import crypto from "crypto";

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
  // avoid leading slashes, weird traversal, etc.
  const p = input.trim().replace(/^\/+/, "");
  if (!p || p.includes("..")) return null;
  return p;
}

export async function PUT(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file", received: { keys: Array.from(form.keys()) } },
        { status: 400 }
      );
    }

    // Required for onboarding mapping
    const sessionIdRaw = form.get("sessionId");
    const stageRaw = form.get("stage"); // taste | performance | low_performance

    // Optional, purely for path readability
    const userNameRaw = form.get("userName");
    const stageIndexRaw = form.get("stageIndex"); // "0" | "1" | "2" etc

    // Optional: allow caller to provide exact objectPath
    const objectPathRaw = form.get("objectPath");

    const sessionId =
      typeof sessionIdRaw === "string" && sessionIdRaw.trim() ? sessionIdRaw.trim() : null;

    const stage =
      typeof stageRaw === "string" && stageRaw.trim() ? slugify(stageRaw) : null;

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400 });
    }
    if (!stage || !ALLOWED_STAGES.has(stage)) {
      return NextResponse.json(
        { ok: false, error: `Invalid stage. Must be one of: ${Array.from(ALLOWED_STAGES).join(", ")}` },
        { status: 400 }
      );
    }

    const userName =
      typeof userNameRaw === "string" && userNameRaw.trim()
        ? slugify(userNameRaw)
        : "anonymous";

    const stageIndex =
      typeof stageIndexRaw === "string" && stageIndexRaw.trim()
        ? slugify(stageIndexRaw)
        : "";

    let objectPath: string | null = null;

    if (typeof objectPathRaw === "string" && objectPathRaw.trim()) {
      objectPath = safePath(objectPathRaw);
      if (!objectPath) {
        return NextResponse.json({ ok: false, error: "Invalid objectPath" }, { status: 400 });
      }
    } else {
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const rand = crypto.randomBytes(8).toString("hex");
      const filename = safeFileName(file.name);

      // ✅ IMPORTANT: include sessionId + stage in object path
      // This makes it trivial for FE to send gs://... to ad-crawler for the right session/stage.
      objectPath = `onboarding/${sessionId}/${stage}/${userName}/${ts}-${stageIndex}-${rand}-${filename}`;
    }

    const contentType = file.type || "application/octet-stream";
    const bytes = Buffer.from(await file.arrayBuffer());

    // Guardrail: don't accept huge uploads via server route (optional but recommended)
    // Example: 200MB max. Adjust as needed.
    const maxBytes = 200 * 1024 * 1024;
    if (bytes.length > maxBytes) {
      return NextResponse.json(
        { ok: false, error: `File too large for server upload route (>${maxBytes} bytes)` },
        { status: 413 }
      );
    }

    const bucket = storage.bucket(bucketName);
    const gcsFile = bucket.file(objectPath);

    await gcsFile.save(bytes, {
      resumable: false,
      contentType,
      metadata: { cacheControl: "private, max-age=0, no-transform" },
    });

    const gcsUri = `gs://${bucketName}/${objectPath}`;

    return NextResponse.json({
      ok: true,
      gcsUri,
      bucket: bucketName,
      objectPath,
      contentType,
      size: bytes.length,
      sessionId,
      stage,
    });
  } catch (e: any) {
    console.error("gcs upload error:", e);
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
