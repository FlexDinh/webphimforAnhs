import { NextRequest, NextResponse } from "next/server";

// --- Rate Limiting Types & Store ---
interface RateLimitTracker {
  count: number;
  resetTime: number;
}

// In-memory store for Edge (Note: state is scoped per isolate, so it's not perfect but offers basic protection)
const authRateLimitMap = new Map<string, RateLimitTracker>();
const apiRateLimitMap = new Map<string, RateLimitTracker>();

// Auth Rate Limit Config (5 reqs / 15 mins)
const AUTH_MAX_REQS = 5;
const AUTH_WINDOW_MS = 15 * 60 * 1000;

// API Rate Limit Config (100 reqs / 1 min)
const API_MAX_REQS = 100;
const API_WINDOW_MS = 60 * 1000;

const CEO_AUTH_REALM = "RoPhim CEO";

function getClientIp(req: NextRequest): string {
  // Try to get IP from standard headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  // Fallback
  return "unknown-ip";
}

function checkRateLimit(
  map: Map<string, RateLimitTracker>,
  key: string,
  maxReqs: number,
  windowMs: number
): boolean {
  const now = Date.now();
  let tracker = map.get(key);

  if (!tracker || now > tracker.resetTime) {
    // New or expired window
    tracker = { count: 1, resetTime: now + windowMs };
    map.set(key, tracker);
    return true;
  }

  if (tracker.count >= maxReqs) {
    return false; // Rate limit exceeded
  }

  tracker.count++;
  map.set(key, tracker);
  return true;
}

function cleanupRateLimits() {
  // Clean up expired entries periodically to prevent memory leaks in the isolate
  const now = Date.now();
  for (const [key, tracker] of authRateLimitMap.entries()) {
    if (now > tracker.resetTime) authRateLimitMap.delete(key);
  }
  for (const [key, tracker] of apiRateLimitMap.entries()) {
    if (now > tracker.resetTime) apiRateLimitMap.delete(key);
  }
}

// Trigger cleanup occasionally (not perfectly reliable in edge, but helps)
if (Math.random() < 0.1) cleanupRateLimits();

// --- Auth Utilities ---
function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${CEO_AUTH_REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

function readBasicCredentials(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Basic ")) return null;
  try {
    const decoded = globalThis.atob(authorizationHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) return null;
    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function timingSafeEqualText(leftText: string, rightText: string) {
  const encoder = new TextEncoder();
  const left = encoder.encode(leftText);
  const right = encoder.encode(rightText);
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }
  return result === 0;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = getClientIp(request);

  // --- 1. Rate Limiting ---
  if (pathname.startsWith("/ceo")) {
    const isAllowed = checkRateLimit(authRateLimitMap, `auth-${ip}`, AUTH_MAX_REQS, AUTH_WINDOW_MS);
    if (!isAllowed) {
      return new NextResponse("Too Many Attempts. Please try again later.", { status: 429 });
    }
  } else if (pathname.startsWith("/api/img")) {
    // Images load constantly (e.g. 20-30 posters per page), need higher limit
    const isAllowed = checkRateLimit(apiRateLimitMap, `img-${ip}`, 800, API_WINDOW_MS);
    if (!isAllowed) {
      return new NextResponse("Too Many Image Requests.", { status: 429 });
    }
  } else if (pathname.startsWith("/api/")) {
    const isAllowed = checkRateLimit(apiRateLimitMap, `api-${ip}`, API_MAX_REQS, API_WINDOW_MS);
    if (!isAllowed) {
      return new NextResponse("Too Many Requests.", { status: 429 });
    }
  }

  // --- 2. Security Headers ---
  const response = NextResponse.next();
  // We don't overwrite all headers here to avoid conflicting with next.config.ts,
  // but we can add runtime headers if needed.
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // --- 3. Auth Protection for /ceo ---
  if (pathname.startsWith("/ceo")) {
    const expectedUsername = process.env.CEO_AUTH_USERNAME;
    const expectedPassword = process.env.CEO_AUTH_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      if (process.env.NODE_ENV === "production") {
        return new NextResponse("CEO auth is not configured.", {
          status: 503,
          headers: {
            "Cache-Control": "no-store, max-age=0",
            "X-Robots-Tag": "noindex, nofollow, noarchive",
          },
        });
      }
      return response;
    }

    const credentials = readBasicCredentials(request.headers.get("authorization"));
    if (!credentials) return unauthorizedResponse();

    const isAuthorized =
      timingSafeEqualText(credentials.username, expectedUsername) &&
      timingSafeEqualText(credentials.password, expectedPassword);

    if (!isAuthorized) return unauthorizedResponse();

    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
