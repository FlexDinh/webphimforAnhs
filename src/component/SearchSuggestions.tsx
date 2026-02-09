"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { searchMovies, getImageUrl, OPhimMovie } from "@/lib/ophimApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";

interface SearchSuggestionsProps {
    searchValue: string;
    isOpen: boolean;
    onClose: () => void;
}

// Search history helpers
const HISTORY_KEY = "webforanhs_search_history";
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveToHistory(query: string): void {
    if (typeof window === "undefined" || !query.trim()) return;
    try {
        const history = getSearchHistory().filter(h => h !== query);
        history.unshift(query);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch {
        // Ignore localStorage errors
    }
}

function clearSearchHistory(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(HISTORY_KEY);
}

export default function SearchSuggestions({ searchValue, isOpen, onClose }: SearchSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<OPhimMovie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Load history on mount
    useEffect(() => {
        setHistory(getSearchHistory());
    }, [isOpen]);

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
        }, 300); // Reduced debounce for faster response

        return () => clearTimeout(timer);
    }, [searchValue]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            setTimeout(() => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    onClose();
                }
            }, 10);
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleMovieClick = useCallback((movie: OPhimMovie, e?: React.MouseEvent | React.TouchEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        saveToHistory(searchValue);
        router.push(`/phim/${movie.slug}`);
        onClose();
    }, [router, onClose, searchValue]);

    const handleHistoryClick = useCallback((query: string) => {
        router.push(`/search?query=${encodeURIComponent(query)}`);
        onClose();
    }, [router, onClose]);

    const handleClearHistory = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        clearSearchHistory();
        setHistory([]);
    }, []);

    const handleViewAll = useCallback(() => {
        saveToHistory(searchValue);
        router.push(`/search?query=${encodeURIComponent(searchValue)}`);
        onClose();
    }, [router, searchValue, onClose]);

    if (!isOpen) return null;

    const showHistory = !searchValue.trim() && history.length > 0;

    return (
        <div
            ref={containerRef}
            className="search-suggestions absolute top-full left-0 right-0 mt-[8px] bg-[#1E2030] rounded-[16px] border border-[#ffffff15] shadow-2xl overflow-hidden z-[9999] animate__animated animate__fadeIn animate__faster"
            style={{ touchAction: 'manipulation' }}
        >
            <div className="p-[8px] max-h-[70vh] overflow-y-auto">
                {/* Search History */}
                {showHistory && (
                    <>
                        <div className="flex items-center justify-between px-[12px] py-[8px]">
                            <p className="text-[12px] text-[#888] uppercase tracking-wider flex items-center gap-[6px]">
                                <FontAwesomeIcon icon={faHistory} className="text-[10px]" />
                                Tìm kiếm gần đây
                            </p>
                            <button
                                onClick={handleClearHistory}
                                className="text-[11px] text-red-400 hover:text-red-300 px-[8px] py-[4px] rounded"
                            >
                                Xóa tất cả
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-[8px] px-[12px] pb-[12px]">
                            {history.map((query, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleHistoryClick(query)}
                                    className="px-[12px] py-[8px] bg-white/10 hover:bg-white/20 text-white text-[13px] rounded-full flex items-center gap-[6px] transition-colors"
                                >
                                    <FontAwesomeIcon icon={faSearch} className="text-[10px] text-[#888]" />
                                    {query}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Title */}
                {searchValue.trim() && (
                    <p className="text-[12px] text-[#888] uppercase tracking-wider px-[12px] py-[8px]">
                        {isLoading ? "Đang tìm kiếm..." : `Kết quả cho "${searchValue}"`}
                    </p>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center py-[24px]">
                        <div className="w-[28px] h-[28px] border-2 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* No results */}
                {!isLoading && suggestions.length === 0 && searchValue.trim() && (
                    <div className="text-center py-[24px] text-[#888] text-[14px]">
                        Không tìm thấy phim nào
                    </div>
                )}

                {/* Results */}
                {!isLoading && suggestions.map((movie, index) => (
                    <div
                        key={`${movie._id}-${index}`}
                        onClick={(e) => handleMovieClick(movie, e)}
                        onTouchEnd={(e) => handleMovieClick(movie, e)}
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
                                {movie.quality && (
                                    <span className="text-[10px] text-black bg-[#FFD875] px-[6px] py-[2px] rounded font-bold">
                                        {movie.quality}
                                    </span>
                                )}
                                {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                                    <span className="text-[11px] text-[#FFD875]">
                                        ⭐ {movie.tmdb.vote_average.toFixed(1)}
                                    </span>
                                )}
                                <span className="text-[11px] text-[#888]">
                                    {String(movie.year || "")}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View all button */}
            {suggestions.length > 0 && (
                <div className="border-t border-[#ffffff10] px-[16px] py-[14px]">
                    <button
                        onClick={handleViewAll}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            handleViewAll();
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
