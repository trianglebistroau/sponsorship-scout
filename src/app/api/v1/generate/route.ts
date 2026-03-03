import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const backendUrl =
  process.env.NODE_ENV === "production"
    ? process.env.BACKEND_URL_PROD
    : process.env.BACKEND_URL_DEV || "http://localhost:8000";

export async function POST(req: NextRequest) {
  if (!backendUrl) {
    return NextResponse.json({ error: "Backend URL not configured" }, { status: 503 });
  }

  const body = await req.arrayBuffer();

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "accept-encoding") return;
    headers.set(key, value);
  });

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/api/v1/generate`, {
      method: "POST",
      headers,
      body: Buffer.from(body),
      // @ts-expect-error Node 18+ fetch duplex
      duplex: "half",
      signal: AbortSignal.timeout(55_000),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[proxy /api/v1/generate]", msg);
    return NextResponse.json({ error: "Failed to reach backend", detail: msg }, { status: 502 });
  }

  const resHeaders = new Headers();
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (["transfer-encoding", "connection", "keep-alive", "content-encoding"].includes(lower)) return;
    resHeaders.set(key, value);
  });

  const data = await response.arrayBuffer();
  return new NextResponse(data, {
    status: response.status,
    headers: resHeaders,
  });
}
