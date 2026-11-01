/**
 * VSMOV API — Nguồn phim thứ 4 (vsmov.com/api)
 *
 * Ưu điểm:
 * - Ảnh tự host (vsmov.com/storage/...) — nhanh, không phụ thuộc phimimg.com
 * - Có streaming links (link_embed, link_m3u8)
 * - Hỗ trợ tìm kiếm, danh sách, chi tiết phim
 */

const VSMOV_BASE = "https://vsmov.com/api";
const VSMOV_TIMEOUT_MS = 8000;

export interface VsmovMovie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  quality?: string;
  lang?: string;
  time?: string;
  episode_current?: string;
  type?: string;
  category?: { id: string; name: string; slug: string }[];
  country?: { id: string; name: string; slug: string }[];
}

async function fetchVsmovJson<T>(path: string, timeoutMs = VSMOV_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${VSMOV_BASE}${path}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RoPhimBot/1.0)",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`VSMOV fetch failed (${res.status}) for ${path}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Normalize VSMOV list response → OPhim-compatible format
 * VSMOV trả { status, items, pathImage, pagination }
 */
export function normalizeVsmovList(data: any): any {
  const items = (data?.items ?? []).map((m: any) => ({
    _id: m._id ?? m.slug,
    name: m.name,
    slug: m.slug,
    origin_name: m.origin_name ?? m.name,
    thumb_url: m.thumb_url,
    poster_url: m.poster_url,
    year: m.year ?? new Date().getFullYear(),
    quality: m.quality,
    lang: m.lang,
    time: m.time,
    episode_current: m.episode_current,
    type: m.type ?? "single",
    category: m.category ?? [],
    country: m.country ?? [],
  }));

  const p = data?.pagination ?? {};
  return {
    status: true,
    msg: "OK",
    data: {
      items,
      params: {
        pagination: {
          totalItems: p.totalItems ?? items.length,
          totalItemsPerPage: p.totalItemsPerPage ?? 24,
          currentPage: p.currentPage ?? 1,
          totalPages: p.totalPages ?? 1,
        },
      },
      APP_DOMAIN_CDN_IMAGE: "https://vsmov.com",
    },
  };
}

/**
 * Normalize VSMOV detail → OPhim-compatible format
 */
export function normalizeVsmovDetail(data: any): any {
  const m = data?.movie ?? {};
  return {
    status: data?.status ?? true,
    msg: "OK",
    movie: {
      _id: m._id ?? m.slug,
      name: m.name,
      slug: m.slug,
      origin_name: m.origin_name ?? m.name,
      thumb_url: m.thumb_url,
      poster_url: m.poster_url,
      year: m.year ?? new Date().getFullYear(),
      quality: m.quality,
      lang: m.lang,
      time: m.time,
      content: m.content ?? "",
      episode_current: m.episode_current,
      episode_total: m.episode_total ?? "",
      type: m.type ?? "single",
      status: m.status ?? "",
      trailer_url: m.trailer_url ?? "",
      actor: m.actor ?? [],
      director: m.director ?? [],
      category: m.category ?? [],
      country: m.country ?? [],
      tmdb: m.tmdb,
    },
    episodes: data?.episodes ?? [],
  };
}

/**
 * Map OPhim-style path → VSMOV path
 */
export function toVsmovPath(ophimPath: string): string | null {
  // Phim mới cập nhật
  if (ophimPath.includes("phim-moi-cap-nhat")) {
    return "/danh-sach/phim-moi-cap-nhat";
  }

  // Danh sách theo loại
  const dsMatch = ophimPath.match(/\/v1\/api\/danh-sach\/(.+)$/);
  if (dsMatch) return `/danh-sach/${dsMatch[1]}`;

  // Thể loại
  const tlMatch = ophimPath.match(/\/v1\/api\/the-loai\/(.+)$/);
  if (tlMatch) return `/the-loai/${tlMatch[1]}`;

  // Quốc gia
  const qgMatch = ophimPath.match(/\/v1\/api\/quoc-gia\/(.+)$/);
  if (qgMatch) return `/quoc-gia/${qgMatch[1]}`;

  // Tìm kiếm
  if (ophimPath.startsWith("/v1/api/tim-kiem")) return "/tim-kiem";

  // Chi tiết phim
  const phimMatch = ophimPath.match(/^\/phim\/(.+)$/);
  if (phimMatch) return `/phim/${phimMatch[1]}`;

  return null;
}

export async function fetchVsmovSource(
  path: string,
  params: URLSearchParams,
): Promise<{ data: unknown; source: string }> {
  const vsmovPath = toVsmovPath(path);
  if (!vsmovPath) throw new Error("No VSMOV mapping for: " + path);

  const isDetail = vsmovPath.startsWith("/phim/") && !vsmovPath.startsWith("/phim-");

  const p = new URLSearchParams();
  const page = params.get("page");
  const keyword = params.get("keyword");
  if (page) p.set("page", page);
  if (keyword) p.set("keyword", keyword);

  const url = `${vsmovPath}${p.toString() ? "?" + p.toString() : ""}`;
  const raw = await fetchVsmovJson<any>(url);

  if (raw?.status === false) {
    throw new Error(`VSMOV bad status: ${raw?.msg}`);
  }

  const data = isDetail ? normalizeVsmovDetail(raw) : normalizeVsmovList(raw);
  return { data, source: "vsmov" };
}
