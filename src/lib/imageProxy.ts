/**
 * Image Proxy Helper — dùng chung cho toàn bộ web (cả TV và desktop)
 * Chuyển URL ảnh CDN ngoài → `/api/img?url=...`
 *
 * Lợi ích:
 * - Cache 7 ngày trên Vercel Edge CDN (không bị xóa khi site ít traffic)
 * - Tránh CORS trên Smart TV browsers
 * - Timeout 8s nếu CDN ngoài down (không treo trình duyệt)
 * - Không tốn quota Vercel Image Optimization
 */

const IMAGE_PROXY_BASE = "/api/img";

// Domain được proxy qua /api/img
const PROXY_HOSTS = [
  "img.ophim.live",
  "phimimg.com",
  "image.tmdb.org",
  "phim.nguonc.com",
  "ophim1.com",
  "cdn.ophim.live",
  "i.imgur.com",
];

function shouldProxy(url: string): boolean {
  try {
    const parsed = new URL(url);
    return PROXY_HOSTS.some(
      (host) =>
        parsed.hostname === host || parsed.hostname.endsWith("." + host)
    );
  } catch {
    return false;
  }
}

/**
 * Chuyển URL ảnh sang proxy `/api/img?url=...`
 * Nếu không thuộc domain cần proxy → trả về nguyên gốc
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";
  const value = String(url).trim();
  if (!value) return "/placeholder.svg";
  if (!value.startsWith("http")) return value;
  if (shouldProxy(value)) {
    return `${IMAGE_PROXY_BASE}?url=${encodeURIComponent(value)}`;
  }
  return value;
}

// Alias cho TV code cũ
export const getTVImageUrl = getProxiedImageUrl;
