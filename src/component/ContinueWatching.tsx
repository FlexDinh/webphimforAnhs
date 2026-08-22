"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/ophimApi";
import { getProxiedImageUrl } from "@/lib/imageProxy";
import { getRecentlyWatched, clearWatchProgress } from "@/lib/movieUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faTimes, faHistory } from "@fortawesome/free-solid-svg-icons";

interface WatchProgressItem {
    movieSlug: string;
    movieName: string;
    posterUrl: string;
    currentTime: number;
    duration: number;
    episodeSlug?: string;
    episodeName?: string;
    lastWatched: number;
}

export default function ContinueWatching() {
    const [items, setItems] = useState<WatchProgressItem[]>([]);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        setItems(getRecentlyWatched());
    }, []);

    const handleClick = (item: WatchProgressItem) => {
        router.push(`/phim/${item.movieSlug}`);
    };

    const handleRemove = (e: React.MouseEvent, item: WatchProgressItem) => {
        e.stopPropagation();
        clearWatchProgress(item.movieSlug, item.episodeSlug);
        setItems(getRecentlyWatched());
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getProgressPercent = (current: number, total: number): number => {
        if (!total) return 0;
        return Math.min(100, (current / total) * 100);
    };

    if (!mounted || items.length === 0) return null;

    return (
        <div className="mb-[40px]">
            <div className="flex items-center gap-[10px] mb-[20px]">
                <FontAwesomeIcon icon={faHistory} className="text-[#FFD875] text-[18px]" />
                <h2 className="cinema-heading-lg text-[18px] text-white font-bold">Tiếp tục xem</h2>
                <span className="cinema-label text-white/40 text-[13px]">({items.length} phim)</span>
            </div>

            {/* Swipe hint on mobile */}
            <p className="text-white/30 text-[11px] mb-[12px] min-[1024px]:hidden">
                ← Vuốt ngang để xem thêm →
            </p>

            <div className="tv-movie-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[12px] sm:gap-[16px]">
                {items.slice(0, 6).map((item) => {
                    const percent = getProgressPercent(item.currentTime, item.duration);

                    return (
                        <div
                            key={`${item.movieSlug}-${item.episodeSlug || ""}`}
                            onClick={() => handleClick(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleClick(item);
                                }
                            }}
                            className="cursor-pointer group relative"
                        >
                            <div className="relative aspect-[2/3] cinema-poster shadow-lg overflow-hidden rounded-[12px]">
                                <Image
                                    src={getProxiedImageUrl(getImageUrl(item.posterUrl))}
                                    alt={item.movieName}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="(min-width: 2200px) 11vw, (min-width: 1600px) 13vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                                    unoptimized
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                {/* Play Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-[34px] h-[34px] rounded-full bg-[#FFD875] flex items-center justify-center shadow-md">
                                        <FontAwesomeIcon icon={faPlay} className="text-black text-[12px] ml-[2px]" />
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => handleRemove(e, item)}
                                    className="absolute top-[8px] right-[8px] w-[28px] h-[28px] rounded-full bg-black/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-[12px]" />
                                </button>

                                {/* Episode Badge */}
                                {item.episodeName && (
                                    <div className="absolute top-[8px] left-[8px]">
                                        <span className="cinema-badge cinema-badge-dark">
                                            {item.episodeName}
                                        </span>
                                    </div>
                                )}

                                {/* Progress info at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-[10px]">
                                    <div className="flex items-center justify-between mb-[6px]">
                                        <span className="text-[10px] text-[#6B7280]">
                                            {formatTime(item.currentTime)} / {formatTime(item.duration)}
                                        </span>
                                        <span className="text-[#FFD875] text-[10px] font-bold">
                                            {Math.round(percent)}%
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="cinema-progress">
                                        <div
                                            className="cinema-progress-fill"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="mt-[10px]">
                                <h3 className="text-white text-[12px] font-semibold truncate group-hover:text-[#FFD875] transition-colors">
                                    {item.movieName}
                                </h3>
                                <p className="text-white/40 text-[11px] mt-[2px]">
                                    {new Date(item.lastWatched).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
