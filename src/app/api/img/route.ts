import { NextRequest, NextResponse } from "next/server";

// Danh sách domain ảnh được phép proxy (whitelist)
const ALLOWED_HOSTS = [
  "img.ophim.live",
  "phimimg.com",
  "image.tmdb.org",
  "phim.nguonc.com",
  "ophim1.com",
  "phimapi.com",
  "cdn.ophim.live",
  "i.imgur.com",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  // Whitelist check
  const isAllowed = ALLOWED_HOSTS.some(
    (host) =>
      parsedUrl.hostname === host || parsedUrl.hostname.endsWith("." + host)
  );

  if (!isAllowed) {
    return new NextResponse("Host not allowed", { status: 403 });
  }

  // Only allow https
  if (parsedUrl.protocol !== "https:") {
    return new NextResponse("Only HTTPS allowed", { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RoPhimBot/1.0; +https://rophim.vercel.app)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: parsedUrl.origin,
      },
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const contentType =
      upstream.headers.get("content-type") || "image/jpeg";

    // Only allow image content types
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 400 });
    }

    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache 7 ngày trên Vercel Edge CDN, 1 ngày trên browser
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        "CDN-Cache-Control": "public, max-age=604800",
        "Vercel-CDN-Cache-Control": "public, max-age=604800",
        // Cho phép TV và trình duyệt bất kỳ load ảnh (CORS)
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "X-Content-Type-Options": "nosniff",
        Vary: "Accept",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new NextResponse("Upstream timeout", { status: 504 });
    }
    return new NextResponse("Proxy error", { status: 502 });
  }
}
