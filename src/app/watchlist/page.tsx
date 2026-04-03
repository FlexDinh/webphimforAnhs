"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/ophimApi";
import { getWatchlist, removeFromWatchlist, clearWatchlist, WatchlistItem } from "@/lib/watchlistUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faTrash, faPlay, faFilm, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function WatchlistPage() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        setItems(getWatchlist());
    }, []);

    const handleRemove = (slug: string) => {
        removeFromWatchlist(slug);
        setItems(getWatchlist());
    };

    const handleClearAll = () => {
        if (window.confirm("Bạn có chắc muốn xóa toàn bộ danh sách xem sau?")) {
            clearWatchlist();
            setItems([]);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[100px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-[30px]">
                    <div className="flex items-center gap-[16px]">
                        <button
                            onClick={() => router.back()}
                            className="p-[10px] rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-[14px]" />
                        </button>
                        <div className="flex items-center gap-[10px]">
                            <div className="w-[40px] h-[40px] rounded-xl bg-gradient-to-br from-[#FFD875] to-[#f0a500] flex items-center justify-center">
                                <FontAwesomeIcon icon={faBookmark} className="text-black text-[16px]" />
                            </div>
                            <div>
                                <h1 className="text-white text-[24px] font-bold">Xem Sau</h1>
                                <p className="text-white/50 text-[13px]">{items.length} phim đã lưu</p>
                            </div>
                        </div>
                    </div>

                    {items.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="px-[16px] py-[8px] rounded-full text-[12px] bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-[6px]"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                            Xóa tất cả
                        </button>
                    )}
                </div>

                {/* Empty State */}
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-[80px]">
                        <div className="w-[80px] h-[80px] rounded-full bg-white/5 flex items-center justify-center mb-[20px]">
                            <FontAwesomeIcon icon={faFilm} className="text-[30px] text-white/20" />
                        </div>
                        <h2 className="text-white text-[18px] font-semibold mb-[8px]">Chưa có phim nào</h2>
                        <p className="text-white/50 text-[14px] mb-[24px] text-center max-w-[300px]">
                            Nhấn nút &quot;Xem sau&quot; trên trang phim để lưu phim vào đây
                        </p>
                        <button
                            onClick={() => router.push("/phimhay")}
                            className="px-[24px] py-[12px] bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold rounded-full hover:shadow-lg hover:shadow-[#FFD875]/30 transition-all text-[14px] flex items-center gap-[8px]"
                        >
                            <FontAwesomeIcon icon={faPlay} className="text-[12px]" />
                            Khám phá phim
                        </button>
                    </div>
                )}

                {/* Watchlist Grid */}
                {items.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[12px] sm:gap-[16px]">
                        {items.map((item) => (
                            <div
                                key={item.slug}
                                className="group relative cursor-pointer"
                            >
                                <div
                                    onClick={() => router.push(`/phim/${item.slug}`)}
                                    className="relative aspect-[2/3] rounded-[12px] overflow-hidden bg-[#2a2d3e] shadow-lg"
                                >
                                    <Image
                                        src={getImageUrl(item.poster_url)}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                                        unoptimized
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Play Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-[50px] h-[50px] rounded-full bg-[#FFD875] flex items-center justify-center shadow-lg">
                                            <FontAwesomeIcon icon={faPlay} className="text-black text-[18px] ml-[2px]" />
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(item.slug);
                                        }}
                                        className="absolute top-[8px] right-[8px] w-[30px] h-[30px] rounded-full bg-black/60 text-white/70 hover:text-red-400 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                                        title="Xóa khỏi danh sách"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
                                    </button>

                                    {/* Quality Badge */}
                                    {item.quality && (
                                        <div className="absolute top-[8px] left-[8px]">
                                            <span className="px-[8px] py-[4px] bg-[#FFD875] text-black text-[10px] font-bold rounded">
                                                {item.quality}
                                            </span>
                                        </div>
                                    )}

                                    {/* Added Date */}
                                    <div className="absolute bottom-0 left-0 right-0 p-[10px]">
                                        <p className="text-[10px] text-white/50">
                                            Đã lưu {formatDate(item.addedAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-[10px]" onClick={() => router.push(`/phim/${item.slug}`)}>
                                    <h3 className="text-white text-[14px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-white/40 text-[12px] truncate">
                                        {item.origin_name} {item.year ? `• ${item.year}` : ""}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
