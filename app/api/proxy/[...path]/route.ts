import { NextRequest, NextResponse } from "next/server";

const DEFAULT_RUNNER_URL = "http://localhost:8799";

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const subPath = resolvedParams.path ? resolvedParams.path.join("/") : "";
  const targetHost = req.headers.get("x-target-runner") || process.env.POLYSWITCH_RUNNER_URL || DEFAULT_RUNNER_URL;
  let cleanTargetHost = targetHost.replace(/\/+$/, "");
  
  // Resolve localhost to 127.0.0.1 on Node.js to avoid Windows IPv6 ::1 ECONNREFUSED
  const resolvedHost = cleanTargetHost.replace(/^http:\/\/localhost(?=[:/]|$)/i, "http://127.0.0.1");

  // Construct full target URL including query parameters
  const urlObj = new URL(req.url);
  const searchParams = urlObj.search;
  const targetUrl = `${resolvedHost}/${subPath}${searchParams}`;

  // Forward incoming headers (filtering out host and nextjs internals)
  const forwardHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey !== "host" &&
      lowerKey !== "x-target-runner" &&
      !lowerKey.startsWith("x-forwarded-")
    ) {
      forwardHeaders[key] = value;
    }
  });

  const method = req.method;
  let body: BodyInit | undefined = undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  try {
    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(targetUrl, {
        method,
        headers: forwardHeaders,
        body,
        // @ts-ignore - duplex is supported in modern Node fetch
        duplex: "half",
      });
    } catch (primaryErr: any) {
      // If IPv4 127.0.0.1 failed and original had localhost (or vice versa), try fallback
      if (resolvedHost !== cleanTargetHost) {
        const fallbackUrl = `${cleanTargetHost}/${subPath}${searchParams}`;
        upstreamRes = await fetch(fallbackUrl, {
          method,
          headers: forwardHeaders,
          body,
          // @ts-ignore
          duplex: "half",
        });
      } else {
        throw primaryErr;
      }
    }

    // Handle SSE streams or regular responses
    const contentType = upstreamRes.headers.get("content-type") || "";
    const isStream = contentType.includes("text/event-stream");

    const responseHeaders = new Headers();
    upstreamRes.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // Ensure permissive CORS for proxy
    responseHeaders.set("access-control-allow-origin", "*");
    responseHeaders.set("access-control-allow-methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    responseHeaders.set("access-control-allow-headers", "*");

    if (isStream && upstreamRes.body) {
      return new NextResponse(upstreamRes.body as any, {
        status: upstreamRes.status,
        headers: responseHeaders,
      });
    }

    const data = await upstreamRes.arrayBuffer();
    return new NextResponse(data, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: `Could not reach Polyswitch Runner at ${cleanTargetHost}`,
        details: err?.message || String(err),
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "access-control-allow-headers": "*",
    },
  });
}
