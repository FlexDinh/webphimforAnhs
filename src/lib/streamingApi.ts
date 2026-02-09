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
        id: "embedsu",
        name: "EmbedSU",
        quality: "4K HDR",
        icon: "✨",
        getMovieUrl: (tmdbId) => `https://embed.su/embed/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`,
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
