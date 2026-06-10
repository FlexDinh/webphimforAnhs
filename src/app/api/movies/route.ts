import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MANAGED_API_CONFIG } from "@/lib/apiConfig";

/**
 * /api/movies — Server-side cache proxy cho OPhim API
 *
 * Lợi ích so với gọi OPhim trực tiếp từ browser:
 * - Cache 5 phút trên Vercel Edge → 1000 user cùng vào chỉ gọi OPhim 1 lần
 * - Tránh CORS trên TV browsers
 * - Thêm fallback nếu OPhim chậm/down
 */

const OPHIM_BASE = DEFAULT_MANAGED_API_CONFIG.ophimBaseUrl;
const FALLBACK_OPHIM_BASES = ["https://ophim1.com", "https://phimapi.com"];
const CACHE_SECONDS = 300; // 5 phút
const STALE_SECONDS = 600; // 10 phút stale-while-revalidate
const UPSTREAM_TIMEOUT_MS = 4500;

const ALLOWED_PATHS = [
  /^\/v1\/api\/danh-sach\//,
  /^\/v1\/api\/the-loai\//,
  /^\/v1\/api\/quoc-gia\//,
  /^\/v1\/api\/tim-kiem/,
  /^\/phim\//,
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // Whitelist check — chỉ cho phép các path hợp lệ
  const isAllowed = ALLOWED_PATHS.some((re) => re.test(path));
  if (!isAllowed) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  }

  // Rebuild query string
  const upstreamParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "path") upstreamParams.set(key, value);
  });

  const baseUrls = Array.from(new Set([OPHIM_BASE, ...FALLBACK_OPHIM_BASES]));

  let lastStatus = 502;
  let lastErrorMessage = "Proxy error";

  for (const baseUrl of baseUrls) {
    const upstreamUrl = `${baseUrl}${path}${
      upstreamParams.toString() ? "?" + upstreamParams.toString() : ""
    }`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const upstream = await fetch(upstreamUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; RoPhimBot/1.0)",
          Accept: "application/json",
        },
        // Server-side: Vercel cache 5 phút
        next: { revalidate: CACHE_SECONDS },
      });

      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastErrorMessage = `Upstream error: ${upstream.status}`;
        continue;
      }

      const data = await upstream.json();

      return NextResponse.json(data, {
        status: 200,
        headers: {
          // Cache trên Vercel Edge 5 phút, stale thêm 10 phút
          "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
          "CDN-Cache-Control": `public, max-age=${CACHE_SECONDS}`,
          "Vercel-CDN-Cache-Control": `public, max-age=${CACHE_SECONDS}`,
          "Access-Control-Allow-Origin": "*",
          "X-Cache-Source": "rophim-proxy",
          "X-Upstream-Source": baseUrl,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        lastStatus = 504;
        lastErrorMessage = "Upstream timeout";
      } else {
        lastStatus = 502;
        lastErrorMessage = "Proxy error";
      }
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  return NextResponse.json({ error: lastErrorMessage }, { status: lastStatus });
}
