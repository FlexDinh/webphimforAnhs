// Stable Streaming Sources - Updated 2025
// Multi-source fallback approach

export interface StreamingSource {
  id: string;
  name: string;
  quality: string;
  icon: string;
  getMovieUrl?: (tmdbId: string) => string;
  getTvUrl?: (tmdbId: string, season: number, episode: number) => string;
}

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

export type SourcePriority = "ophim" | "nguonc" | "tmdb";

export interface VideoSource {
  priority: SourcePriority;
  name: string;
  url: string;
  quality: string;
  isWorking?: boolean;
}

export async function checkSourceAvailability(_url: string): Promise<boolean> {
  return true;
}

export function getTmdbMovieSources(tmdbId: string): VideoSource[] {
  return TMDB_SOURCES.map((source) => ({
    priority: "tmdb" as SourcePriority,
    name: `${source.icon} ${source.name}`,
    url: source.getMovieUrl!(tmdbId),
    quality: source.quality,
  }));
}

export function getTmdbTvSources(tmdbId: string, season: number, episode: number): VideoSource[] {
  return TMDB_SOURCES.map((source) => ({
    priority: "tmdb" as SourcePriority,
    name: `${source.icon} ${source.name}`,
    url: source.getTvUrl!(tmdbId, season, episode),
    quality: source.quality,
  }));
}

export const STREAMING_SOURCES = TMDB_SOURCES;

export function getMovieSources(tmdbId: string) {
  return TMDB_SOURCES.map((source) => ({
    source,
    url: source.getMovieUrl!(tmdbId),
  }));
}

export function getTvSources(tmdbId: string, season: number, episode: number) {
  return TMDB_SOURCES.map((source) => ({
    source,
    url: source.getTvUrl!(tmdbId, season, episode),
  }));
}
