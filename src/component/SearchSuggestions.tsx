"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { searchMovies, getImageUrl, OPhimMovie } from "@/lib/ophimApi";

interface SearchSuggestionsProps {
    searchValue: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchSuggestions({ searchValue, isOpen, onClose }: SearchSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<OPhimMovie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce search with real API
    useEffect(() => {
        if (!searchValue.trim()) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await searchMovies(searchValue, 6);
                setSuggestions(results);
            } catch (error) {
                console.error("Search error:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchValue]);

    // Close on click/touch outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleMovieClick = (movie: OPhimMovie) => {
        router.push(`/phim/${movie.slug}`);
        onClose();
    };

    return (
        <div
            ref={containerRef}
            className="search-suggestions absolute top-full left-0 right-0 mt-[8px] bg-[#1E2030] rounded-[16px] border border-[#ffffff15] shadow-2xl overflow-hidden z-[9999] animate__animated animate__fadeIn animate__faster"
            style={{ touchAction: 'manipulation' }}
        >
            <div className="p-[8px] max-h-[70vh] overflow-y-auto">
                <p className="text-[12px] text-[#888] uppercase tracking-wider px-[12px] py-[8px]">
                    {isLoading ? "Đang tìm kiếm..." : "Gợi ý tìm kiếm"}
                </p>

                {isLoading && (
                    <div className="flex justify-center py-[24px]">
                        <div className="w-[28px] h-[28px] border-2 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!isLoading && suggestions.length === 0 && searchValue.trim() && (
                    <div className="text-center py-[24px] text-[#888] text-[14px]">
                        Không tìm thấy phim nào
                    </div>
                )}

                {!isLoading && suggestions.map((movie, index) => (
                    <div
                        key={`${movie._id}-${index}`}
                        onClick={() => handleMovieClick(movie)}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            handleMovieClick(movie);
                        }}
                        className="flex items-center gap-[12px] p-[14px] rounded-[12px] cursor-pointer transition-all duration-200 hover:bg-[#ffffff10] active:bg-[#ffffff20] active:scale-[0.98] min-h-[80px]"
                        role="button"
                        tabIndex={0}
                    >
                        <div className="w-[55px] h-[75px] rounded-[8px] overflow-hidden flex-shrink-0 relative bg-[#2a2d3e]">
                            <Image
                                src={getImageUrl(movie.thumb_url)}
                                alt={movie.name}
                                fill
                                className="object-cover"
                                sizes="55px"
                                unoptimized
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white text-[15px] font-medium truncate">
                                {String(movie.name || "")}
                            </h4>
                            <p className="text-[#888] text-[13px] truncate">
                                {String(movie.origin_name || "")}
                            </p>
                            <div className="flex items-center gap-[8px] mt-[6px]">
                                {movie.tmdb?.vote_average && typeof movie.tmdb.vote_average === 'number' && movie.tmdb.vote_average > 0 ? (
                                    <span className="text-[11px] text-[#FFD875] bg-[#FFD87520] px-[8px] py-[3px] rounded-full">
                                        ⭐ {movie.tmdb.vote_average.toFixed(1)}
                                    </span>
                                ) : null}
                                <span className="text-[11px] text-[#888]">
                                    {String(movie.year || "")}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {suggestions.length > 0 && (
                <div className="border-t border-[#ffffff10] px-[16px] py-[14px]">
                    <button
                        onClick={() => {
                            router.push(`/search?query=${encodeURIComponent(searchValue)}`);
                            onClose();
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            router.push(`/search?query=${encodeURIComponent(searchValue)}`);
                            onClose();
                        }}
                        className="w-full text-center text-[14px] text-[#FFD875] font-medium py-[10px] rounded-xl hover:bg-[#FFD87510] active:bg-[#FFD87520] transition-colors min-h-[48px]"
                    >
                        Xem tất cả kết quả cho &quot;{searchValue}&quot;
                    </button>
                </div>
            )}
        </div>
    );
}
