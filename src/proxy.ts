import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CEO_AUTH_REALM = "RopPhim CEO";

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
  if (!authorizationHeader?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = globalThis.atob(authorizationHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

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

  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }

  return result === 0;
}

export function proxy(request: NextRequest) {
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

    return NextResponse.next();
  }

  const credentials = readBasicCredentials(request.headers.get("authorization"));

  if (!credentials) {
    return unauthorizedResponse();
  }

  const isAuthorized =
    timingSafeEqualText(credentials.username, expectedUsername) &&
    timingSafeEqualText(credentials.password, expectedPassword);

  if (!isAuthorized) {
    return unauthorizedResponse();
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/ceo/:path*"],
};
