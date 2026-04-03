const KKPHIM_BASE_URL = "https://phimapi.com";

const DETAIL_CACHE_TTL_MS = 10 * 60 * 1000;
const DETAIL_REVALIDATE_SECONDS = 300;
const REQUEST_TIMEOUT_MS = 6000;

export interface VNMovieSimple {
    name: string;
    slug: string;
    year: number;
    thumb_url: string;
    poster_url: string;
    type: string;
}

export const STABLE_PROVIDERS = [
    {
        name: "KKPhim",
        url: "https://phimapi.com",
        image_url: "https://phimimg.com",
    },
    {
        name: "NguonC",
        url: "https://phim.nguonc.com/api",
        image_url: "https://phim.nguonc.com/public/images",
    },
    {
        name: "OPhim",
        url: "https://ophim1.com",
        image_url: "https://img.ophim1.com/uploads/movies",
    },
];

export interface UnifiedMovie {
    id: string;
    _id: string;
    name: string;
    slug: string;
    origin_name: string;
    content: string;
    type: string;
    status: string;
    thumb_url: string;
    poster_url: string;
    trailer_url: string;
    time: string;
    episode_current: string;
    episode_total: string;
    quality: string;
    lang: string;
    year: number;
    actor: string[];
    director: string[];
    category: { id: string; name: string; slug: string }[];
    country: { id: string; name: string; slug: string }[];
    tmdb?: { type: string; id: string };
}

export interface UnifiedEpisode {
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
}

export interface UnifiedServer {
    server_name: string;
    server_data: UnifiedEpisode[];
}

export interface UnifiedResponse {
    status: boolean;
    movie: UnifiedMovie;
    episodes: UnifiedServer[];
}

interface CacheEntry<T> {
    data?: T;
    expiresAt?: number;
    promise?: Promise<T>;
}

const detailCache = new Map<string, CacheEntry<UnifiedResponse>>();

function normalizeOPhim(data: any): UnifiedResponse {
    return {
        status: data.status,
        movie: {
            ...data.movie,
            id: data.movie._id,
            _id: data.movie._id,
            tmdb: data.movie.tmdb ? { type: data.movie.tmdb.type, id: data.movie.tmdb.id } : undefined,
        },
        episodes: data.episodes || [],
    };
}

function normalizeNguonC(data: any): UnifiedResponse {
    const movie = data.movie;
    const episodes = (movie.episodes || []).map((server: any) => ({
        server_name: server.server_name,
        server_data: (server.items || []).map((item: any) => ({
            name: item.name,
            slug: item.slug,
            filename: item.name,
            link_embed: item.embed,
            link_m3u8: item.m3u8,
        })),
    }));

    return {
        status: data.status === "success",
        movie: {
            id: movie.id,
            _id: movie.id,
            name: movie.name,
            slug: movie.slug,
            origin_name: movie.original_name,
            content: movie.description,
            type: "movie",
            status: movie.current_episode,
            thumb_url: movie.thumb_url,
            poster_url: movie.poster_url,
            trailer_url: "",
            time: movie.time,
            episode_current: movie.current_episode,
            episode_total: String(movie.total_episodes || ""),
            quality: movie.quality,
            lang: movie.language,
            year: Number(movie.year) || new Date().getFullYear(),
            actor: movie.casts ? String(movie.casts).split(", ") : [],
            director: movie.director ? String(movie.director).split(", ") : [],
            category: [],
            country: [],
            tmdb: undefined,
        },
        episodes,
    };
}

function isUsableDetail(data: UnifiedResponse | null | undefined): data is UnifiedResponse {
    if (!data) return false;
    if (!data.status) return false;
    if (!data.movie?.slug) return false;
    return Array.isArray(data.episodes);
}

async function fetchJsonWithTimeout<T>(
    url: string,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
    revalidateSeconds: number = DETAIL_REVALIDATE_SECONDS
): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const init: RequestInit & { next?: { revalidate: number } } = {
            signal: controller.signal,
        };

        if (typeof window === "undefined" && revalidateSeconds > 0) {
            init.next = { revalidate: revalidateSeconds };
        }

        const res = await fetch(url, init);
        if (!res.ok) {
            throw new Error(`Fetch failed (${res.status}) for ${url}`);
        }

        return (await res.json()) as T;
    } finally {
        clearTimeout(timer);
    }
}

function getCachedDetail(slug: string): UnifiedResponse | null {
    const cached = detailCache.get(slug);
    if (!cached?.data || !cached.expiresAt) return null;
    if (cached.expiresAt < Date.now()) return null;
    return cached.data;
}

