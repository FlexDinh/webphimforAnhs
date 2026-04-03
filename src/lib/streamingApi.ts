// Stable Streaming Sources - Updated 2025
// Multi-source fallback approach

export interface StreamingSource {
    id: string;
    name: string;
    quality: string;
    icon: string;
    // For TMDB-based sources
    getMovieUrl?: (tmdbId: string) => string;
    getTvUrl?: (tmdbId: string, season: number, episode: number) => string;
}

// Updated TMDB-based sources (tested 2025)
// These are backup sources when OPhim/NguonC don't work
export const TMDB_SOURCES: StreamingSource[] = [
    {
        id: "vidsrc-xyz",
        name: "VidSrc",
        quality: "1080p",
        icon: "🎬",
        getMovieUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://vidsrc.xyz/embed/tv/${tmdbId}/${s}/${e}`,
    },
    {
        id: "superembed",
        name: "SuperEmbed",
        quality: "4K",
        icon: "⚡",
        getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        getTvUrl: (tmdbId, s, e) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`,
    },
    {
        id: "vidsrc-icu",
        name: "VidSrc ICU",
        quality: "1080p",
        icon: "🎥",
        getMovieUrl: (tmdbId) => `https://vidsrc.icu/embed/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://vidsrc.icu/embed/tv/${tmdbId}/${s}/${e}`,
    },
    {
        id: "vidlink",
        name: "VidLink",
        quality: "1080p",
        icon: "🔗",
        getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`,
    },
    {
        id: "videasy",
        name: "Videasy",
        quality: "4K",
        icon: "✨",
        getMovieUrl: (tmdbId) => `https://player.videasy.net/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://player.videasy.net/tv/${tmdbId}/${s}/${e}`,
    },
    {
        id: "autoembed",
        name: "AutoEmbed",
        quality: "1080p",
        icon: "🎯",
        getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`,
    },
    {
        id: "moviesapi",
        name: "MoviesAPI",
        quality: "1080p",
        icon: "🎞️",
        getMovieUrl: (tmdbId) => `https://moviesapi.club/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://moviesapi.club/tv/${tmdbId}-${s}-${e}`,
    },
    {
        id: "vidsrc-vip",
        name: "VidSrc VIP",
        quality: "4K",
        icon: "💎",
        getMovieUrl: (tmdbId) => `https://vidsrc.vip/embed/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://vidsrc.vip/embed/tv/${tmdbId}/${s}/${e}`,
    },
    {
        id: "nontongo",
        name: "NontonGo",
        quality: "1080p",
        icon: "🌏",
        getMovieUrl: (tmdbId) => `https://www.nontongo.win/embed/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://www.nontongo.win/embed/tv/${tmdbId}/${s}/${e}`,
    },
];

// Source priority system
export type SourcePriority = 'ophim' | 'nguonc' | 'tmdb';

export interface VideoSource {
    priority: SourcePriority;
    name: string;
    url: string;
    quality: string;
    isWorking?: boolean;
}

// Check if an iframe URL is accessible (basic check)
export async function checkSourceAvailability(url: string): Promise<boolean> {
    try {
        // Just return true for now - actual iframe checking is complex
        // In production, you'd use a HEAD request or similar
        return true;
    } catch {
        return false;
    }
}

// Get TMDB source URLs for a movie
export function getTmdbMovieSources(tmdbId: string): VideoSource[] {
    return TMDB_SOURCES.map(source => ({
        priority: 'tmdb' as SourcePriority,
        name: `${source.icon} ${source.name}`,
        url: source.getMovieUrl!(tmdbId),
        quality: source.quality,
    }));
}

// Get TMDB source URLs for a TV episode
export function getTmdbTvSources(tmdbId: string, season: number, episode: number): VideoSource[] {
    return TMDB_SOURCES.map(source => ({
        priority: 'tmdb' as SourcePriority,
        name: `${source.icon} ${source.name}`,
        url: source.getTvUrl!(tmdbId, season, episode),
        quality: source.quality,
    }));
}

// Legacy exports for backward compatibility
export const STREAMING_SOURCES = TMDB_SOURCES;

export function getMovieSources(tmdbId: string) {
    return TMDB_SOURCES.map(source => ({
        source,
        url: source.getMovieUrl!(tmdbId),
    }));
}

export function getTvSources(tmdbId: string, season: number, episode: number) {
    return TMDB_SOURCES.map(source => ({
        source,
        url: source.getTvUrl!(tmdbId, season, episode),
    }));
}
