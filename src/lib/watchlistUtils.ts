// Watchlist Utilities — localStorage-based "Watch Later" system

export interface WatchlistItem {
    slug: string;
    name: string;
    origin_name: string;
    poster_url: string;
    quality?: string;
    year?: number;
    addedAt: number;
}

const WATCHLIST_KEY = "webforanhs-watchlist";
const MAX_WATCHLIST = 100;

/**
 * Get entire watchlist, sorted by most recently added
 */
export function getWatchlist(): WatchlistItem[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(WATCHLIST_KEY);
        const items: WatchlistItem[] = stored ? JSON.parse(stored) : [];
        return items.sort((a, b) => b.addedAt - a.addedAt);
    } catch {
        return [];
    }
}

/**
 * Check if a movie is in the watchlist
 */
export function isInWatchlist(slug: string): boolean {
    if (typeof window === "undefined") return false;
    try {
        const items = getWatchlist();
        return items.some(item => item.slug === slug);
    } catch {
        return false;
    }
}

/**
 * Add a movie to the watchlist
 */
export function addToWatchlist(item: WatchlistItem): void {
    if (typeof window === "undefined") return;
    try {
        const items = getWatchlist().filter(i => i.slug !== item.slug);
        items.unshift({ ...item, addedAt: Date.now() });
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items.slice(0, MAX_WATCHLIST)));
    } catch (e) {
        console.error("Error adding to watchlist:", e);
    }
}

/**
 * Remove a movie from the watchlist
 */
export function removeFromWatchlist(slug: string): void {
    if (typeof window === "undefined") return;
    try {
        const items = getWatchlist().filter(i => i.slug !== slug);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
    } catch (e) {
        console.error("Error removing from watchlist:", e);
    }
}

/**
 * Toggle a movie in/out of the watchlist. Returns new state.
 */
export function toggleWatchlist(item: WatchlistItem): boolean {
    if (isInWatchlist(item.slug)) {
        removeFromWatchlist(item.slug);
        return false;
    } else {
        addToWatchlist(item);
        return true;
    }
}

/**
 * Clear entire watchlist
 */
export function clearWatchlist(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(WATCHLIST_KEY);
}

/**
 * Get watchlist count
 */
export function getWatchlistCount(): number {
    return getWatchlist().length;
}
