"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import { useParams, useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/ophimApi";
import { getProxiedImageUrl } from "@/lib/imageProxy";
import { getUnifiedMovieDetail, UnifiedResponse as MovieDetail, UnifiedEpisode as Episode, UnifiedServer as Server } from "@/lib/stableApi";
import { STREAMING_SOURCES } from "@/lib/streamingApi";
import { usePreferences } from "@/lib/usePreferences";
import { saveWatchProgress } from "@/lib/movieUtils";
import { isInWatchlist, toggleWatchlist, WatchlistItem } from "@/lib/watchlistUtils";
import { isThuyetMinhServerName } from "@/lib/movieClassification";
import { getSafeEmbedUrl, PLAYER_IFRAME_ALLOW, PLAYER_IFRAME_SANDBOX } from "@/lib/playerSecurity";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay, faArrowLeft, faServer, faClosedCaptioning, faMicrophone,
    faCrown, faGlobe, faMoon, faSun, faForwardStep, faBackwardStep,
    faShareNodes, faCopy, faCheck, faBookmark as faBookmarkSolid,
    faHeart
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-solid-svg-icons";



export default function MoviePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    const [selectedEpisodeIdx, setSelectedEpisodeIdx] = useState(0);
    const [selectedServer, setSelectedServer] = useState(0);
    const [hdSource, setHdSource] = useState<string | null>(null);
    const [useHdSource, setUseHdSource] = useState(false);
    const [theaterMode, setTheaterMode] = useState(false);
    const [autoSelectNotice, setAutoSelectNotice] = useState<string | null>(null);
    const { preferences } = usePreferences();
    const [episodeView, setEpisodeView] = useState<'list'|'grid'>('list');

    // Player loading state
    const [playerLoading, setPlayerLoading] = useState(false);
    const [playerSlow, setPlayerSlow] = useState(false);
    const [playerBlocked, setPlayerBlocked] = useState(false); // OpenResty/blocked detect
    const playerSlowTimerRef = useRef<NodeJS.Timeout | null>(null);
    const iframeKey = useRef(0);
    const iframeLoadStartRef = useRef<number>(0); // timestamp khi bắt đầu load iframe

    // Auto-play next episode
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
    const [showAutoPlayOverlay, setShowAutoPlayOverlay] = useState(false);
    const [autoPlayCountdown, setAutoPlayCountdown] = useState(8);
    const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Share
    const [copied, setCopied] = useState(false);

    // Watchlist
    const [inWatchlist, setInWatchlist] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const fetchMovie = async () => {
            try {
                setLoading(true);
                const data = await getUnifiedMovieDetail(slug);
                if (!data.status) {
                    setError("Không tìm thấy phim");
                    return;
                }
                setMovie(data);

                // Check watchlist
                setInWatchlist(isInWatchlist(slug));

                // Auto select server based on user preference
                if (data.episodes?.length > 0) {
                    let targetServerIdx = 0;

                    if (preferences.preferredServer === "thuyet-minh") {
                        const tmIdx = data.episodes.findIndex((s: any) => {
                            if (isThuyetMinhServerName(s.server_name)) return true;
                            const name = s.server_name?.toLowerCase() || "";
                            return name.includes("thuyết minh") || name.includes("lồng tiếng") || name.includes("thuyet minh");
                        });
                        if (tmIdx >= 0) {
                            targetServerIdx = tmIdx;
                            setAutoSelectNotice("🎙️ Đã tự động chọn server Thuyết Minh theo cài đặt");
                            setTimeout(() => setAutoSelectNotice(null), 4000);
                        }
                    } else if (preferences.preferredServer === "vietsub") {
                        const vsIdx = data.episodes.findIndex((s: any) => {
                            const name = s.server_name?.toLowerCase() || "";
                            return name.includes("vietsub");
                        });
                        if (vsIdx >= 0) {
                            targetServerIdx = vsIdx;
                        }
                    }

                    setSelectedServer(targetServerIdx);
                    if (data.episodes[targetServerIdx]?.server_data?.[0]) {
                        setSelectedEpisode(data.episodes[targetServerIdx].server_data[0]);
                        setSelectedEpisodeIdx(0);
                    }
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case 't':
                    setTheaterMode(prev => !prev);
                    break;
                case 'n':
                    // Next episode
                    handleNextEpisode();
                    break;
                case 'p':
                    // Previous episode
                    handlePrevEpisode();
                    break;
                case 'f':
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                        if (document.fullscreenElement) {
                            document.exitFullscreen().catch(err => console.log(err));
                        } else {
                            iframe.requestFullscreen().catch(err => console.log(err));
                        }
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    // Optional: could send postMessage to iframe if API supported
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [movie, selectedServer, selectedEpisodeIdx]);

    // Theater mode: toggle header/footer visibility
    useEffect(() => {
        if (theaterMode) {
            document.body.classList.add('theater-active');
        } else {
            document.body.classList.remove('theater-active');
        }
        return () => document.body.classList.remove('theater-active');
    }, [theaterMode]);

    // Auto-play countdown
    useEffect(() => {
        if (showAutoPlayOverlay && autoPlayCountdown > 0) {
            autoPlayTimerRef.current = setTimeout(() => {
                setAutoPlayCountdown(prev => prev - 1);
            }, 1000);
        } else if (showAutoPlayOverlay && autoPlayCountdown === 0) {
            handleNextEpisode();
            setShowAutoPlayOverlay(false);
            setAutoPlayCountdown(8);
        }

        return () => {
            if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
        };
    }, [showAutoPlayOverlay, autoPlayCountdown]);

    // Save watch progress periodically
    useEffect(() => {
        if (!movie || !selectedEpisode) return;

        const progressInterval = setInterval(() => {
            saveWatchProgress(
                movie.movie.slug,
                movie.movie.name,
                movie.movie.poster_url || movie.movie.thumb_url,
                30, // approximate
                120,
                selectedEpisode.slug,
                selectedEpisode.name
            );
        }, 30000); // every 30 seconds

        // Save immediately on episode change
        saveWatchProgress(
            movie.movie.slug,
            movie.movie.name,
            movie.movie.poster_url || movie.movie.thumb_url,
            1,
            120,
            selectedEpisode.slug,
            selectedEpisode.name
        );

        return () => clearInterval(progressInterval);
    }, [movie, selectedEpisode]);

    const currentServerData = movie?.episodes?.[selectedServer]?.server_data || [];
    const hasNextEpisode = selectedEpisodeIdx < currentServerData.length - 1;
    const hasPrevEpisode = selectedEpisodeIdx > 0;

    // Detect DNS block or ISP block for current embed link
    useEffect(() => {
        const urlToCheck = useHdSource ? hdSource : selectedEpisode?.link_embed;
        const targetUrl = getSafeEmbedUrl(urlToCheck);
        if (!targetUrl) return;

        try {
            const urlObj = new URL(targetUrl.startsWith("//") ? `https:${targetUrl}` : targetUrl);
            const checkOrigin = urlObj.origin;
            
            // Fire a lightweight no-cors request to test if the domain resolves
            // If DNS is blocked (e.g. NXDOMAIN for vip.opstream10.com), fetch will throw immediately
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            
            fetch(checkOrigin, { mode: 'no-cors', method: 'HEAD', signal: controller.signal })
                .then(() => {
                    clearTimeout(timeout);
                    // Domain is reachable (though it might still return OpenResty error, handled by iframe onLoad)
                })
                .catch((err) => {
                    clearTimeout(timeout);
                    // Abort error means it just timed out. Network error means DNS blocked.
                    if (err.name !== 'AbortError') {
                        console.warn("Domain bị chặn (DNS/Connection):", checkOrigin);
                        setPlayerBlocked(true);
                    }
                });
        } catch (e) {
            // Invalid URL
        }
    }, [selectedEpisode, hdSource, useHdSource]);

    // Auto switch to next server
    const handleSwitchToNextServer = useCallback(() => {
        if (!movie) return;
        const eps = movie.episodes;
        if (!eps || eps.length === 0) return;
        const nextIdx = (selectedServer + 1) % eps.length;
        setSelectedServer(nextIdx);
        const ep = eps[nextIdx]?.server_data?.[selectedEpisodeIdx] || eps[nextIdx]?.server_data?.[0];
        if (ep) {
            setSelectedEpisode(ep);
            setSelectedEpisodeIdx(eps[nextIdx]?.server_data?.[selectedEpisodeIdx] ? selectedEpisodeIdx : 0);
        }
        setUseHdSource(false);
        setHdSource(null);
        setPlayerBlocked(false);
        setPlayerSlow(false);
        setPlayerLoading(true);
        iframeLoadStartRef.current = Date.now();
        iframeKey.current += 1;
        if (playerSlowTimerRef.current) clearTimeout(playerSlowTimerRef.current);
        playerSlowTimerRef.current = setTimeout(() => setPlayerSlow(true), 10000);
        setAutoSelectNotice(`⚡ Đã tự động đổi sang: ${eps[nextIdx]?.server_name}`);
        setTimeout(() => setAutoSelectNotice(null), 3000);
    }, [movie, selectedServer, selectedEpisodeIdx]);

    // Start loading player with slow-server detection
    const startPlayerLoad = useCallback(() => {
        setPlayerLoading(true);
        setPlayerSlow(false);
        setPlayerBlocked(false);
        iframeLoadStartRef.current = Date.now();
        iframeKey.current += 1;
        if (playerSlowTimerRef.current) clearTimeout(playerSlowTimerRef.current);
        playerSlowTimerRef.current = setTimeout(() => {
            setPlayerSlow(true);
        }, 10000); // warn after 10s
    }, []);

    const handlePlayerLoaded = useCallback(() => {
        const elapsed = Date.now() - iframeLoadStartRef.current;
        setPlayerLoading(false);
        if (playerSlowTimerRef.current) clearTimeout(playerSlowTimerRef.current);
        setPlayerSlow(false);
        // OpenResty/Nginx error pages load cực nhanh (< 900ms)
        // Video player thật mất ít nhất 1-3s để init
        if (elapsed < 900 && iframeLoadStartRef.current > 0) {
            setPlayerBlocked(true);
        } else {
            setPlayerBlocked(false);
        }
    }, []);

    const handleNextEpisode = useCallback(() => {
        if (!movie || !hasNextEpisode) return;
        const nextIdx = selectedEpisodeIdx + 1;
        const nextEp = currentServerData[nextIdx];
        if (nextEp) {
            setSelectedEpisode(nextEp);
            setSelectedEpisodeIdx(nextIdx);
            setUseHdSource(false);
            setHdSource(null);
            startPlayerLoad();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [movie, selectedEpisodeIdx, currentServerData, hasNextEpisode, startPlayerLoad]);

    const handlePrevEpisode = useCallback(() => {
        if (!movie || !hasPrevEpisode) return;
        const prevIdx = selectedEpisodeIdx - 1;
        const prevEp = currentServerData[prevIdx];
        if (prevEp) {
            setSelectedEpisode(prevEp);
            setSelectedEpisodeIdx(prevIdx);
            setUseHdSource(false);
            setHdSource(null);
            startPlayerLoad();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [movie, selectedEpisodeIdx, currentServerData, hasPrevEpisode, startPlayerLoad]);

    // Trigger auto-play overlay (simulated — in real scenario, would detect video end via postMessage)
    const triggerAutoPlay = useCallback(() => {
        if (autoPlayEnabled && hasNextEpisode) {
            setShowAutoPlayOverlay(true);
            setAutoPlayCountdown(8);
        }
    }, [autoPlayEnabled, hasNextEpisode]);

    const cancelAutoPlay = useCallback(() => {
        setShowAutoPlayOverlay(false);
        setAutoPlayCountdown(8);
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    }, []);

    // Share
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: movie?.movie.name || "Xem phim",
                    text: `Xem ${movie?.movie.name} trên RoPhim`,
                    url
                });
            } catch { }
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Watchlist
    const handleToggleWatchlist = () => {
        if (!movie) return;
        const item: WatchlistItem = {
            slug: movie.movie.slug,
            name: movie.movie.name,
            origin_name: movie.movie.origin_name,
            poster_url: movie.movie.poster_url || movie.movie.thumb_url,
            quality: movie.movie.quality,
            year: movie.movie.year,
            addedAt: Date.now()
        };
        toggleWatchlist(item);
        setInWatchlist(isInWatchlist(movie.movie.slug));
    };

    // Get server type icon
    const getServerIcon = (serverName: string) => {
        if (serverName.toLowerCase().includes("vietsub")) return faClosedCaptioning;
        if (isThuyetMinhServerName(serverName)) return faMicrophone;
        if (serverName.toLowerCase().includes("thuyết minh") || serverName.toLowerCase().includes("lồng tiếng")) return faMicrophone;
        return faServer;
    };

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
    const safeHdSource = useHdSource ? getSafeEmbedUrl(hdSource) : "";
    const safeEpisodeEmbed = getSafeEmbedUrl(selectedEpisode?.link_embed);

    return (
        <div className={`tv-watch-page min-h-screen bg-[#0F111A] pt-[70px] ${theaterMode ? 'theater-page' : ''}`}>
            {/* Auto-select notification toast */}
            {autoSelectNotice && (
                <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[200] px-[20px] py-[12px] bg-gradient-to-r from-[#1e1e3f] to-[#2a1e3f] border border-[#FFD875]/40 rounded-full text-[#FFD875] text-[13px] font-medium shadow-xl animate-fade-in flex items-center gap-[8px]">
                    {autoSelectNotice}
                    <button onClick={() => setAutoSelectNotice(null)} className="ml-[8px] text-white/40 hover:text-white">
                        ✕
                    </button>
                </div>
            )}

            {/* Theater Mode Overlay */}
            {theaterMode && (
                <div
                    className="fixed inset-0 bg-black/95 z-[50]"
                    onClick={() => setTheaterMode(false)}
                />
            )}

            {/* Video Player */}
            <div className={`relative w-full bg-black ${theaterMode ? 'z-[51]' : ''}`}>
                {/* Player Controls Bar */}
                <div className="absolute top-[10px] left-[10px] right-[10px] z-20 flex items-center justify-between">
                    {/* Left: Theater Mode */}
                    <button
                        onClick={() => setTheaterMode(!theaterMode)}
                        className={`px-[12px] py-[6px] rounded-full text-[11px] font-medium transition-all flex items-center gap-[6px] ${theaterMode
                            ? 'bg-[var(--accent-color)] text-black'
                            : 'bg-black/50 text-white hover:bg-black/70'
                            }`}
                        title="Theater Mode (T)"
                    >
                        <FontAwesomeIcon icon={theaterMode ? faSun : faMoon} className="text-[10px]" />
                        {theaterMode ? 'Bật đèn' : 'Tắt đèn'}
                    </button>
                    <div className="ml-3 text-white/50 text-[11px] bg-black/50 px-2 py-1 rounded-md hidden sm:block">
                        Phím tắt (?)
                    </div>

                    {/* Right: Episode Nav + Auto-play toggle */}
                    <div className="flex items-center gap-[6px]">
                        {/* Auto-play toggle */}
                        {currentServerData.length > 1 && (
                            <button
                                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                                className={`px-[10px] py-[6px] rounded-full text-[10px] font-medium transition-all ${autoPlayEnabled
                                    ? 'bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/40'
                                    : 'bg-black/50 text-white/60 border border-white/10'
                                    }`}
                                title="Tự động phát tập tiếp theo"
                            >
                                {autoPlayEnabled ? '▶ Auto' : '⏸ Auto'}
                            </button>
                        )}

                        {/* Prev episode */}
                        {hasPrevEpisode && (
                            <button
                                onClick={handlePrevEpisode}
                                className="px-[10px] py-[6px] rounded-full text-[11px] bg-black/50 text-white hover:bg-black/70 flex items-center gap-[4px]"
                                title="Tập trước (P)"
                            >
                                <FontAwesomeIcon icon={faBackwardStep} className="text-[10px]" />
                            </button>
                        )}

                        {/* Next episode */}
                        {hasNextEpisode && (
                            <button
                                onClick={handleNextEpisode}
                                className="px-[10px] py-[6px] rounded-full text-[11px] bg-black/50 text-white hover:bg-black/70 flex items-center gap-[4px]"
                                title="Tập sau (N)"
                            >
                                <FontAwesomeIcon icon={faForwardStep} className="text-[10px]" />
                                <span className="hidden sm:inline">Tập sau</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Auto-play Next Episode Overlay */}
                {showAutoPlayOverlay && hasNextEpisode && (
                    <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center">
                        <div className="text-center animate-fade-in">
                            <p className="text-white/60 text-[14px] mb-[8px]">Tập tiếp theo trong</p>
                            <div className="relative w-[80px] h-[80px] mx-auto mb-[16px]">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                                    <circle
                                        cx="18" cy="18" r="16" fill="none" stroke="#FFD875" strokeWidth="2"
                                        strokeDasharray={`${(autoPlayCountdown / 8) * 100} 100`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[28px] font-bold text-white">
                                    {autoPlayCountdown}
                                </span>
                            </div>
                            <p className="text-[#FFD875] text-[16px] font-semibold mb-[4px]">
                                {currentServerData[selectedEpisodeIdx + 1]?.name}
                            </p>
                            <div className="flex items-center gap-[12px] justify-center mt-[16px]">
                                <button
                                    onClick={cancelAutoPlay}
                                    className="px-[20px] py-[10px] rounded-full bg-white/10 text-white text-[13px] hover:bg-white/20 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => { handleNextEpisode(); cancelAutoPlay(); }}
                                    className="px-[20px] py-[10px] rounded-full bg-[#FFD875] text-black text-[13px] font-semibold hover:bg-[#FFD875]/90 transition-colors flex items-center gap-[6px]"
                                >
                                    <FontAwesomeIcon icon={faForwardStep} className="text-[11px]" />
                                    Phát ngay
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {useHdSource && hdSource ? (
                    <div className="tv-player-frame mx-auto relative">
                        <div className="absolute top-[10px] right-[10px] z-10 px-[10px] py-[4px] bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold rounded-full flex items-center gap-[4px]">
                            <FontAwesomeIcon icon={faCrown} className="text-[10px]" />
                            HD/4K
                        </div>
                        {safeHdSource ? (
                            <iframe
                                key={`hd-${iframeKey.current}`}
                                src={safeHdSource}
                                className="w-full h-full"
                                title="RoPhim HD player"
                                allowFullScreen
                                allow={PLAYER_IFRAME_ALLOW}
                                sandbox={PLAYER_IFRAME_SANDBOX}
                                referrerPolicy="origin"
                                onLoad={handlePlayerLoaded}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1c2e] gap-4 p-6">
                                <div className="text-5xl mb-2">🔒</div>
                                <p className="text-white/70 text-[15px] font-medium">Nguồn HD bị chặn</p>
                                <p className="text-white/40 text-[13px] text-center">Hãy thử chuyển sang nguồn khác bên dưới</p>
                                {episodes && episodes.length > 1 && (
                                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                                        {episodes.map((srv, idx) => (
                                            <button key={idx}
                                                onClick={() => {
                                                    setSelectedServer(idx);
                                                    const ep = srv.server_data?.[selectedEpisodeIdx] || srv.server_data?.[0];
                                                    if (ep) { setSelectedEpisode(ep); setSelectedEpisodeIdx(ep === srv.server_data?.[selectedEpisodeIdx] ? selectedEpisodeIdx : 0); }
                                                    setUseHdSource(false); setHdSource(null); startPlayerLoad();
                                                }}
                                                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${
                                                    idx === selectedServer
                                                        ? 'bg-[#FFD875] text-black'
                                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                                }`}
                                            >
                                                {srv.server_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : selectedEpisode?.link_embed ? (
                    <div className="tv-player-frame mx-auto relative">
                        {/* Loading overlay */}
                        {playerLoading && (
                            <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center gap-[12px]">
                                <div className="w-[40px] h-[40px] border-4 border-[#FFD875]/30 border-t-[#FFD875] rounded-full animate-spin" />
                                <p className="text-white/60 text-[13px]">Đang tải video...</p>
                            </div>
                        )}
                        {/* Slow server warning */}
                        {playerSlow && (
                            <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-[10px] px-[16px] py-[10px] bg-black/90 border border-orange-500/50 rounded-full text-[12px] whitespace-nowrap">
                                <span className="text-orange-400">⚠️ Server đang chậm</span>
                                <button
                                    onClick={() => {
                                        if (!movie || !episodes) return;
                                        const nextServer = (selectedServer + 1) % episodes.length;
                                        setSelectedServer(nextServer);
                                        const ep = episodes[nextServer]?.server_data?.[0];
                                        if (ep) { setSelectedEpisode(ep); setSelectedEpisodeIdx(0); }
                                        setUseHdSource(false); setHdSource(null);
                                        startPlayerLoad();
                                    }}
                                    className="px-[10px] py-[4px] bg-[#FFD875] text-black text-[11px] font-bold rounded-full hover:bg-[#FFE49A] transition-colors"
                                >
                                    Đổi server →
                                </button>
                                <button onClick={() => setPlayerSlow(false)} className="text-white/40 hover:text-white">✕</button>
                            </div>
                        )}
                        {safeEpisodeEmbed && !playerBlocked ? (
                            <iframe
                                key={`ep-${iframeKey.current}-${selectedEpisode.slug}`}
                                src={safeEpisodeEmbed}
                                className="w-full h-full"
                                title={`RoPhim player - ${selectedEpisode.name}`}
                                allowFullScreen
                                allow={PLAYER_IFRAME_ALLOW}
                                sandbox={PLAYER_IFRAME_SANDBOX}
                                referrerPolicy="origin"
                                onLoad={handlePlayerLoaded}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1c2e] gap-4 p-6">
                                <div className="text-5xl mb-2">🔒</div>
                                <p className="text-white/70 text-[15px] font-medium">
                                    {playerBlocked ? "Nguồn phim bị chặn (OpenResty)" : "Nguồn phim không hợp lệ"}
                                </p>
                                <p className="text-white/40 text-[13px] text-center">Nguồn này không khả dụng. Hãy chọn server khác:</p>
                                {episodes && episodes.length > 1 ? (
                                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                                        {episodes.map((srv, idx) => (
                                            <button key={idx}
                                                onClick={() => {
                                                    setSelectedServer(idx);
                                                    const ep = srv.server_data?.[selectedEpisodeIdx] || srv.server_data?.[0];
                                                    if (ep) { setSelectedEpisode(ep); setSelectedEpisodeIdx(ep === srv.server_data?.[selectedEpisodeIdx] ? selectedEpisodeIdx : 0); }
                                                    setUseHdSource(false); setHdSource(null); startPlayerLoad();
                                                }}
                                                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${
                                                    idx === selectedServer
                                                        ? 'bg-[#FFD875] text-black'
                                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                                }`}
                                            >
                                                {srv.server_name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-5 py-2.5 rounded-full bg-[#FFD875] text-black text-[13px] font-semibold hover:bg-[#FFE49A] transition-colors"
                                    >
                                        🔄 Thử tải lại
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="tv-player-frame mx-auto flex items-center justify-center bg-[#1a1c2e]">
                        <div className="text-center">
                            <FontAwesomeIcon icon={faPlay} className="text-[60px] text-white/20 mb-[16px]" />
                            <p className="text-white/40">Chọn tập phim để xem</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="container max-w-[1400px] mx-auto px-[16px] py-[30px]">
                {/* Back button + Current playing + Actions */}
                <div className="tv-watch-actions flex items-center justify-between mb-[24px] flex-wrap gap-[12px]">
                    <div className="flex items-center gap-[16px]">
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

                    {/* Action Buttons: Share, Copy, Watchlist, Auto-play trigger */}
                    <div className="flex items-center gap-[8px]">
                        {/* Watchlist */}
                        <button
                            onClick={handleToggleWatchlist}
                            className={`px-[14px] py-[8px] rounded-full text-[12px] transition-all flex items-center gap-[6px] ${inWatchlist
                                ? 'bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/40'
                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                }`}
                            title={inWatchlist ? "Xóa khỏi danh sách" : "Thêm vào xem sau"}
                        >
                            <FontAwesomeIcon icon={inWatchlist ? faHeart : faBookmarkSolid} className="text-[11px]" />
                            {inWatchlist ? 'Đã lưu' : 'Xem sau'}
                        </button>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="px-[14px] py-[8px] rounded-full text-[12px] bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all flex items-center gap-[6px]"
                            title="Chia sẻ"
                        >
                            <FontAwesomeIcon icon={faShareNodes} className="text-[11px]" />
                            <span className="hidden sm:inline">Chia sẻ</span>
                        </button>

                        {/* Copy Link */}
                        <button
                            onClick={handleCopyLink}
                            className={`px-[14px] py-[8px] rounded-full text-[12px] transition-all flex items-center gap-[6px] ${copied
                                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                }`}
                            title="Sao chép link"
                        >
                            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[11px]" />
                            <span className="hidden sm:inline">{copied ? 'Đã copy!' : 'Copy link'}</span>
                        </button>

                        {/* Test Auto-play (only when has next ep) */}
                        {hasNextEpisode && autoPlayEnabled && !showAutoPlayOverlay && (
                            <button
                                onClick={triggerAutoPlay}
                                className="px-[14px] py-[8px] rounded-full text-[12px] bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition-all flex items-center gap-[6px]"
                                title="Phát tập tiếp theo"
                            >
                                <FontAwesomeIcon icon={faForwardStep} className="text-[11px]" />
                                <span className="hidden sm:inline">Tập tiếp</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Movie Info */}
                <div className="tv-movie-info flex flex-col lg:flex-row gap-[30px] mb-[40px]">
                    {/* Poster */}
                    <div className="tv-movie-poster w-[180px] flex-shrink-0 mx-auto lg:mx-0">
                        <Image
                            src={getProxiedImageUrl(getImageUrl(movieData.poster_url || movieData.thumb_url))}
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
                        <div className="text-white/70 text-[14px] mb-[12px]">
                            <span className="text-white">Nguồn phát: </span>
                            <span className="text-[#3B82F6] font-semibold">{episodes[selectedServer]?.server_name?.toLowerCase().includes("thuyết minh") ? "NguonC" : episodes[selectedServer]?.server_name?.includes("KK") ? "KKPhim" : "OPhim"}</span>
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
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(movieData.content || "")) }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Server & Episodes */}
                {episodes && episodes.length > 0 && (
                    <div className="tv-episode-panel bg-[#1a1c2e] rounded-[16px] p-[20px] lg:p-[24px]">
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
                                    <button
                                        onClick={async () => {
                                            if (movieData.slug) {
                                                const stableUrl = `https://vidsrc.me/embed/movie?tmdb=${movieData.tmdb?.id}`;
                                                const backupUrl = `https://www.2embed.cc/embed/${movieData.tmdb?.id}`;
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
                                            onClick={() => { setUseHdSource(false); setHdSource(null); }}
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
                                            const tmdbId = movieData.tmdb?.id || "";
                                            if (tmdbId && source.getMovieUrl) {
                                                const url = movieData.tmdb?.type === "tv" && source.getTvUrl
                                                    ? source.getTvUrl(tmdbId, 1, 1)
                                                    : source.getMovieUrl(tmdbId);
                                                setHdSource(url);
                                            } else if (source.getMovieUrl) {
                                                setHdSource(source.getMovieUrl(movieData.slug));
                                            }
                                            setUseHdSource(true);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        disabled={!movieData.tmdb?.id}
                                        className={`px-[14px] py-[8px] rounded-full text-[12px] transition-all flex items-center gap-[6px] disabled:opacity-40 disabled:cursor-not-allowed ${hdSource?.includes(source.id) || hdSource?.includes(source.id.replace("-", ""))
                                            ? "bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold"
                                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                            }`}
                                    >
                                        <span>{source.icon || "🎬"}</span>
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
                            {!movieData.tmdb?.id && (
                                <p className="text-orange-400 text-[11px] mt-[8px]">
                                    ⚠️ Phim này không có TMDB ID nên nguồn HD/4K có thể không hoạt động.
                                </p>
                            )}
                            <p className="text-[#888] text-[11px] mt-[10px]">
                                💡 Nguồn HD/4K quốc tế. {movieData.tmdb?.id ? `TMDB ID: ${movieData.tmdb.id}` : "Dùng nguồn Vietsub bên dưới để xem ổn định hơn."}
                            </p>
                        </div>

                        {/* Server Selection */}
                        <div className="mb-[20px]">
                            <p className="text-white/50 text-[12px] uppercase tracking-wider mb-[10px]">Chọn Server Vietsub <span className="normal-case text-orange-400/80">(Nếu video đứng → đổi server khác)</span></p>
                            <div className="flex flex-wrap gap-[8px]">
                                {episodes.map((server, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedServer(idx);
                                            if (server.server_data[0]) {
                                                setSelectedEpisode(server.server_data[0]);
                                                setSelectedEpisodeIdx(0);
                                                setUseHdSource(false);
                                                setHdSource(null);
                                                startPlayerLoad();
                                                window.scrollTo({ top: 0, behavior: "smooth" });
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
                            <div className="flex items-center justify-between mb-[10px]">
                                <p className="text-white/50 text-[12px] uppercase tracking-wider">Chọn Tập</p>
                                <button onClick={() => setEpisodeView(prev => prev === 'list' ? 'grid' : 'list')} className="text-[#FFD875] text-[12px] bg-[#FFD875]/10 px-2 py-1 rounded">
                                    {episodeView === 'list' ? 'Chế độ lưới' : 'Chế độ danh sách'}
                                </button>
                            </div>
                            <div className={`flex flex-wrap gap-[8px] max-h-[300px] overflow-y-auto ${episodeView === 'grid' ? 'grid grid-cols-6 gap-2' : ''}`}>
                                {episodes[selectedServer]?.server_data.map((ep, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedEpisode(ep);
                                            setSelectedEpisodeIdx(idx);
                                            setUseHdSource(false);
                                            setHdSource(null);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className={`${episodeView === 'grid' ? 'w-full text-center p-2' : 'min-w-[60px] px-[16px] py-[10px]'} rounded-[10px] text-[13px] transition-all ${selectedEpisode?.slug === ep.slug
                                            ? "bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold shadow-lg shadow-[#FFD875]/20"
                                            : "bg-white/5 text-white hover:bg-white/15 border border-white/10"
                                            }`}
                                    >
                                        {episodeView === 'grid' ? (ep.name.match(/\d+/) ? ep.name.match(/\d+/)?.[0] : ep.name) : ep.name}
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
