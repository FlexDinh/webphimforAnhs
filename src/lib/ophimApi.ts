import {
    dedupeMovies,
    isTheatricalMovie,
    isThuyetMinhMovie,
    matchesMovieType,
} from "./movieClassification";

const PHIMAPI_BASE_URL = "https://ophim1.com";
const PHIMAPI_IMAGE_BASE = "https://img.ophim1.com/uploads/movies";

const DEFAULT_REVALIDATE_SECONDS = 300;
const DETAIL_REVALIDATE_SECONDS = 3600;
const DEFAULT_TIMEOUT_MS = 8000;
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_CACHE_TTL_MS = 45 * 1000;
const MAX_CLIENT_CACHE_ENTRIES = 200;
const DEFAULT_PAGE_SIZE = 24;
const DERIVED_LIST_SCAN_LIMIT = 12;

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
    lang_key?: string[];
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

export function getImageUrl(path: string): string {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${PHIMAPI_IMAGE_BASE}/${path}`;
}

export async function getLatestMovies(page: number = 1): Promise<OPhimResponse> {
    const url = `${PHIMAPI_BASE_URL}/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(url, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: `latest:${page}`,
    });
    return normalizeApiResponse(data);
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

async function buildDerivedListing(
    page: number,
    sourceFetch: (sourcePage: number) => Promise<OPhimResponse>,
    predicate: (movie: OPhimMovie) => boolean
): Promise<OPhimResponse> {
    const pageStart = (page - 1) * DEFAULT_PAGE_SIZE;
    const pageEnd = page * DEFAULT_PAGE_SIZE;
    const lookaheadCount = pageEnd + DEFAULT_PAGE_SIZE;
    const collected: OPhimMovie[] = [];
    const seen = new Set<string>();
    let sourcePage = 1;
    let sourceTotalPages = 1;
    let exhausted = false;

    while (
        sourcePage <= sourceTotalPages &&
        sourcePage <= DERIVED_LIST_SCAN_LIMIT &&
        collected.length < lookaheadCount
    ) {
        const response = await sourceFetch(sourcePage);
        sourceTotalPages = Math.max(sourceTotalPages, response.pagination.totalPages || sourcePage);

        dedupeMovies(response.items.filter(predicate)).forEach((movie) => {
            const key = movie._id || movie.slug;
            if (!key || seen.has(key)) return;
            seen.add(key);
            collected.push(movie);
        });

        if (response.items.length === 0 || sourcePage >= sourceTotalPages) {
            exhausted = true;
            break;
        }

        sourcePage += 1;
    }

    const items = collected.slice(pageStart, pageEnd);
    const scannedAll = exhausted || sourcePage > sourceTotalPages;
    const hasMore = scannedAll ? collected.length > pageEnd : collected.length > pageEnd || sourcePage <= sourceTotalPages;
    const totalItems = scannedAll
        ? collected.length
        : Math.max(collected.length, pageEnd + (hasMore ? 1 : 0));

    return {
        status: true,
        msg: "done",
        items,
        pagination: {
            totalItems,
            totalItemsPerPage: DEFAULT_PAGE_SIZE,
            currentPage: page,
            totalPages: scannedAll
                ? Math.max(1, Math.ceil(totalItems / DEFAULT_PAGE_SIZE))
                : Math.max(page, hasMore ? page + 1 : page),
        },
    };
}

export async function getTheatricalMovies(page: number = 1): Promise<OPhimResponse> {
    return buildDerivedListing(
        page,
        (sourcePage) => getMoviesByType("phim-le", sourcePage),
        isTheatricalMovie
    );
}

export async function getMoviesByType(type: string, page: number = 1): Promise<OPhimResponse> {
    const url = `${PHIMAPI_BASE_URL}/v1/api/danh-sach/${type}?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(url, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: `type:${type}:${page}`,
    });
    const normalized = normalizeApiResponse(data);

    return {
        ...normalized,
        items: normalized.items.filter((movie) => matchesMovieType(movie, type)),
    };
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
    return buildDerivedListing(page, getLatestMovies, isThuyetMinhMovie);
}

export async function getMoviesByCountry(country: string, page: number = 1): Promise<OPhimResponse> {
    const url = `${PHIMAPI_BASE_URL}/v1/api/quoc-gia/${country}?page=${page}`;
    const data = await fetchJsonWithTimeout<any>(url, {
        revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
        cacheKey: `country:${country}:${page}`,
    });
    return normalizeApiResponse(data);
}
