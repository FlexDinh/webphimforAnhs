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
    // 1. Try NguonC (often has good HLS)
    try {
        const res = await fetch(`https://phim.nguonc.com/api/film/${slug}`);
        const data = await res.json();
        if (data.status === 'success' && data.movie.episodes[0]?.items[0]) {
            return {
                type: 'm3u8',
                url: data.movie.episodes[0].items[0].m3u8,
                source: 'NguonC'
            };
        }
    } catch (e) {
        console.error("NguonC failed", e);
    }

    // 2. Try PhimAPI (KKPhim)
    try {
        const res = await fetch(`https://phimapi.com/phim/${slug}`);
        const data = await res.json();
        if (data.status && data.episodes[0]?.server_data[0]) {
            return {
                type: 'm3u8',
                url: data.episodes[0].server_data[0].link_m3u8,
                source: 'KKPhim/PhimAPI'
            };
        }
    } catch (e) {
        console.error("PhimAPI failed", e);
    }

    return null;
}
