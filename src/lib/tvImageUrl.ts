/**
 * TV Image Proxy Helper
 * Chuyển đổi URL ảnh CDN ngoài → `/api/img?url=...` (qua Vercel cache)
 * Dùng cho TV pages để tránh CORS và CDN downtime
 */

const TV_IMAGE_PROXY_BASE = "/api/img";

// Domain được proxy
const PROXY_HOSTS = [
  "img.ophim.live",
  "phimimg.com",
  "image.tmdb.org",
  "phim.nguonc.com",
  "ophim1.com",
  "phimapi.com",
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
 * Trả về URL ảnh đã được proxy qua `/api/img`
 * Nếu URL không thuộc domain cần proxy thì trả về nguyên gốc
 */
export function getTVImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  const value = String(url).trim();
  if (!value) return "/placeholder.svg";

  // Nếu là relative path hoặc placeholder thì giữ nguyên
  if (!value.startsWith("http")) return value;

  // Nếu thuộc domain cần proxy → route qua API
  if (shouldProxy(value)) {
    return `${TV_IMAGE_PROXY_BASE}?url=${encodeURIComponent(value)}`;
  }

  return value;
}
