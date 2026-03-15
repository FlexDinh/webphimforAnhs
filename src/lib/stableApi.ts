// KKPhim API Service
const KKPHIM_BASE_URL = "https://phimapi.com"; // KKPhim uses similar structure to PhimAPI, let's try their specific endpoint if available, but for now stick to known reliable ones or try to find their specific domain.
// Actually, based on search, kkphim.vip is the domain. Let's try to infer their API structure or use a known stable one.
// The search result mentioned "kkphim.com" and "kkphim.vip".
// Let's create a robust multi-source fetcher that tries multiple Vietnamese APIs.

export interface VNMovieSimple {
    name: string;
    slug: string;
    year: number;
    thumb_url: string;
    poster_url: string;
    type: string;
}

// KKPhim and NguonC are often similar.
// Let's define a service that aggregates stable links.

export const STABLE_PROVIDERS = [
    {
        name: "KKPhim",
        url: "https://phimapi.com", // PhimAPI is actually very stable and often used by these sites
        image_url: "https://phimimg.com"
    },
    {
        name: "NguonC",
        url: "https://phim.nguonc.com/api",
        image_url: "https://phim.nguonc.com/public/images"
    },
    {
        name: "OPhim",
        url: "https://ophim1.com",
        image_url: "https://img.ophim1.com/uploads/movies"
    }
];

// Function to get high quality stream from best available Vietnamese source
export async function getBestStream(slug: string) {
    // 1. Try OPhim (Main Source - often fastest update)
    try {
        const res = await fetch(`https://ophim1.com/phim/${slug}`);
        const data = await res.json();
        if (data.status && data.episodes?.[0]?.server_data?.[0]?.link_m3u8) {
            // Validate m3u8 link is not empty
            const m3u8 = data.episodes[0].server_data[0].link_m3u8;
            if (m3u8) {
                return {
                    type: 'm3u8',
                    url: m3u8,
                    source: 'OPhim'
                };
            }
        }
    } catch (e) {
        console.error("OPhim failed", e);
    }

    // 2. Try NguonC (Good secondary source)
    try {
        const res = await fetch(`https://phim.nguonc.com/api/film/${slug}`);
        const data = await res.json();
        if (data.status === 'success' && data.movie?.episodes?.[0]?.items?.[0]?.m3u8) {
            const m3u8 = data.movie.episodes[0].items[0].m3u8;
            if (m3u8) {
                return {
                    type: 'm3u8',
                    url: m3u8,
                    source: 'NguonC'
                };
            }
        }
    } catch (e) {
        console.error("NguonC failed", e);
    }

    // 3. Try KKPhim (PhimAPI - as backup)
    try {
        // Note: KKPhim sometimes has different slugs, but often they match
        const res = await fetch(`https://phimapi.com/phim/${slug}`);
        const data = await res.json();
        if (data.status && data.episodes?.[0]?.server_data?.[0]?.link_m3u8) {
            const m3u8 = data.episodes[0].server_data[0].link_m3u8;
            if (m3u8) {
                return {
                    type: 'm3u8',
                    url: m3u8,
                    source: 'KKPhim'
                };
            }
        }
    } catch (e) {
        console.error("KKPhim (PhimAPI) failed", e);
    }

    return null;
}

// Unified Movie Types
export interface UnifiedMovie {
    id: string;
    _id: string; // Keep for compatibility
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

// Helper to normalize OPhim/KKPhim data
function normalizeOPhim(data: any): UnifiedResponse {
    return {
        status: data.status,
        movie: {
            ...data.movie,
            id: data.movie._id,
            _id: data.movie._id,
            tmdb: data.movie.tmdb ? { type: data.movie.tmdb.type, id: data.movie.tmdb.id } : undefined
        },
        episodes: data.episodes || []
    };
}

// Helper to normalize NguonC data
function normalizeNguonC(data: any): UnifiedResponse {
    const movie = data.movie;
    // NguonC episodes structure is different [ { server_name, items: [ { name, slug, embed, m3u8 } ] } ]
    // We map it to OPhim structure
    const episodes = movie.episodes.map((server: any) => ({
        server_name: server.server_name,
        server_data: server.items.map((item: any) => ({
            name: item.name,
            slug: item.slug,
            filename: item.name, // NguonC doesn't have filename, use name
            link_embed: item.embed,
            link_m3u8: item.m3u8
        }))
    }));

    return {
        status: data.status === 'success',
        movie: {
            id: movie.id,
            _id: movie.id,
            name: movie.name,
            slug: movie.slug,
            origin_name: movie.original_name,
            content: movie.description,
            type: 'movie', // Infer or default
            status: movie.current_episode,
            thumb_url: movie.thumb_url,
            poster_url: movie.poster_url,
            trailer_url: "", // NguonC often doesn't have this in simple detail, need validation
            time: movie.time,
            episode_current: movie.current_episode,
            episode_total: String(movie.total_episodes),
            quality: movie.quality,
            lang: movie.language,
            year: 2024,
            actor: movie.casts ? movie.casts.split(', ') : [],
            director: movie.director ? movie.director.split(', ') : [],
            category: [],
            country: [],
            tmdb: undefined
        },
        episodes: episodes
    };
}

export async function getUnifiedMovieDetail(slug: string): Promise<UnifiedResponse> {
    // 1. Try OPhim
    try {
        const res = await fetch(`https://ophim1.com/phim/${slug}`, { next: { revalidate: 300 } });
        const data = await res.json();
        if (data.status) {
            return normalizeOPhim(data);
        }
    } catch (e) {
        console.error("OPhim fetch failed", e);
    }

    // 2. Try NguonC
    try {
        const res = await fetch(`https://phim.nguonc.com/api/film/${slug}`, { next: { revalidate: 300 } });
        const data = await res.json();
        if (data.status === 'success') {
            return normalizeNguonC(data);
        }
    } catch (e) {
        console.error("NguonC fetch failed", e);
    }

    // 3. Try KKPhim
    try {
        const res = await fetch(`https://phimapi.com/phim/${slug}`, { next: { revalidate: 300 } });
        const data = await res.json();
        if (data.status) {
            return normalizeOPhim(data);
        }
    } catch (e) {
        console.error("KKPhim fetch failed", e);
    }

    return {
        status: false,
        movie: {} as any,
        episodes: []
    };
}
