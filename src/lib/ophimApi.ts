// PhimAPI Service - Newer API with 2024-2026 movies
const PHIMAPI_BASE_URL = "https://phimapi.com";
const PHIMAPI_IMAGE_BASE = "https://phimimg.com";

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

// Get full image URL
export function getImageUrl(path: string): string {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${PHIMAPI_IMAGE_BASE}/${path}`;
}

// Fetch latest movies
export async function getLatestMovies(page: number = 1): Promise<OPhimResponse> {
    try {
        const response = await fetch(
            `${PHIMAPI_BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch movies");
        return response.json();
    } catch (error) {
        console.error("Error fetching latest movies:", error);
        throw error;
    }
}

// Search movies
export async function searchMovies(keyword: string, limit: number = 10): Promise<OPhimMovie[]> {
    try {
        const response = await fetch(
            `${PHIMAPI_BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=${limit}`,
            { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Failed to search movies");
        const data: OPhimSearchResponse = await response.json();
        return data.data?.items || [];
    } catch (error) {
        console.error("Error searching movies:", error);
        return [];
    }
}

// Get movie details by slug
export async function getMovieBySlug(slug: string) {
    try {
        const response = await fetch(
            `${PHIMAPI_BASE_URL}/phim/${slug}`,
            { next: { revalidate: 3600 } }
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");
        return response.json();
    } catch (error) {
        console.error("Error fetching movie details:", error);
        throw error;
    }
}

// Get theatrical movies (chiếu rạp)
export async function getTheatricalMovies(page: number = 1): Promise<OPhimResponse> {
    try {
        const response = await fetch(
            `${PHIMAPI_BASE_URL}/v1/api/danh-sach/phim-le?page=${page}&sort_field=modified.time&category=&country=&year=2025`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch theatrical movies");
        const data = await response.json();
        return {
            status: true,
            msg: "done",
            items: data.data?.items || [],
            pagination: data.data?.params?.pagination || { totalItems: 0, totalItemsPerPage: 24, currentPage: 1, totalPages: 1 }
        };
    } catch (error) {
        console.error("Error fetching theatrical movies:", error);
        throw error;
    }
}

// Get movies by type (phim-le, phim-bo, hoat-hinh, tv-shows)
export async function getMoviesByType(type: string, page: number = 1): Promise<OPhimResponse> {
    try {
        const response = await fetch(
            `${PHIMAPI_BASE_URL}/v1/api/danh-sach/${type}?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch movies by type");
        const data = await response.json();
        return {
            status: true,
            msg: "done",
            items: data.data?.items || [],
            pagination: data.data?.params?.pagination || { totalItems: 0, totalItemsPerPage: 24, currentPage: 1, totalPages: 1 }
        };
    } catch (error) {
        console.error("Error fetching movies by type:", error);
        throw error;
    }
}

// Get movies by category
export async function getMoviesByCategory(category: string, page: number = 1): Promise<OPhimResponse> {
    try {
        const response = await fetch(
            `${PHIMAPI_BASE_URL}/v1/api/the-loai/${category}?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch category movies");
        const data = await response.json();
        return {
            status: true,
            msg: "done",
            items: data.data?.items || [],
            pagination: data.data?.params?.pagination || { totalItems: 0, totalItemsPerPage: 24, currentPage: 1, totalPages: 1 }
        };
    } catch (error) {
        console.error("Error fetching category movies:", error);
        throw error;
    }
}

// Get movies by country
export async function getMoviesByCountry(country: string, page: number = 1): Promise<OPhimResponse> {
    try {
        const response = await fetch(
            `${PHIMAPI_BASE_URL}/v1/api/quoc-gia/${country}?page=${page}`,
            { next: { revalidate: 300 } }
        );
        if (!response.ok) throw new Error("Failed to fetch country movies");
        const data = await response.json();
        return {
            status: true,
            msg: "done",
            items: data.data?.items || [],
            pagination: data.data?.params?.pagination || { totalItems: 0, totalItemsPerPage: 24, currentPage: 1, totalPages: 1 }
        };
    } catch (error) {
        console.error("Error fetching country movies:", error);
        throw error;
    }
}
