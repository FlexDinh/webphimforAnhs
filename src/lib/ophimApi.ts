const PHIMAPI_BASE_URL = "https://ophim1.com";
const PHIMAPI_IMAGE_BASE = "https://img.ophim1.com/uploads/movies";

const DEFAULT_REVALIDATE_SECONDS = 300;
const DETAIL_REVALIDATE_SECONDS = 3600;
const DEFAULT_TIMEOUT_MS = 8000;
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_CACHE_TTL_MS = 45 * 1000;
const MAX_CLIENT_CACHE_ENTRIES = 200;

export interface OPhimMovie {
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
    chieurap?: boolean;
    tmdb?: {
        type: string;
        vote_average: number;
    };
    category?: { id: string; name: string; slug: string }[];
    country?: { id: string; name: string; slug: string }[];
    modified?: {
        time: string;
    };
}

export interface OPhimResponse {
    status: boolean;
    msg: string;
    items: OPhimMovie[];
    pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
    };
}

export interface OPhimSearchResponse {
    status: string;
    msg: string;
    data: {
        items: OPhimMovie[];
        params: {
            pagination: {
                totalItems: number;
                totalItemsPerPage: number;
                currentPage: number;
                totalPages: number;
            };
        };
        APP_DOMAIN_CDN_IMAGE: string;
    };
}

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
    url: string,
    options: FetchJsonOptions = {}
): Promise<T> {
    const {
        revalidateSeconds = DEFAULT_REVALIDATE_SECONDS,
        timeoutMs = DEFAULT_TIMEOUT_MS,
        cacheKey = url,
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
        status: true,
        msg: "done",
        items: data?.data?.items || [],
        pagination: parsePagination(data),
    };
}

function parsePagination(data: any): OPhimResponse["pagination"] {
    const fallback = {
        totalItems: 0,
        totalItemsPerPage: 24,
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

export function getImageUrl(path: string): string {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${PHIMAPI_IMAGE_BASE}/${path}`;
}

export async function getLatestMovies(page: number = 1): Promise<OPhimResponse> {
    const url = `${PHIMAPI_BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`;
    return fetchJsonWithTimeout<OPhimResponse>(url, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: `latest:${page}`,
    });
}

export async function searchMovies(keyword: string, limit: number = 10): Promise<OPhimMovie[]> {
    const query = keyword.trim();
    if (!query) return [];

    const url = `${PHIMAPI_BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}&limit=${limit}`;
    const cacheKey = `search:${query.toLowerCase()}:${limit}`;

    try {
        const data = await fetchJsonWithTimeout<OPhimSearchResponse>(url, {
            timeoutMs: 6000,
            cacheKey,
            clientCacheTtlMs: SEARCH_CACHE_TTL_MS,
            useClientCache: true,
            forceNoStore: true,
        });
        return data.data?.items || [];
    } catch (error) {
        if (!isAbortError(error)) {
            console.error("Error searching movies:", error);
        }
        return [];
    }
}

export async function getMovieBySlug(slug: string) {
    const url = `${PHIMAPI_BASE_URL}/phim/${slug}`;
    return fetchJsonWithTimeout<any>(url, {
        revalidateSeconds: DETAIL_REVALIDATE_SECONDS,
        cacheKey: `movie:${slug}`,
        clientCacheTtlMs: DETAIL_REVALIDATE_SECONDS * 1000,
    });
}

export async function getTheatricalMovies(page: number = 1): Promise<OPhimResponse> {
    const candidateUrls = [
        `${PHIMAPI_BASE_URL}/v1/api/danh-sach/chieu-rap?page=${page}`,
        `${PHIMAPI_BASE_URL}/v1/api/danh-sach/phim-chieu-rap?page=${page}`,
    ];

    let lastError: unknown;

    for (const url of candidateUrls) {
        try {
            const data = await fetchJsonWithTimeout<any>(url, {
                revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
                cacheKey: `theatrical:${page}:${url}`,
            });
            const normalized = normalizeApiResponse(data);
            if (normalized.items.length > 0) {
                return normalized;
            }
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError ?? new Error("Unable to fetch theatrical movies");
}

export async function getMoviesByType(type: string, page: number = 1): Promise<OPhimResponse> {
    const url = `${PHIMAPI_BASE_URL}/v1/api/danh-sach/${type}?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(url, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: `type:${type}:${page}`,
    });
    return normalizeApiResponse(data);
}

export async function getMoviesByCategory(category: string, page: number = 1): Promise<OPhimResponse> {
    const url = `${PHIMAPI_BASE_URL}/v1/api/the-loai/${category}?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(url, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: `category:${category}:${page}`,
    });
    return normalizeApiResponse(data);
}

export async function getThuyetMinhMovies(page: number = 1): Promise<OPhimResponse> {
    const url = `${PHIMAPI_BASE_URL}/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(url, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: `thuyet-minh:${page}`,
    });

    const allItems: OPhimMovie[] = data?.data?.items || [];
    const tmItems = allItems.filter((movie) => {
        const lang = (movie.lang || "").toLowerCase();
        return lang.includes("thuyet minh") || lang.includes("long tieng");
    });

    return {
        status: true,
        msg: "done",
        items: tmItems.length > 0 ? tmItems : allItems.slice(0, 12),
        pagination: parsePagination(data),
    };
}

export async function getMoviesByCountry(country: string, page: number = 1): Promise<OPhimResponse> {
    const url = `${PHIMAPI_BASE_URL}/v1/api/quoc-gia/${country}?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(url, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: `country:${country}:${page}`,
    });
    return normalizeApiResponse(data);
}

