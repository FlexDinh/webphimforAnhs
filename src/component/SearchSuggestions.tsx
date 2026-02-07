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

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
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
            className="search-suggestions absolute top-full left-0 right-0 mt-[8px] bg-[#1E2030] rounded-[12px] border border-[#ffffff15] shadow-2xl overflow-hidden z-50 animate__animated animate__fadeIn animate__faster"
        >
            <div className="p-[8px]">
                <p className="text-[11px] text-[#888] uppercase tracking-wider px-[12px] py-[8px]">
                    {isLoading ? "Đang tìm kiếm..." : "Gợi ý tìm kiếm"}
                </p>

                {isLoading && (
                    <div className="flex justify-center py-[20px]">
                        <div className="w-[24px] h-[24px] border-2 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!isLoading && suggestions.length === 0 && searchValue.trim() && (
                    <div className="text-center py-[20px] text-[#888] text-[13px]">
                        Không tìm thấy phim nào
                    </div>
                )}

                {!isLoading && suggestions.map((movie, index) => (
                    <div
                        key={`${movie._id}-${index}`}
                        onClick={() => handleMovieClick(movie)}
                        className="flex items-center gap-[12px] p-[12px] rounded-[8px] cursor-pointer transition-all duration-200 hover:bg-[#ffffff10] group"
                    >
                        <div className="w-[50px] h-[70px] rounded-[6px] overflow-hidden flex-shrink-0 relative bg-[#2a2d3e]">
                            <Image
                                src={getImageUrl(movie.thumb_url)}
                                alt={movie.name}
                                fill
                                className="object-cover"
                                sizes="50px"
                                unoptimized
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white text-[14px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
                                {String(movie.name || "")}
                            </h4>
                            <p className="text-[#888] text-[12px] truncate">
                                {String(movie.origin_name || "")}
                            </p>
                            <div className="flex items-center gap-[8px] mt-[4px]">
                                {movie.tmdb?.vote_average && typeof movie.tmdb.vote_average === 'number' && movie.tmdb.vote_average > 0 ? (
                                    <span className="text-[10px] text-[#FFD875] bg-[#FFD87520] px-[6px] py-[2px] rounded">
                                        ⭐ {movie.tmdb.vote_average.toFixed(1)}
                                    </span>
                                ) : null}
                                <span className="text-[10px] text-[#888]">
                                    {String(movie.year || "")}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {suggestions.length > 0 && (
                <div className="border-t border-[#ffffff10] px-[16px] py-[12px]">
                    <button
                        onClick={() => {
                            router.push(`/search?query=${encodeURIComponent(searchValue)}`);
                            onClose();
                        }}
                        className="w-full text-center text-[13px] text-[#FFD875] hover:underline"
                    >
                        Xem tất cả kết quả cho &quot;{searchValue}&quot;
                    </button>
                </div>
            )}
        </div>
    );
}
