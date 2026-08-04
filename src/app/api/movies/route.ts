import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MANAGED_API_CONFIG } from "@/lib/apiConfig";

/**
 * /api/movies — Server-side cache proxy cho OPhim API
 *
 * Lợi ích so với gọi OPhim trực tiếp từ browser:
 * - Cache 5 phút trên Vercel Edge → 1000 user cùng vào chỉ gọi OPhim 1 lần
 * - Tránh CORS trên TV browsers
 * - Race pattern: gọi tất cả sources cùng lúc, ai nhanh dùng trước
 * - NguonC fallback khi OPhim bị block
 */

const OPHIM_BASE = DEFAULT_MANAGED_API_CONFIG.ophimBaseUrl;
const FALLBACK_OPHIM_BASES = ["https://ophim1.com", "https://phimapi.com"];
const NGUONC_BASE = DEFAULT_MANAGED_API_CONFIG.nguoncBaseUrl || "https://phim.nguonc.com/api";
const CACHE_SECONDS = 300; // 5 phút
const STALE_SECONDS = 1800; // 30 phút stale-while-revalidate → user luôn thấy content ngay
const UPSTREAM_TIMEOUT_MS = 5000; // 5s để OPhim fail nhanh, fallback sang NguonC
export const maxDuration = 25; // Vercel Hobby: max 25s cho serverless function

const ALLOWED_PATHS = [
  /^\/v1\/api\/danh-sach\//,
  /^\/v1\/api\/the-loai\//,
  /^\/v1\/api\/quoc-gia\//,
  /^\/v1\/api\/tim-kiem/,
  /^\/phim\//,
];

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
};

async function fetchUpstream(
  baseUrl: string,
  path: string,
  params: URLSearchParams,
  timeoutMs: number,
): Promise<{ data: unknown; source: string }> {
  const upstreamUrl = `${baseUrl}${path}${
    params.toString() ? "?" + params.toString() : ""
  }`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        ...BROWSER_HEADERS,
        Referer: `${baseUrl}/`,
        Origin: baseUrl,
      },
      next: { revalidate: CACHE_SECONDS },
    });

    if (!upstream.ok) {
      throw new Error(`Upstream ${baseUrl} returned ${upstream.status}`);
    }

    const data = await upstream.json();

    // Detect anti-bot block: OPhim trả 200 nhưng status=false với msg "hmmm!"
    if (data?.status === false || data?.status === "false") {
      throw new Error(`Upstream ${baseUrl} blocked (anti-bot): ${data?.msg}`);
    }

    return { data, source: baseUrl };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Map OPhim path → NguonC path
 * OPhim:  /v1/api/danh-sach/phim-moi-cap-nhat
 * NguonC: /films/phim-moi-cap-nhat
 */
function mapToNguoncPath(ophimPath: string): string | null {
  // Danh sách phim
  const danhSachMatch = ophimPath.match(/^\/v1\/api\/danh-sach\/(.+)$/);
  if (danhSachMatch) return `/films/${danhSachMatch[1]}`;

  // Thể loại
  const theLoaiMatch = ophimPath.match(/^\/v1\/api\/the-loai\/(.+)$/);
  if (theLoaiMatch) return `/films/the-loai/${theLoaiMatch[1]}`;

  // Quốc gia
  const quocGiaMatch = ophimPath.match(/^\/v1\/api\/quoc-gia\/(.+)$/);
  if (quocGiaMatch) return `/films/quoc-gia/${quocGiaMatch[1]}`;

  // Tìm kiếm
  if (ophimPath.startsWith("/v1/api/tim-kiem")) return "/films/search";

  // Chi tiết phim /phim/slug → /film/slug
  const phimMatch = ophimPath.match(/^\/phim\/(.+)$/);
  if (phimMatch) return `/film/${phimMatch[1]}`;

  return null;
}

/**
 * Normalize NguonC response sang format OPhim để client không cần thay đổi code
 */
