export interface ManagedApiConfig {
  ophimBaseUrl: string;
  ophimImageCdn: string;
  kkphimBaseUrl: string;
  nguoncBaseUrl: string;
  updatedAt?: string;
}

export const API_CONFIG_STORAGE_KEY = "rophim.api.config.v1";
export const API_CONFIG_CHANGE_EVENT = "rophim-api-config-change";

export const DEFAULT_MANAGED_API_CONFIG: ManagedApiConfig = {
  ophimBaseUrl: process.env.NEXT_PUBLIC_OPHIM_BASE_URL || "https://ophim1.com",
  ophimImageCdn: process.env.NEXT_PUBLIC_OPHIM_IMAGE_CDN || "https://img.ophim.live",
  kkphimBaseUrl: process.env.NEXT_PUBLIC_KKPHIM_BASE_URL || "https://phimapi.com",
  nguoncBaseUrl: process.env.NEXT_PUBLIC_NGUONC_BASE_URL || "https://phim.nguonc.com/api",
};

function normalizeBaseUrl(value: unknown, fallback: string): string {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return fallback;
    }

    const pathname = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${pathname === "/" ? "" : pathname}`;
  } catch {
    return fallback;
  }
}

export function normalizeManagedApiConfig(input: Partial<ManagedApiConfig>): ManagedApiConfig {
  return {
    ophimBaseUrl: normalizeBaseUrl(input.ophimBaseUrl, DEFAULT_MANAGED_API_CONFIG.ophimBaseUrl),
    ophimImageCdn: normalizeBaseUrl(input.ophimImageCdn, DEFAULT_MANAGED_API_CONFIG.ophimImageCdn),
    kkphimBaseUrl: normalizeBaseUrl(input.kkphimBaseUrl, DEFAULT_MANAGED_API_CONFIG.kkphimBaseUrl),
    nguoncBaseUrl: normalizeBaseUrl(input.nguoncBaseUrl, DEFAULT_MANAGED_API_CONFIG.nguoncBaseUrl),
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : undefined,
  };
}

export function readManagedApiConfig(): ManagedApiConfig {
  if (typeof window === "undefined") {
    return DEFAULT_MANAGED_API_CONFIG;
  }

  try {
    const raw = window.localStorage.getItem(API_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_MANAGED_API_CONFIG;
    return normalizeManagedApiConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_MANAGED_API_CONFIG;
  }
}

export function saveManagedApiConfig(input: Partial<ManagedApiConfig>): ManagedApiConfig {
  const config = normalizeManagedApiConfig({
    ...input,
    updatedAt: new Date().toISOString(),
  });

  if (typeof window !== "undefined") {
    window.localStorage.setItem(API_CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(API_CONFIG_CHANGE_EVENT, { detail: config }));
  }

  return config;
}

export function resetManagedApiConfig(): ManagedApiConfig {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(API_CONFIG_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(API_CONFIG_CHANGE_EVENT, { detail: DEFAULT_MANAGED_API_CONFIG }));
  }

  return DEFAULT_MANAGED_API_CONFIG;
}

export function getOPhimBaseUrl(): string {
  return readManagedApiConfig().ophimBaseUrl;
}

export function getOPhimImageCdn(): string {
  return readManagedApiConfig().ophimImageCdn;
}

export function getOPhimMovieImageBase(): string {
  return `${getOPhimImageCdn()}/uploads/movies`;
}

export function getKkPhimBaseUrl(): string {
  return readManagedApiConfig().kkphimBaseUrl;
}

export function getNguonCBaseUrl(): string {
  return readManagedApiConfig().nguoncBaseUrl;
}
