import {
  DEFAULT_MANAGED_API_CONFIG,
  getOPhimImageCdn,
  getOPhimMovieImageBase,
} from "./apiConfig.ts";

export const OPHIM_IMAGE_CDN = DEFAULT_MANAGED_API_CONFIG.ophimImageCdn;
export const OPHIM_MOVIE_IMAGE_BASE = `${OPHIM_IMAGE_CDN}/uploads/movies`;
export const PLACEHOLDER_IMAGE = "/placeholder.svg";

export function getImageUrl(path: string | null | undefined): string {
  const value = String(path || "").trim();
  if (!value) return PLACEHOLDER_IMAGE;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  const normalizedPath = value.replace(/^\/+/, "");
  if (normalizedPath.startsWith("uploads/movies/")) {
    return `${getOPhimImageCdn()}/${normalizedPath}`;
  }

  return `${getOPhimMovieImageBase()}/${normalizedPath}`;
}
