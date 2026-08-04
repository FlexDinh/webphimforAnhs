import { NextRequest, NextResponse } from "next/server";

// Danh sách domain ảnh được phép proxy (whitelist)
const ALLOWED_HOSTS = [
  "img.ophim.live",
  "img.ophim1.com",
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
  let imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  if (imageUrl.length > 1000) {
    return new NextResponse("URL too long", { status: 400 });
  }
  
  // Tự động chuyển domain bị chết sang domain dự phòng
  if (imageUrl.includes("img.ophim.live")) {
    imageUrl = imageUrl.replace("img.ophim.live", "img.ophim1.com");
  }

  // Reject large payloads or anything that isn't a GET
  if (request.method !== 'GET' && request.headers.get("content-length")) {
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > 1024) {
      return new NextResponse("Payload Too Large", { status: 413 });
    }
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

    let upstream = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RoPhimBot/1.0; +https://rophim.vercel.app)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: parsedUrl.origin,
      },
    });

    if (!upstream.ok && imageUrl.includes("img.ophim1.com")) {
      // Fallback sang phimimg.com nếu img.ophim1.com cũng không tìm thấy
      const fallbackUrl = imageUrl.replace("img.ophim1.com", "phimimg.com");
      try {
        const fbRes = await fetch(fallbackUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; RoPhimBot/1.0)",
            Accept: "image/*",
          },
        });
        if (fbRes.ok) upstream = fbRes;
      } catch {}
    }

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