function setCachedDetail(slug: string, data: UnifiedResponse) {
    detailCache.set(slug, {
        data,
        expiresAt: Date.now() + DETAIL_CACHE_TTL_MS,
    });
}

async function fetchFromOPhim(slug: string): Promise<UnifiedResponse> {
    const data = await fetchJsonWithTimeout<any>(`https://ophim1.com/phim/${slug}`, 4200);
    if (!data?.status) {
        throw new Error("OPhim returned invalid payload");
    }
    const normalized = normalizeOPhim(data);
    if (!isUsableDetail(normalized)) {
        throw new Error("OPhim normalized payload is not usable");
    }
    return normalized;
}

async function fetchFromNguonC(slug: string): Promise<UnifiedResponse> {
    const data = await fetchJsonWithTimeout<any>(`https://phim.nguonc.com/api/film/${slug}`, 5000);
    if (data?.status !== "success") {
        throw new Error("NguonC returned invalid payload");
    }
    const normalized = normalizeNguonC(data);
    if (!isUsableDetail(normalized)) {
        throw new Error("NguonC normalized payload is not usable");
    }
    return normalized;
}

async function fetchFromKkPhim(slug: string): Promise<UnifiedResponse> {
    const data = await fetchJsonWithTimeout<any>(`${KKPHIM_BASE_URL}/phim/${slug}`, 5000);
    if (!data?.status) {
        throw new Error("KKPhim returned invalid payload");
    }
    const normalized = normalizeOPhim(data);
    if (!isUsableDetail(normalized)) {
        throw new Error("KKPhim normalized payload is not usable");
    }
    return normalized;
}

export async function getBestStream(slug: string) {
    try {
        const ophimData = await fetchJsonWithTimeout<any>(`https://ophim1.com/phim/${slug}`, 4000, 120);
        const oPhimM3u8 = ophimData?.episodes?.[0]?.server_data?.[0]?.link_m3u8;
        if (oPhimM3u8) {
            return {
                type: "m3u8",
                url: oPhimM3u8,
                source: "OPhim",
            };
        }
    } catch {
        // Continue to fallback providers.
    }

    try {
        return await Promise.any([
            (async () => {
                const data = await fetchJsonWithTimeout<any>(`https://phim.nguonc.com/api/film/${slug}`, 5000, 120);
                const m3u8 = data?.movie?.episodes?.[0]?.items?.[0]?.m3u8;
                if (!m3u8) throw new Error("NguonC stream not found");
                return {
                    type: "m3u8",
                    url: m3u8,
                    source: "NguonC",
                };
            })(),
            (async () => {
                const data = await fetchJsonWithTimeout<any>(`${KKPHIM_BASE_URL}/phim/${slug}`, 5000, 120);
                const m3u8 = data?.episodes?.[0]?.server_data?.[0]?.link_m3u8;
                if (!m3u8) throw new Error("KKPhim stream not found");
                return {
                    type: "m3u8",
                    url: m3u8,
                    source: "KKPhim",
                };
            })(),
        ]);
    } catch {
        return null;
    }
}

export async function getUnifiedMovieDetail(slug: string): Promise<UnifiedResponse> {
    const freshCached = getCachedDetail(slug);
    if (freshCached) {
        return freshCached;
    }

    const existingPromise = detailCache.get(slug)?.promise;
    if (existingPromise) {
        return existingPromise;
    }

    const task = (async (): Promise<UnifiedResponse> => {
        try {
            const primary = await fetchFromOPhim(slug);
            setCachedDetail(slug, primary);
            return primary;
        } catch {
            // Continue to backup providers.
        }

        try {
            const fallback = await Promise.any([
                fetchFromNguonC(slug),
                fetchFromKkPhim(slug),
            ]);
            setCachedDetail(slug, fallback);
            return fallback;
        } catch (error) {
            const stale = detailCache.get(slug)?.data;
            if (stale) {
                return stale;
            }
            console.error("All providers failed for movie slug:", slug, error);
            return {
                status: false,
                movie: {} as UnifiedMovie,
                episodes: [],
            };
        }
    })();

    detailCache.set(slug, {
        ...detailCache.get(slug),
        promise: task,
    });

    try {
        return await task;
    } finally {
        const current = detailCache.get(slug);
        if (current?.promise) {
            detailCache.set(slug, {
                data: current.data,
                expiresAt: current.expiresAt,
            });
        }
    }
}
