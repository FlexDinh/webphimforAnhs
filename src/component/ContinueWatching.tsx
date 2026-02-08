"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/ophimApi";
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
                <h2 className="text-white text-[20px] font-bold">Tiếp tục xem</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[12px] sm:gap-[16px]">
                {items.slice(0, 6).map((item) => (
                    <div
                        key={`${item.movieSlug}-${item.episodeSlug || ""}`}
                        onClick={() => handleClick(item)}
                        className="cursor-pointer group relative"
                    >
                        <div className="relative aspect-[2/3] rounded-[12px] overflow-hidden bg-[#2a2d3e] shadow-lg">
                            <Image
                                src={getImageUrl(item.posterUrl)}
                                alt={item.movieName}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                                unoptimized
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                            {/* Play Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-[50px] h-[50px] rounded-full bg-[#FFD875] flex items-center justify-center shadow-lg">
                                    <FontAwesomeIcon icon={faPlay} className="text-black text-[18px] ml-[2px]" />
                                </div>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={(e) => handleRemove(e, item)}
                                className="absolute top-[8px] right-[8px] w-[28px] h-[28px] rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-[12px]" />
                            </button>

                            {/* Episode Badge */}
                            {item.episodeName && (
                                <div className="absolute top-[8px] left-[8px]">
                                    <span className="px-[8px] py-[4px] bg-[#FFD875] text-black text-[10px] font-bold rounded">
                                        {item.episodeName}
                                    </span>
                                </div>
                            )}

                            {/* Progress Bar */}
                            <div className="absolute bottom-0 left-0 right-0 p-[10px]">
                                <div className="flex justify-between text-[10px] text-white/70 mb-[4px]">
                                    <span>{formatTime(item.currentTime)}</span>
                                    <span>{formatTime(item.duration)}</span>
                                </div>
                                <div className="h-[4px] bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#FFD875] rounded-full transition-all"
                                        style={{ width: `${getProgressPercent(item.currentTime, item.duration)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-[10px]">
                            <h3 className="text-white text-[14px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
                                {item.movieName}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
