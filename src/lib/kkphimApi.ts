import { getKkPhimBaseUrl } from "./apiConfig";
import type { OPhimMovie, OPhimResponse, OPhimSearchResponse } from "./ophimApi";

const DEFAULT_REVALIDATE_SECONDS = 300;
const DETAIL_REVALIDATE_SECONDS = 3600;
const DEFAULT_TIMEOUT_MS = 8000;
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const SEARCH_CACHE_TTL_MS = 45 * 1000; // 45s
const MAX_CLIENT_CACHE_ENTRIES = 300;
const DEFAULT_PAGE_SIZE = 24;

interface CacheEntry<T> {
    data?: T;
    expiresAt?: number;
    promise?: Promise<T>;
}

interface FetchJsonOptions {
    revalidateSeconds?: number;
    timeoutMs?: number;
    cacheKey?: string;
    clientCacheTtlMs?: number;
    useClientCache?: boolean;
    forceNoStore?: boolean;
}

const clientCache = new Map<string, CacheEntry<unknown>>();

function trimClientCache() {
    if (clientCache.size <= MAX_CLIENT_CACHE_ENTRIES) return;
    const firstKey = clientCache.keys().next().value;
    if (firstKey) {
        clientCache.delete(firstKey);
    }
}

function isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
}

async function fetchJsonWithTimeout<T>(
    path: string,
    options: FetchJsonOptions = {}
): Promise<T> {
    const {
        revalidateSeconds = DEFAULT_REVALIDATE_SECONDS,
        timeoutMs = DEFAULT_TIMEOUT_MS,
        cacheKey = path,
        clientCacheTtlMs = CLIENT_CACHE_TTL_MS,
        useClientCache = true,
        forceNoStore = false,
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
            const init: RequestInit & { next?: { revalidate: number } } = {
                signal: controller.signal,
            };

            if (forceNoStore) {
                init.cache = "no-store";
            } else if (!isClient && revalidateSeconds > 0) {
                init.next = { revalidate: revalidateSeconds };
            }

            const baseUrl = getKkPhimBaseUrl();
            const url = `${baseUrl}${path}`;

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

function normalizeApiResponse(data: any): OPhimResponse {
    return {
        status: data?.status === true || data?.status === "success",
        msg: data?.msg || data?.message || "done",
        items: data?.data?.items || [],
        pagination: parsePagination(data),
    };
}

function parsePagination(data: any): OPhimResponse["pagination"] {
    const fallback = {
        totalItems: 0,
        totalItemsPerPage: DEFAULT_PAGE_SIZE,
        currentPage: 1,
        totalPages: 1,
    };

    const raw = data?.data?.params?.pagination || fallback;
    const totalItems = Number(raw.totalItems || raw.total_items || fallback.totalItems);
    const totalItemsPerPage = Number(raw.totalItemsPerPage || raw.items_per_page || fallback.totalItemsPerPage);
    const currentPage = Number(raw.currentPage || raw.current_page || fallback.currentPage);

    let totalPages = Number(raw.totalPages || raw.total_page || 0);
    if (!totalPages && totalItemsPerPage > 0) {
        totalPages = Math.ceil(totalItems / totalItemsPerPage);
    }

    return {
        totalItems,
        totalItemsPerPage,
        currentPage,
        totalPages: totalPages || fallback.totalPages,
    };
}

export async function getKkPhimLatestMovies(page: number = 1): Promise<OPhimResponse> {
    const path = `/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(path, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: path,
    });
    return normalizeApiResponse(data);
}

export async function searchKkPhimMovies(keyword: string, limit: number = 10): Promise<OPhimMovie[]> {
    const query = keyword.trim();
    if (!query) return [];

    const path = `/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}&limit=${limit}`;
    const cacheKey = path;

    try {
        const data = await fetchJsonWithTimeout<OPhimSearchResponse>(path, {
            timeoutMs: 6000,
            cacheKey,
            clientCacheTtlMs: SEARCH_CACHE_TTL_MS,
            useClientCache: true,
            forceNoStore: true,
        });
        return data.data?.items || [];
    } catch (error) {
        if (!isAbortError(error)) {
            console.error("Error searching KKPhim movies:", error);
        }
        return [];
    }
}

export async function getKkPhimMovieBySlug(slug: string) {
    const path = `/phim/${slug}`;
    return fetchJsonWithTimeout<any>(path, {
        revalidateSeconds: DETAIL_REVALIDATE_SECONDS,
        cacheKey: path,
        clientCacheTtlMs: DETAIL_REVALIDATE_SECONDS * 1000,
    });
}

export async function getKkPhimByType(type: string, page: number = 1): Promise<OPhimResponse> {
    const path = `/v1/api/danh-sach/${type}?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(path, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: path,
    });
    return normalizeApiResponse(data);
}

export async function getKkPhimByCategory(category: string, page: number = 1): Promise<OPhimResponse> {
    const path = `/v1/api/the-loai/${category}?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(path, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: path,
    });
    return normalizeApiResponse(data);
}

export async function getKkPhimByCountry(country: string, page: number = 1): Promise<OPhimResponse> {
    const path = `/v1/api/quoc-gia/${country}?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(path, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: path,
    });
    return normalizeApiResponse(data);
}
