// Movie Utilities - Genre normalization, Watch progress, Recently watched
import { OPhimMovie } from "./ophimApi";

// =============================================
// GENRE NORMALIZATION
// =============================================

interface GenreItem {
    id?: string;
    name: string;
    slug?: string;
}

/**
 * Normalize genres from various API formats into a unified string array
 * Handles: string, string[], { name: string }[], and mixed formats
 */
export function normalizeGenres(movie: OPhimMovie | any): string[] {
    const genres: string[] = [];

    // Handle category array (most common format)
    if (movie.category && Array.isArray(movie.category)) {
        movie.category.forEach((cat: GenreItem | string) => {
            if (typeof cat === "string") {
                genres.push(cat);
            } else if (cat?.name) {
                genres.push(cat.name);
            }
        });
    }

    // Handle single genre string
    if (movie.genre && typeof movie.genre === "string") {
        genres.push(movie.genre);
    }

    // Handle genres array (alternative format)
    if (movie.genres) {
        if (Array.isArray(movie.genres)) {
            movie.genres.forEach((g: string | GenreItem) => {
                if (typeof g === "string") {
                    genres.push(g);
                } else if (g?.name) {
                    genres.push(g.name);
                }
            });
        } else if (typeof movie.genres === "string") {
            genres.push(movie.genres);
        }
    }

    // Normalize: remove duplicates, trim, capitalize first letter
    const normalized = [...new Set(
        genres
            .map(g => g?.trim())
            .filter(g => g && g.length > 0)
            .map(g => g.charAt(0).toUpperCase() + g.slice(1))
    )];

    return normalized;
}

/**
 * Extract all unique genres from a list of movies
 */
export function extractAllGenres(movies: OPhimMovie[]): string[] {
    const allGenres = new Set<string>();

    movies.forEach(movie => {
        normalizeGenres(movie).forEach(genre => {
            allGenres.add(genre);
        });
    });

    return Array.from(allGenres).sort();
}

/**
 * Filter movies by selected genres (movie must have at least one matching genre)
 */
export function filterMoviesByGenres(movies: OPhimMovie[], selectedGenres: string[]): OPhimMovie[] {
    if (!selectedGenres.length) return movies;

    return movies.filter(movie => {
        const movieGenres = normalizeGenres(movie);
        return selectedGenres.some(g => movieGenres.includes(g));
    });
}

/**
 * Get movies with matching genres, ranked by number of shared genres
 */
export function getRelatedMovies(
    currentMovie: OPhimMovie,
    allMovies: OPhimMovie[],
    limit: number = 12
): OPhimMovie[] {
    const currentGenres = normalizeGenres(currentMovie);
    if (!currentGenres.length) return allMovies.slice(0, limit);

    const scored = allMovies
        .filter(m => m._id !== currentMovie._id && m.slug !== currentMovie.slug)
        .map(movie => {
            const movieGenres = normalizeGenres(movie);
            const sharedCount = currentGenres.filter(g => movieGenres.includes(g)).length;
            return { movie, score: sharedCount };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(item => item.movie);
}

// =============================================
// WATCH PROGRESS (Resume Watching)
// =============================================

interface WatchProgress {
    movieSlug: string;
    movieName: string;
    posterUrl: string;
    currentTime: number;  // seconds
    duration: number;     // seconds
    episodeSlug?: string;
    episodeName?: string;
    lastWatched: number;  // timestamp
}

const WATCH_PROGRESS_KEY = "webforanhs-watch-progress";
const MAX_RECENTLY_WATCHED = 20;

/**
 * Save watch progress to localStorage
 */
export function saveWatchProgress(
    movieSlug: string,
    movieName: string,
    posterUrl: string,
    currentTime: number,
    duration: number,
    episodeSlug?: string,
    episodeName?: string
): void {
    if (typeof window === "undefined") return;

    try {
        const progressMap = getProgressMap();
        const key = episodeSlug ? `${movieSlug}:${episodeSlug}` : movieSlug;

        progressMap[key] = {
            movieSlug,
            movieName,
            posterUrl,
            currentTime,
            duration,
            episodeSlug,
            episodeName,
            lastWatched: Date.now()
        };

        // Limit entries
        const entries = Object.entries(progressMap);
        if (entries.length > MAX_RECENTLY_WATCHED) {
            const sorted = entries.sort((a, b) => b[1].lastWatched - a[1].lastWatched);
            const trimmed = Object.fromEntries(sorted.slice(0, MAX_RECENTLY_WATCHED));
            localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(trimmed));
        } else {
            localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(progressMap));
        }
    } catch (e) {
        console.error("Error saving watch progress:", e);
    }
}

/**
 * Get watch progress for a specific movie/episode
 */
export function getWatchProgress(movieSlug: string, episodeSlug?: string): WatchProgress | null {
    if (typeof window === "undefined") return null;

    try {
        const progressMap = getProgressMap();
        const key = episodeSlug ? `${movieSlug}:${episodeSlug}` : movieSlug;
        return progressMap[key] || null;
    } catch (e) {
        console.error("Error getting watch progress:", e);
        return null;
    }
}

/**
 * Get all recently watched movies, sorted by last watched
 */
export function getRecentlyWatched(): WatchProgress[] {
    if (typeof window === "undefined") return [];

    try {
        const progressMap = getProgressMap();
        const entries = Object.values(progressMap);

        // Only return items with significant progress (> 30 seconds watched)
        // and not finished (< 95% complete)
        return entries
            .filter(p => p.currentTime > 30 && (p.currentTime / p.duration) < 0.95)
            .sort((a, b) => b.lastWatched - a.lastWatched);
    } catch (e) {
        console.error("Error getting recently watched:", e);
        return [];
    }
}

/**
 * Clear watch progress for a movie/episode
 */
export function clearWatchProgress(movieSlug: string, episodeSlug?: string): void {
    if (typeof window === "undefined") return;

    try {
        const progressMap = getProgressMap();
        const key = episodeSlug ? `${movieSlug}:${episodeSlug}` : movieSlug;
        delete progressMap[key];
        localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(progressMap));
    } catch (e) {
        console.error("Error clearing watch progress:", e);
    }
}

function getProgressMap(): Record<string, WatchProgress> {
    if (typeof window === "undefined") return {};

    try {
        const stored = localStorage.getItem(WATCH_PROGRESS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
}

// =============================================
// FILTER UTILITIES
// =============================================

/**
 * Filter movies by year
 */
export function filterMoviesByYear(movies: OPhimMovie[], year: number | null): OPhimMovie[] {
    if (!year) return movies;
    return movies.filter(m => m.year === year);
}

/**
 * Filter movies by minimum rating
 */
export function filterMoviesByRating(movies: OPhimMovie[], minRating: number): OPhimMovie[] {
    if (!minRating) return movies;
    return movies.filter(m => {
        const rating = m.tmdb?.vote_average;
        return typeof rating === "number" && rating >= minRating;
    });
}

/**
 * Get all unique years from movies
 */
export function extractAllYears(movies: OPhimMovie[]): number[] {
    const years = new Set<number>();
    movies.forEach(m => {
        if (m.year && typeof m.year === "number") {
            years.add(m.year);
        }
    });
    return Array.from(years).sort((a, b) => b - a);
}
