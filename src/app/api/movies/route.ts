import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MANAGED_API_CONFIG } from "@/lib/apiConfig";

/**
 * /api/movies — Multi-source proxy với race pattern
 *
 * Nguồn theo độ ưu tiên:
 * 1. OPhim (ophim1.com / phimapi.com) — race song song
 * 2. NguonC (phim.nguonc.com)         — race song song với OPhim  
 * 3. KKPhim (phimapi.com /v1/api)     — race song song
 *
 * Cơ chế: tất cả nguồn được gọi đồng thời, ai trả lời nhanh nhất và hợp lệ thì dùng trước.
 */

export const maxDuration = 25; // Vercel Hobby: max 25s
export const dynamic = "force-dynamic";

const OPHIM_BASES = [
  "https://phimapi.com",
  DEFAULT_MANAGED_API_CONFIG.ophimBaseUrl,
  "https://ophim1.com",
].filter((v, i, a) => a.indexOf(v) === i); // unique

const NGUONC_BASE = "https://phim.nguonc.com/api";
const KKPHIM_BASE = "https://phimapi.com";

const CACHE_SECONDS = 300;
const STALE_SECONDS = 1800;
const TIMEOUT_MS = 8000;

const ALLOWED_PATHS = [
  /^\/v1\/api\/danh-sach\//,
  /^\/v1\/api\/the-loai\//,
  /^\/v1\/api\/quoc-gia\//,
  /^\/v1\/api\/tim-kiem/,
  /^\/phim\//,
];

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