function normalizeNguoncToOphim(data: any, isDetail: boolean): unknown {
  if (isDetail && data?.movie) {
    // Chi tiết phim - wrap vào format OPhim movie detail
    const m = data.movie;
    return {
      status: true,
      msg: "Tìm thấy phim",
      movie: {
        _id: m.id || m.slug,
        name: m.name,
        slug: m.slug,
        origin_name: m.original_name || m.name,
        thumb_url: m.thumb_url,
        poster_url: m.poster_url,
        year: m.created ? new Date(m.created).getFullYear() : new Date().getFullYear(),
        quality: m.quality,
        lang: m.language,
        time: m.time,
        description: m.description,
        director: m.director ? [m.director] : [],
        casts: m.casts ? m.casts.split(",").map((s: string) => s.trim()) : [],
        episode_current: m.current_episode,
        type: m.total_episodes > 1 ? "series" : "single",
        episodes: data.movie.episodes || [],
        category: [],
        country: [],
      },
    };
  }

  // Danh sách phim
  const items = (data?.items || []).map((m: any) => ({
    _id: m.id || m.slug,
    name: m.name,
    slug: m.slug,
    origin_name: m.original_name || m.name,
    thumb_url: m.thumb_url,
    poster_url: m.poster_url,
    year: m.created ? new Date(m.created).getFullYear() : new Date().getFullYear(),
    quality: m.quality,
    lang: m.language,
    time: m.time,
    episode_current: m.current_episode,
    type: (m.total_episodes ?? 1) > 1 ? "series" : "single",
  }));

  const paginate = data?.paginate || {};
  return {
    status: true,
    msg: "Lấy danh sách phim thành công",
    data: {
      items,
      params: {
        pagination: {
          totalItems: paginate.total_items || items.length,
          totalItemsPerPage: paginate.items_per_page || 24,
          currentPage: paginate.current_page || 1,
          totalPages: paginate.total_page || 1,
        },
      },
      APP_DOMAIN_CDN_IMAGE: "https://phim.nguonc.com",
    },
  };
}

async function fetchNguoncFallback(
  path: string,
  params: URLSearchParams,
  timeoutMs: number,
): Promise<{ data: unknown; source: string }> {
  const nguoncPath = mapToNguoncPath(path);
  if (!nguoncPath) throw new Error("No NguonC mapping for path: " + path);

  const isDetail = nguoncPath.startsWith("/film/") && !nguoncPath.startsWith("/films/");

  // Map query params: page → page, keyword → keyword
  const nguoncParams = new URLSearchParams();
  const page = params.get("page");
  const keyword = params.get("keyword");
  if (page) nguoncParams.set("page", page);
  if (keyword) nguoncParams.set("keyword", keyword);

  const url = `${NGUONC_BASE}${nguoncPath}${nguoncParams.toString() ? "?" + nguoncParams.toString() : ""}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: BROWSER_HEADERS,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!upstream.ok) {
      throw new Error(`NguonC returned ${upstream.status}`);
    }

    const raw = await upstream.json();
    if (raw?.status !== "success" && raw?.status !== true) {
      throw new Error(`NguonC bad status: ${raw?.status}`);
    }

    const data = normalizeNguoncToOphim(raw, isDetail);
    return { data, source: "nguonc" };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path || path.length > 200) {
    return NextResponse.json({ error: "Missing or invalid path" }, { status: 400 });
  }
  
  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  if (contentLength > 1024) {
    return NextResponse.json({ error: "Payload Too Large" }, { status: 413 });
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

  // Thử OPhim trước (race), nếu tất cả fail thì fallback sang NguonC
  try {
    const { data, source } = await Promise.any(
      baseUrls.map((baseUrl) =>
        fetchUpstream(baseUrl, path, upstreamParams, UPSTREAM_TIMEOUT_MS),
      ),
    );

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
        "CDN-Cache-Control": `public, max-age=${CACHE_SECONDS}`,
        "Vercel-CDN-Cache-Control": `public, max-age=${CACHE_SECONDS}`,
        "Access-Control-Allow-Origin": "*",
        "X-Cache-Source": "rophim-proxy",
        "X-Upstream-Source": source,
      },
    });
  } catch {
    // OPhim failed — thử NguonC fallback
    try {
      const { data } = await fetchNguoncFallback(path, upstreamParams, UPSTREAM_TIMEOUT_MS);
      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
          "CDN-Cache-Control": `public, max-age=${CACHE_SECONDS}`,
          "Vercel-CDN-Cache-Control": `public, max-age=${CACHE_SECONDS}`,
          "Access-Control-Allow-Origin": "*",
          "X-Cache-Source": "rophim-proxy",
          "X-Upstream-Source": "nguonc-fallback",
        },
      });
    } catch {
      return NextResponse.json(
        { error: "All upstream sources failed" },
        { status: 502 },
      );
    }
  }
}
