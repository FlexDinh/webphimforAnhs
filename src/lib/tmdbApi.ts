const tmdbProxyPath = '/api/tmdb';

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
  genre_ids: number[];
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const CLIENT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
const MAX_CLIENT_CACHE_ENTRIES = 300;

interface CacheEntry<T> {
  data?: T;
  expiresAt?: number;
  promise?: Promise<T>;
}

interface FetchJsonOptions {
  timeoutMs?: number;
  cacheKey?: string;
  clientCacheTtlMs?: number;
  useClientCache?: boolean;
}

const clientCache = new Map<string, CacheEntry<unknown>>();

function trimClientCache() {
  if (clientCache.size <= MAX_CLIENT_CACHE_ENTRIES) return;
  const firstKey = clientCache.keys().next().value;
  if (firstKey) {
      clientCache.delete(firstKey);
  }
}

async function fetchJsonWithTimeout<T>(
  url: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const {
      timeoutMs = DEFAULT_TIMEOUT_MS,
      cacheKey = url,
      clientCacheTtlMs = CLIENT_CACHE_TTL_MS,
      useClientCache = true,
  } = options;

  const isClient = typeof window !== "undefined";
  const now = Date.now();
  const cached = isClient ? (clientCache.get(cacheKey) as CacheEntry<T> | undefined) : undefined;

  if (isClient && useClientCache) {
      if (cached?.data && cached.expiresAt && cached.expiresAt > now) {
          return cached.data;
      }
      if (cached?.promise) {
          return cached.promise;
      }
  }

  const requestPromise = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
          const init: RequestInit = {
              signal: controller.signal,
          };

          const response = await fetch(url, init);
          if (!response.ok) {
              throw new Error(`Fetch failed (${response.status}) for ${url}`);
          }
          return (await response.json()) as T;
      } finally {
          clearTimeout(timer);
      }
  })();

  if (isClient && useClientCache) {
      clientCache.set(cacheKey, { ...cached, promise: requestPromise });
  }

  try {
      const data = await requestPromise;
      if (isClient && useClientCache) {
          clientCache.set(cacheKey, {
              data,
              expiresAt: now + clientCacheTtlMs,
          });
          trimClientCache();
      }
      return data;
  } catch (error) {
      if (isClient && useClientCache) {
          if (cached?.data) {
              return cached.data;
          }
          clientCache.delete(cacheKey);
      }
      throw error;
  }
}

export async function getTrendingMovies(timeWindow: 'day' | 'week'): Promise<TMDBResponse> {
  const url = `${tmdbProxyPath}?path=/trending/movie/${timeWindow}&language=vi-VN`;
  return fetchJsonWithTimeout<TMDBResponse>(url, { cacheKey: url });
}

export async function getTrendingTV(timeWindow: 'day' | 'week'): Promise<TMDBResponse> {
  const url = `${tmdbProxyPath}?path=/trending/tv/${timeWindow}&language=vi-VN`;
  return fetchJsonWithTimeout<TMDBResponse>(url, { cacheKey: url });
}

export async function getTrendingAll(timeWindow: 'day' | 'week'): Promise<TMDBResponse> {
  const url = `${tmdbProxyPath}?path=/trending/all/${timeWindow}&language=vi-VN`;
  return fetchJsonWithTimeout<TMDBResponse>(url, { cacheKey: url });
}

export async function getMovieTrailer(tmdbId: string): Promise<any> {
  const url = `${tmdbProxyPath}?path=/movie/${tmdbId}/videos&language=vi-VN`;
  return fetchJsonWithTimeout<any>(url, { cacheKey: url });
}

export function getTMDBImageUrl(path: string, size: string): string {
  if (!path) return '';
  // ensure path starts with '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `https://image.tmdb.org/t/p/${size}${normalizedPath}`;
}
