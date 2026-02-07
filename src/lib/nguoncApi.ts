// NguonC API Service - 32,000+ movies with high quality streams
const NGUONC_BASE_URL = "https://phim.nguonc.com/api";

export interface NguoncMovie {
    name: string;
    slug: string;
    original_name: string;
    thumb_url: string;
    poster_url: string;
    created: string;
    modified: string;
    description: string;
    total_episodes: number;
    current_episode: string;
    time: string | null;
    quality: string;
    language: string;
    director: string | null;
    casts: string | null;
}

export interface NguoncEpisodeItem {
    name: string;
    slug: string;
    embed: string;
    m3u8: string;
}

export interface NguoncServer {
    server_name: string;
    items: NguoncEpisodeItem[];
}

export interface NguoncResponse {
    status: string;
    paginate: {
        current_page: number;
        total_page: number;
        total_items: number;
        items_per_page: number;
    };
    items: NguoncMovie[];
}

export interface NguoncDetailResponse {
    status: string;
    movie: NguoncMovie & {
        id: string;
        category: Record<string, {
            group: { id: string; name: string };
            list: { id: string; name: string }[];
        }>;
        episodes: NguoncServer[];
    };
}

// Fetch latest movies from NguonC
export async function getNguoncLatestMovies(page: number = 1): Promise<NguoncResponse> {
    try {
        const response = await fetch(
            `${NGUONC_BASE_URL}/films/phim-moi-cap-nhat?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch movies");
        return response.json();
    } catch (error) {
        console.error("Error fetching NguonC movies:", error);
        throw error;
    }
}

// Get movie details from NguonC
export async function getNguoncMovieBySlug(slug: string): Promise<NguoncDetailResponse> {
    try {
        const response = await fetch(
            `${NGUONC_BASE_URL}/film/${slug}`,
            { next: { revalidate: 3600 } }
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");
        return response.json();
    } catch (error) {
        console.error("Error fetching NguonC movie details:", error);
        throw error;
    }
}

// Search movies from NguonC
export async function searchNguoncMovies(keyword: string, page: number = 1): Promise<NguoncResponse> {
    try {
        const response = await fetch(
            `${NGUONC_BASE_URL}/films/search?keyword=${encodeURIComponent(keyword)}&page=${page}`,
            { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Failed to search movies");
        return response.json();
    } catch (error) {
        console.error("Error searching NguonC movies:", error);
        throw error;
    }
}

// Get phim bộ (TV series) from NguonC
export async function getNguoncPhimBo(page: number = 1): Promise<NguoncResponse> {
    try {
        const response = await fetch(
            `${NGUONC_BASE_URL}/films/danh-sach/phim-bo?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch phim bo");
        return response.json();
    } catch (error) {
        console.error("Error fetching NguonC phim bo:", error);
        throw error;
    }
}

// Get phim lẻ (Movies) from NguonC
export async function getNguoncPhimLe(page: number = 1): Promise<NguoncResponse> {
    try {
        const response = await fetch(
            `${NGUONC_BASE_URL}/films/danh-sach/phim-le?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch phim le");
        return response.json();
    } catch (error) {
        console.error("Error fetching NguonC phim le:", error);
        throw error;
    }
}

// Get hoạt hình from NguonC
export async function getNguoncHoatHinh(page: number = 1): Promise<NguoncResponse> {
    try {
        const response = await fetch(
            `${NGUONC_BASE_URL}/films/danh-sach/hoat-hinh?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch hoat hinh");
        return response.json();
    } catch (error) {
        console.error("Error fetching NguonC hoat hinh:", error);
        throw error;
    }
}

// Get movies by country from NguonC
export async function getNguoncByCountry(country: string, page: number = 1): Promise<NguoncResponse> {
    try {
        const response = await fetch(
            `${NGUONC_BASE_URL}/films/quoc-gia/${country}?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch country movies");
        return response.json();
    } catch (error) {
        console.error("Error fetching NguonC country movies:", error);
        throw error;
    }
}

// Get movies by category from NguonC  
export async function getNguoncByCategory(category: string, page: number = 1): Promise<NguoncResponse> {
    try {
        const response = await fetch(
            `${NGUONC_BASE_URL}/films/the-loai/${category}?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch category movies");
        return response.json();
    } catch (error) {
        console.error("Error fetching NguonC category movies:", error);
        throw error;
    }
}
