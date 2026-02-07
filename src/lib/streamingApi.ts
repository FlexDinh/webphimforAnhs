// HD/4K Streaming APIs Service - Updated with working sources 2025
// Multiple sources for best quality streaming

// Combined sources list with working APIs
export interface StreamingSource {
    id: string;
    name: string;
    quality: string;
    getMovieUrl: (tmdbId: string) => string;
    getTvUrl: (tmdbId: string, season: number, episode: number) => string;
}

export const STREAMING_SOURCES: StreamingSource[] = [
    {
        id: "vidsrc-me",
        name: "VidSrc",
        quality: "1080p",
        getMovieUrl: (tmdbId) => `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}`,
    },
    {
        id: "embed-su",
        name: "EmbedSU",
        quality: "4K",
        getMovieUrl: (tmdbId) => `https://embed.su/embed/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`,
    },
    {
        id: "autoembed",
        name: "AutoEmbed",
        quality: "1080p",
        getMovieUrl: (tmdbId) => `https://player.autoembed.cc/embed/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://player.autoembed.cc/embed/tv/${tmdbId}/${s}/${e}`,
    },
    {
        id: "moviesapi",
        name: "MoviesAPI",
        quality: "HD",
        getMovieUrl: (tmdbId) => `https://moviesapi.club/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://moviesapi.club/tv/${tmdbId}/${s}/${e}`,
    },
    {
        id: "multiembed",
        name: "MultiEmbed",
        quality: "4K HDR",
        getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        getTvUrl: (tmdbId, s, e) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`,
    },
    {
        id: "smashy",
        name: "Smashy",
        quality: "1080p",
        getMovieUrl: (tmdbId) => `https://player.smashy.stream/movie/${tmdbId}`,
        getTvUrl: (tmdbId, s, e) => `https://player.smashy.stream/tv/${tmdbId}?s=${s}&e=${e}`,
    },
];

// Get all available sources for a movie
export function getMovieSources(tmdbId: string): { source: StreamingSource; url: string }[] {
    return STREAMING_SOURCES.map(source => ({
        source,
        url: source.getMovieUrl(tmdbId),
    }));
}

// Get all available sources for a TV episode
export function getTvSources(tmdbId: string, season: number, episode: number): { source: StreamingSource; url: string }[] {
    return STREAMING_SOURCES.map(source => ({
        source,
        url: source.getTvUrl(tmdbId, season, episode),
    }));
}
