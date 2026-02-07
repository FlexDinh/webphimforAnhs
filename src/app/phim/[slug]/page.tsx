"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMovieBySlug, getImageUrl } from "@/lib/ophimApi";
import { STREAMING_SOURCES } from "@/lib/streamingApi";
import { usePreferences } from "@/lib/usePreferences";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faArrowLeft, faServer, faClosedCaptioning, faMicrophone, faCrown, faGlobe, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

interface Episode {
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
}

interface Server {
    server_name: string;
    server_data: Episode[];
}

interface MovieDetail {
    status: boolean;
    movie: {
        _id: string;
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
    };
    episodes: Server[];
}

export default function MoviePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    const [selectedServer, setSelectedServer] = useState(0);
    const [hdSource, setHdSource] = useState<string | null>(null);
    const [useHdSource, setUseHdSource] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const fetchMovie = async () => {
            try {
                setLoading(true);
                const data = await getMovieBySlug(slug);
                if (!data.status) {
                    setError("Không tìm thấy phim");
                    return;
                }
                setMovie(data);
                // Auto select first episode
                if (data.episodes?.[0]?.server_data?.[0]) {
                    setSelectedEpisode(data.episodes[0].server_data[0]);
                }
            } catch (err) {
                setError("Không thể tải thông tin phim");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F111A] flex items-center justify-center pt-[70px]">
                <div className="flex flex-col items-center gap-[16px]">
                    <div className="w-[50px] h-[50px] border-4 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white/60 text-[14px]">Đang tải phim...</p>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-[#0F111A] flex items-center justify-center pt-[70px]">
                <div className="text-center">
                    <p className="text-white text-[18px] mb-[16px]">{error || "Không tìm thấy phim"}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-[20px] py-[10px] bg-[#FFD875] text-black rounded-full font-semibold hover:bg-[#FFD875]/90 transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const { movie: movieData, episodes } = movie;

    // Get server type icon
    const getServerIcon = (serverName: string) => {
        if (serverName.toLowerCase().includes("vietsub")) return faClosedCaptioning;
        if (serverName.toLowerCase().includes("thuyết minh") || serverName.toLowerCase().includes("lồng tiếng")) return faMicrophone;
        return faServer;
    };

    const [theaterMode, setTheaterMode] = useState(false);

    // Keyboard shortcut for theater mode (T key)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 't' || e.key === 'T') {
                setTheaterMode(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div className="min-h-screen bg-[#0F111A] pt-[70px]">
            {/* Theater Mode Overlay */}
            {theaterMode && (
                <div
                    className="fixed inset-0 bg-black/90 z-[50]"
                    onClick={() => setTheaterMode(false)}
                />
            )}

            {/* Video Player */}
            <div className={`relative w-full bg-black ${theaterMode ? 'z-[51]' : ''}`}>
                {/* Theater Mode Toggle Button */}
                <button
                    onClick={() => setTheaterMode(!theaterMode)}
                    className={`absolute top-[10px] left-[10px] z-20 px-[12px] py-[6px] rounded-full text-[11px] font-medium transition-all flex items-center gap-[6px] ${theaterMode
                        ? 'bg-[var(--accent-color)] text-black'
                        : 'bg-black/50 text-white hover:bg-black/70'
                        }`}
                    title="Theater Mode (T)"
                >
                    <FontAwesomeIcon icon={theaterMode ? faSun : faMoon} className="text-[10px]" />
                    {theaterMode ? 'Bật đèn' : 'Tắt đèn'}
                </button>

                {useHdSource && hdSource ? (
                    <div className="aspect-video max-h-[80vh] mx-auto relative">
                        <div className="absolute top-[10px] right-[10px] z-10 px-[10px] py-[4px] bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold rounded-full flex items-center gap-[4px]">
                            <FontAwesomeIcon icon={faCrown} className="text-[10px]" />
                            HD/4K
                        </div>
                        <iframe
                            src={hdSource}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    </div>
                ) : selectedEpisode?.link_embed ? (
                    <div className="aspect-video max-h-[80vh] mx-auto">
                        <iframe
                            src={selectedEpisode.link_embed}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    </div>
                ) : (
                    <div className="aspect-video max-h-[80vh] mx-auto flex items-center justify-center bg-[#1a1c2e]">
                        <div className="text-center">
                            <FontAwesomeIcon icon={faPlay} className="text-[60px] text-white/20 mb-[16px]" />
                            <p className="text-white/40">Chọn tập phim để xem</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="container max-w-[1400px] mx-auto px-[16px] py-[30px]">
                {/* Back button + Current playing */}
                <div className="flex items-center gap-[16px] mb-[24px]">
                    <button
                        onClick={() => router.back()}
                        className="p-[10px] rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[14px]" />
                    </button>
                    {selectedEpisode && (
                        <div className="text-white/60 text-[14px]">
                            Đang xem: <span className="text-[#FFD875]">{selectedEpisode.name}</span>
                            {episodes[selectedServer] && (
                                <span className="ml-[8px] text-white/40">
                                    ({episodes[selectedServer].server_name})
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Movie Info */}
                <div className="flex flex-col lg:flex-row gap-[30px] mb-[40px]">
                    {/* Poster */}
                    <div className="w-[180px] flex-shrink-0 mx-auto lg:mx-0">
                        <Image
                            src={getImageUrl(movieData.poster_url || movieData.thumb_url)}
                            alt={movieData.name}
                            width={180}
                            height={270}
                            className="rounded-[12px] w-full shadow-xl"
                            unoptimized
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-[26px] lg:text-[32px] font-bold text-white mb-[8px]">
                            {String(movieData.name || "")}
                        </h1>
                        <p className="text-[#FFD875] text-[16px] mb-[16px]">
                            {String(movieData.origin_name || "")}
                        </p>

                        <div className="flex flex-wrap gap-[10px] mb-[16px]">
                            {movieData.quality && (
                                <span className="px-[12px] py-[5px] bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black text-[12px] font-semibold rounded-full">
                                    {String(movieData.quality)}
                                </span>
                            )}
                            {movieData.lang && (
                                <span className="px-[12px] py-[5px] bg-white/10 text-white text-[12px] rounded-full border border-white/20">
                                    {String(movieData.lang)}
                                </span>
                            )}
                            <span className="px-[12px] py-[5px] bg-white/10 text-white text-[12px] rounded-full border border-white/20">
                                {String(movieData.year)}
                            </span>
                            {movieData.time && (
                                <span className="px-[12px] py-[5px] bg-white/10 text-white text-[12px] rounded-full border border-white/20">
                                    {String(movieData.time)}
                                </span>
                            )}
                        </div>

                        <div className="text-white/70 text-[14px] mb-[12px]">
                            <span className="text-white">Trạng thái: </span>
                            <span className="text-[#FFD875]">{String(movieData.episode_current || "")}</span>
                            {movieData.episode_total && ` / ${String(movieData.episode_total)}`}
                        </div>

                        {movieData.category?.length > 0 && (
                            <div className="flex flex-wrap gap-[8px] mb-[16px]">
                                {movieData.category.map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="px-[12px] py-[4px] border border-white/20 text-[12px] text-white/70 rounded-full hover:border-[#FFD875] hover:text-[#FFD875] cursor-pointer transition-colors"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {movieData.content && (
                            <div className="text-white/60 text-[14px] leading-relaxed max-h-[100px] overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: String(movieData.content || "") }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Server & Episodes */}
                {episodes && episodes.length > 0 && (
                    <div className="bg-[#1a1c2e] rounded-[16px] p-[20px] lg:p-[24px]">
                        <h2 className="text-white text-[18px] font-semibold mb-[20px] flex items-center gap-[10px]">
                            <FontAwesomeIcon icon={faPlay} className="text-[#FFD875]" />
                            Danh sách tập phim
                        </h2>

                        {/* HD/4K Premium Sources - Always show */}
                        <div className="mb-[24px] p-[16px] bg-gradient-to-r from-[#1e1e3f] to-[#2a1e3f] rounded-[12px] border border-[#FFD875]/20">
                            <div className="flex items-center justify-between mb-[12px]">
                                <div className="flex items-center gap-[8px]">
                                    <FontAwesomeIcon icon={faCrown} className="text-[#FFD875]" />
                                    <p className="text-[#FFD875] text-[13px] font-semibold uppercase tracking-wider">Nguồn HD/4K Premium</p>
                                </div>
                                <div className="flex gap-[8px]">
                                    {/* Quick Fix Button */}
                                    <button
                                        onClick={async () => {
                                            if (movieData.slug) {
                                                // Try to get stable stream from Vietnamese sources first
                                                // Using a direct fetch here or import from stableApi would be better
                                                // For now let's just use the known stable domain directly for simplicity in this view
                                                const stableUrl = `https://vidsrc.me/embed/movie?tmdb=${movieData.tmdb?.id}`;
                                                const backupUrl = `https://www.2embed.cc/embed/${movieData.tmdb?.id}`;

                                                // Toggle between two very stable backups
                                                if (hdSource === stableUrl) {
                                                    setHdSource(backupUrl);
                                                } else {
                                                    setHdSource(stableUrl);
                                                }
                                                setUseHdSource(true);
                                            }
                                        }}
                                        className="px-[12px] py-[6px] rounded-full text-[11px] bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 flex items-center gap-[4px]"
                                    >
                                        ⚡ Link Dự Phòng
                                    </button>

                                    {useHdSource && (
                                        <button
                                            onClick={() => {
                                                setUseHdSource(false);
                                                setHdSource(null);
                                            }}
                                            className="px-[12px] py-[6px] rounded-full text-[11px] bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                        >
                                            ✕ Tắt HD
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-[8px]">
                                {STREAMING_SOURCES.map((source) => (
                                    <button
                                        key={source.id}
                                        onClick={() => {
                                            // Use movie slug/name to search or direct embed
                                            const tmdbId = movieData.tmdb?.id || "";
                                            if (tmdbId) {
                                                const url = movieData.tmdb?.type === "tv"
                                                    ? source.getTvUrl(tmdbId, 1, 1)
                                                    : source.getMovieUrl(tmdbId);
                                                setHdSource(url);
                                            } else {
                                                // Fallback: use VidSrc search by title
                                                const searchUrl = `https://vidsrc.xyz/embed/movie?imdb=${movieData.slug}`;
                                                setHdSource(source.getMovieUrl(movieData.slug));
                                            }
                                            setUseHdSource(true);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className={`px-[14px] py-[8px] rounded-full text-[12px] transition-all flex items-center gap-[6px] ${hdSource?.includes(source.id) || hdSource?.includes(source.id.replace("-", ""))
                                            ? "bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold"
                                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
                                        {source.name}
                                        <span className={`px-[6px] py-[1px] rounded text-[9px] font-bold ${source.quality.includes("4K")
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                            : "bg-blue-500/80 text-white"
                                            }`}>
                                            {source.quality}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[#888] text-[11px] mt-[10px]">
                                💡 Nguồn HD/4K quốc tế. {movieData.tmdb?.id ? `TMDB ID: ${movieData.tmdb.id}` : "Chất lượng cao, có thể không có phụ đề Việt."}
                            </p>
                        </div>

                        {/* Server Selection */}
                        <div className="mb-[20px]">
                            <p className="text-white/50 text-[12px] uppercase tracking-wider mb-[10px]">Chọn Server Vietsub</p>
                            <div className="flex flex-wrap gap-[8px]">
                                {episodes.map((server, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedServer(idx);
                                            if (server.server_data[0]) {
                                                setSelectedEpisode(server.server_data[0]);
                                            }
                                        }}
                                        className={`px-[16px] py-[10px] rounded-full text-[13px] whitespace-nowrap transition-all flex items-center gap-[8px] ${selectedServer === idx
                                            ? "bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold shadow-lg shadow-[#FFD875]/20"
                                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={getServerIcon(server.server_name)} className="text-[12px]" />
                                        {server.server_name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Episode Buttons */}
                        <div>
                            <p className="text-white/50 text-[12px] uppercase tracking-wider mb-[10px]">Chọn Tập</p>
                            <div className="flex flex-wrap gap-[8px] max-h-[300px] overflow-y-auto">
                                {episodes[selectedServer]?.server_data.map((ep, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedEpisode(ep);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className={`min-w-[60px] px-[16px] py-[10px] rounded-[10px] text-[13px] transition-all ${selectedEpisode?.slug === ep.slug
                                            ? "bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold shadow-lg shadow-[#FFD875]/20"
                                            : "bg-white/5 text-white hover:bg-white/15 border border-white/10"
                                            }`}
                                    >
                                        {ep.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