async function timedFetch(url: string, baseUrl: string, timeoutMs = TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { ...BROWSER_HEADERS, Referer: `${baseUrl}/`, Origin: baseUrl },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

// ─── OPhim source ───────────────────────────────────────────────────────────

async function fetchOPhim(
  baseUrl: string,
  path: string,
  params: URLSearchParams,
): Promise<{ data: unknown; source: string }> {
  let realPath = path;
  if (baseUrl.includes("phimapi.com") && path.includes("phim-moi-cap-nhat")) {
    realPath = "/danh-sach/phim-moi-cap-nhat";
  }
  const url = `${baseUrl}${realPath}${params.toString() ? "?" + params.toString() : ""}`;
  const res = await timedFetch(url, baseUrl);

  if (!res.ok) throw new Error(`OPhim ${baseUrl} → ${res.status}`);

  const data = await res.json();
  if (data?.status === false || data?.status === "false") {
    throw new Error(`OPhim ${baseUrl} blocked: ${data?.msg}`);
  }
  return { data, source: baseUrl };
}

// ─── KKPhim source ──────────────────────────────────────────────────────────

async function fetchKKPhim(
  path: string,
  params: URLSearchParams,
): Promise<{ data: unknown; source: string }> {
  let realPath = path;
  if (path.includes("phim-moi-cap-nhat")) {
    realPath = "/danh-sach/phim-moi-cap-nhat";
  }
  const url = `${KKPHIM_BASE}${realPath}${params.toString() ? "?" + params.toString() : ""}`;
  const res = await timedFetch(url, KKPHIM_BASE);
  if (!res.ok) throw new Error(`KKPhim → ${res.status}`);

  const data = await res.json();
  if (data?.status === false) throw new Error(`KKPhim blocked: ${data?.msg}`);
  return { data, source: "kkphim" };
}

// ─── NguonC mapping & source ────────────────────────────────────────────────

/**
 * Map OPhim-style path → NguonC path.
 *
 * OPhim                               NguonC
 * /v1/api/danh-sach/phim-moi-cap-nhat → /films/phim-moi-cap-nhat
 * /v1/api/danh-sach/phim-bo           → /films/danh-sach/phim-bo
 * /v1/api/danh-sach/phim-le           → /films/danh-sach/phim-le
 * /v1/api/danh-sach/hoat-hinh         → /films/danh-sach/hoat-hinh
 * /v1/api/the-loai/{slug}             → /films/the-loai/{slug}
 * /v1/api/quoc-gia/{slug}             → /films/quoc-gia/{slug}
 * /v1/api/tim-kiem                    → /films/search
 * /phim/{slug}                        → /film/{slug}
 */
function toNguoncPath(ophimPath: string): string | null {
  // Phim mới cập nhật (endpoint đặc biệt của NguonC)
  if (ophimPath === "/v1/api/danh-sach/phim-moi-cap-nhat") {
    return "/films/phim-moi-cap-nhat";
  }

  // Danh sách chuyên biệt
  const danhSachMap: Record<string, string> = {
    "phim-bo": "/films/danh-sach/phim-bo",
    "phim-le": "/films/danh-sach/phim-le",
    "hoat-hinh": "/films/danh-sach/hoat-hinh",
  };
  const dsMatch = ophimPath.match(/^\/v1\/api\/danh-sach\/(.+)$/);
  if (dsMatch) {
    return danhSachMap[dsMatch[1]] ?? `/films/${dsMatch[1]}`;
  }

  // Thể loại
  const tlMatch = ophimPath.match(/^\/v1\/api\/the-loai\/(.+)$/);
  if (tlMatch) return `/films/the-loai/${tlMatch[1]}`;

  // Quốc gia
  const qgMatch = ophimPath.match(/^\/v1\/api\/quoc-gia\/(.+)$/);
  if (qgMatch) return `/films/quoc-gia/${qgMatch[1]}`;

  // Tìm kiếm
  if (ophimPath.startsWith("/v1/api/tim-kiem")) return "/films/search";

  // Chi tiết phim
  const phimMatch = ophimPath.match(/^\/phim\/(.+)$/);
  if (phimMatch) return `/film/${phimMatch[1]}`;

  return null;
}

function normalizeNguoncList(data: any): unknown {
  const items = (data?.items ?? []).map((m: any) => ({
    _id: m.id ?? m.slug,
    name: m.name,
    slug: m.slug,
    origin_name: m.original_name ?? m.name,
    thumb_url: m.thumb_url,
    poster_url: m.poster_url,
    year: m.created ? new Date(m.created).getFullYear() : new Date().getFullYear(),
    quality: m.quality,
    lang: m.language,
    time: m.time,
    episode_current: m.current_episode,
    type: (m.total_episodes ?? 1) > 1 ? "series" : "single",
  }));

  const p = data?.paginate ?? {};
  return {
    status: true,
    msg: "OK",
    data: {
      items,
      params: {
        pagination: {
          totalItems: p.total_items ?? items.length,
          totalItemsPerPage: p.items_per_page ?? 10,
          currentPage: p.current_page ?? 1,
          totalPages: p.total_page ?? 1,
        },
      },
      APP_DOMAIN_CDN_IMAGE: "https://phim.nguonc.com",
    },
  };
}

function normalizeNguoncDetail(data: any): unknown {
  const m = data?.movie ?? {};
  return {
    status: true,
    msg: "OK",
    movie: {
      _id: m.id ?? m.slug,
      name: m.name,
      slug: m.slug,
      origin_name: m.original_name ?? m.name,
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
      type: (m.total_episodes ?? 1) > 1 ? "series" : "single",
      category: [],
      country: [],
    },
    episodes: m.episodes ?? [],
  };
}

async function fetchNguonc(
  path: string,
  params: URLSearchParams,
): Promise<{ data: unknown; source: string }> {
  const nguoncPath = toNguoncPath(path);
  if (!nguoncPath) throw new Error("No NguonC mapping for: " + path);

  const isDetail = nguoncPath.startsWith("/film/") && !nguoncPath.startsWith("/films/");

  const p = new URLSearchParams();
  const page = params.get("page");
  const keyword = params.get("keyword");
  if (page) p.set("page", page);
  if (keyword) p.set("keyword", keyword);

  const url = `${NGUONC_BASE}${nguoncPath}${p.toString() ? "?" + p.toString() : ""}`;
  const res = await timedFetch(url, NGUONC_BASE);
  if (!res.ok) throw new Error(`NguonC → ${res.status}`);

  const raw = await res.json();
  if (raw?.status !== "success" && raw?.status !== true) {
    throw new Error(`NguonC bad status: ${raw?.status}`);
  }

  const data = isDetail ? normalizeNguoncDetail(raw) : normalizeNguoncList(raw);
  return { data, source: "nguonc" };
}

// ─── Response helper ────────────────────────────────────────────────────────

function makeResponse(data: unknown, source: string) {
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
}

// ─── Main handler ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path || path.length > 200) {
    return NextResponse.json({ error: "Missing or invalid path" }, { status: 400 });
  }

  const contentLength = parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > 1024) {
    return NextResponse.json({ error: "Payload Too Large" }, { status: 413 });
  }

  if (!ALLOWED_PATHS.some((re) => re.test(path))) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  }

  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "path") params.set(key, value);
  });

  const errors: string[] = [];

  const wrapSource = async (name: string, p: Promise<{ data: unknown; source: string }>) => {
    try {
      return await p;
    } catch (e: any) {
      errors.push(`${name}: ${e?.message || String(e)}`);
      throw e;
    }
  };

  const sources = [
    wrapSource("KKPhim", fetchKKPhim(path, params)),
    ...OPHIM_BASES.map((base) => wrapSource(`OPhim(${base})`, fetchOPhim(base, path, params))),
    wrapSource("NguonC", fetchNguonc(path, params)),
  ];

  try {
    const { data, source } = await Promise.any(sources);
    return makeResponse(data, source);
  } catch {
    return NextResponse.json(
      { error: "All upstream sources failed", details: errors },
      { status: 502 },
    );
  }
}
