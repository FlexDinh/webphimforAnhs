"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { searchMovies, getImageUrl, OPhimMovie } from "@/lib/ophimApi";
import { normalizeGenres, extractAllGenres, filterMoviesByGenres, filterMoviesByYear, filterMoviesByRating, extractAllYears } from "@/lib/movieUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch, faPlay, faSpinner, faFilter, faTimes, faSortAmountDown,
    faSortAmountUp, faCalendarAlt, faStar, faGlobe, faChevronDown
} from "@fortawesome/free-solid-svg-icons";

// =============================================
// FUZZY SEARCH UTILITY
// =============================================
function fuzzyMatch(text: string, query: string): number {
    const t = text.toLowerCase();
    const q = query.toLowerCase();

    // Exact match → highest score
    if (t === q) return 100;
    if (t.includes(q)) return 80;
    if (t.startsWith(q)) return 90;

    // Word-level matching
    const words = q.split(/\s+/);
    const matchedWords = words.filter(w => t.includes(w));
    if (matchedWords.length === words.length) return 70;
    if (matchedWords.length > 0) return 40 + (matchedWords.length / words.length) * 30;

    // Character-level (Levenshtein-lite for Vietnamese)
    let score = 0;
    let lastIdx = -1;
    for (const char of q) {
        const idx = t.indexOf(char, lastIdx + 1);
        if (idx !== -1) {
            score++;
            lastIdx = idx;
        }
    }
    return (score / q.length) * 30;
}

function getSuggestions(query: string): string[] {
    // Common Vietnamese movie search corrections
    const corrections: Record<string, string> = {
        "nguoi nhen": "người nhện",
        "batman": "batman",
        "bien cuong": "biên cương",
        "hanh dong": "hành động",
        "tinh cam": "tình cảm",
        "kinh di": "kinh dị",
        "hoat hinh": "hoạt hình",
        "vien tuong": "viễn tưởng",
        "phieu luu": "phiêu lưu",
        "hai huoc": "hài hước",
        "chien tranh": "chiến tranh",
        "co trang": "cổ trang",
        "vo thuat": "võ thuật",
    };

    const suggestions: string[] = [];
    const q = query.toLowerCase().trim();

    for (const [key, value] of Object.entries(corrections)) {
        if (q.includes(key) || key.includes(q)) {
            suggestions.push(query.replace(new RegExp(key, 'gi'), value));
        }
    }

    return suggestions.slice(0, 3);
}

// Sort options
type SortOption = "relevance" | "rating-desc" | "rating-asc" | "year-desc" | "year-asc" | "name-asc";

const SORT_OPTIONS: { value: SortOption; label: string; icon: any }[] = [
    { value: "relevance", label: "Liên quan nhất", icon: faSearch },
    { value: "rating-desc", label: "Đánh giá cao nhất", icon: faStar },
    { value: "rating-asc", label: "Đánh giá thấp nhất", icon: faStar },
    { value: "year-desc", label: "Mới nhất", icon: faCalendarAlt },
    { value: "year-asc", label: "Cũ nhất", icon: faCalendarAlt },
    { value: "name-asc", label: "A → Z", icon: faSortAmountDown },
];

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get("query") || "";

    const [results, setResults] = useState<OPhimMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(query);

    // Advanced filters
    const [showFilters, setShowFilters] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [minRating, setMinRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<SortOption>("relevance");
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Fuzzy suggestions
    const [didYouMean, setDidYouMean] = useState<string[]>([]);

    useEffect(() => {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) return;
        setSearchInput(normalizedQuery);

        if (normalizedQuery.length < 2) {
            setResults([]);
            setDidYouMean([]);
            return;
        }

        const search = async () => {
            setLoading(true);
            try {
                const movies = await searchMovies(normalizedQuery, 48);
                setResults(movies);

                // Generate "did you mean" if few results
                if (movies.length < 3) {
                    setDidYouMean(getSuggestions(normalizedQuery));
                } else {
                    setDidYouMean([]);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [query]);

    // Extract available genres and years from results
    const availableGenres = useMemo(() => extractAllGenres(results), [results]);
    const availableYears = useMemo(() => extractAllYears(results), [results]);

    // Apply filters and sort
    const filteredResults = useMemo(() => {
        let filtered = [...results];

        // Genre filter
        if (selectedGenres.length > 0) {
            filtered = filterMoviesByGenres(filtered, selectedGenres);
        }

        // Year filter
        if (selectedYear) {
            filtered = filterMoviesByYear(filtered, selectedYear);
        }

        // Rating filter
        if (minRating > 0) {
            filtered = filterMoviesByRating(filtered, minRating);
        }

        // Sort
        switch (sortBy) {
            case "rating-desc":
                filtered.sort((a, b) => (b.tmdb?.vote_average || 0) - (a.tmdb?.vote_average || 0));
                break;
            case "rating-asc":
                filtered.sort((a, b) => (a.tmdb?.vote_average || 0) - (b.tmdb?.vote_average || 0));
                break;
            case "year-desc":
                filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
                break;
            case "year-asc":
                filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
                break;
            case "name-asc":
                filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case "relevance":
            default:
                // Fuzzy relevance sort
                if (query) {
                    filtered.sort((a, b) => {
                        const scoreA = Math.max(
                            fuzzyMatch(a.name || "", query),
                            fuzzyMatch(a.origin_name || "", query)
                        );
                        const scoreB = Math.max(
                            fuzzyMatch(b.name || "", query),
                            fuzzyMatch(b.origin_name || "", query)
                        );
                        return scoreB - scoreA;
                    });
                }
                break;
        }

        return filtered;
    }, [results, selectedGenres, selectedYear, minRating, sortBy, query]);

    const activeFilterCount = (selectedGenres.length > 0 ? 1 : 0) + (selectedYear ? 1 : 0) + (minRating > 0 ? 1 : 0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    const clearAllFilters = () => {
        setSelectedGenres([]);
        setSelectedYear(null);
        setMinRating(0);
        setSortBy("relevance");
    };

    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[100px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-[30px]">
                    <div className="relative max-w-[600px] mx-auto">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#666] text-[18px]"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm phim, diễn viên, đạo diễn..."
                            className="w-full pl-[56px] pr-[20px] py-[16px] text-[16px] placeholder-[#666] text-white rounded-full bg-white/10 border border-white/10 focus:bg-white/15 focus:border-[#FFD875]/50 focus:outline-none transition-all"
                            autoFocus
                        />
                    </div>
                </form>

                {/* "Did you mean?" suggestions */}
                {didYouMean.length > 0 && (
                    <div className="mb-[20px] text-center">
                        <span className="text-white/50 text-[14px]">Bạn có ý tìm: </span>
                        {didYouMean.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => router.push(`/search?query=${encodeURIComponent(suggestion)}`)}
                                className="text-[#FFD875] text-[14px] font-medium hover:underline mx-[4px]"
                            >
                                &quot;{suggestion}&quot;
                            </button>
                        ))}
                    </div>
                )}

                {query && (
                    <div className="flex items-center justify-between mb-[20px] flex-wrap gap-[12px]">
                        <div>
                            <h1 className="text-[22px] font-bold text-white">
                                Kết quả: <span className="text-[#FFD875]">&quot;{query}&quot;</span>
                            </h1>
                            <p className="text-[#888] text-[13px] mt-[2px]">
                                {filteredResults.length} / {results.length} phim
                                {activeFilterCount > 0 && ` (${activeFilterCount} bộ lọc đang áp dụng)`}
                            </p>
                        </div>

                        <div className="flex items-center gap-[8px]">
                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="px-[14px] py-[8px] rounded-full text-[12px] bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all flex items-center gap-[6px]"
                                >
                                    <FontAwesomeIcon icon={faSortAmountDown} className="text-[10px]" />
                                    {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                                    <FontAwesomeIcon icon={faChevronDown} className="text-[8px]" />
                                </button>
                                {showSortDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                                        <div className="absolute top-full right-0 mt-[4px] w-[200px] bg-[#1E2545] rounded-[12px] border border-white/10 shadow-xl z-50 overflow-hidden animate-fade-in">
                                            {SORT_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                                                    className={`w-full text-left px-[14px] py-[10px] text-[13px] transition-colors flex items-center gap-[8px] ${sortBy === option.value
                                                        ? 'bg-[#FFD875]/10 text-[#FFD875]'
                                                        : 'text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    <FontAwesomeIcon icon={option.icon} className="text-[10px] w-[14px]" />
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-[14px] py-[8px] rounded-full text-[12px] transition-all flex items-center gap-[6px] ${showFilters || activeFilterCount > 0
                                    ? 'bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/40'
                                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                                Bộ lọc
                                {activeFilterCount > 0 && (
                                    <span className="w-[18px] h-[18px] rounded-full bg-[#FFD875] text-black text-[10px] flex items-center justify-center font-bold">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Advanced Filters Panel */}
                {showFilters && results.length > 0 && (
                    <div className="mb-[24px] p-[20px] bg-[#1a1c2e] rounded-[16px] border border-white/5 animate-fade-in">
                        <div className="flex items-center justify-between mb-[16px]">
                            <h3 className="text-white text-[15px] font-semibold flex items-center gap-[8px]">
                                <FontAwesomeIcon icon={faFilter} className="text-[#FFD875] text-[13px]" />
                                Bộ lọc nâng cao
                            </h3>
                            {activeFilterCount > 0 && (
                                <button onClick={clearAllFilters} className="text-[12px] text-red-400 hover:text-red-300 flex items-center gap-[4px]">
                                    <FontAwesomeIcon icon={faTimes} className="text-[9px]" />
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        {/* Genre Filters */}
                        {availableGenres.length > 0 && (
                            <div className="mb-[16px]">
                                <p className="text-white/50 text-[11px] uppercase tracking-wider mb-[8px]">Thể loại</p>
                                <div className="flex flex-wrap gap-[6px]">
                                    {availableGenres.map(genre => (
                                        <button
                                            key={genre}
                                            onClick={() => {
                                                setSelectedGenres(prev =>
                                                    prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
                                                );
                                            }}
                                            className={`px-[12px] py-[6px] rounded-full text-[11px] transition-all ${selectedGenres.includes(genre)
                                                ? 'bg-[#FFD875] text-black font-semibold'
                                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                }`}
                                        >
                                            {genre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                            {/* Year Filter */}
                            {availableYears.length > 0 && (
                                <div>
                                    <p className="text-white/50 text-[11px] uppercase tracking-wider mb-[8px]">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-[4px]" />
                                        Năm sản xuất
                                    </p>
                                    <div className="flex flex-wrap gap-[6px]">
                                        <button
                                            onClick={() => setSelectedYear(null)}
                                            className={`px-[12px] py-[6px] rounded-full text-[11px] transition-all ${!selectedYear ? 'bg-[#FFD875] text-black font-semibold' : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                }`}
                                        >
                                            Tất cả
                                        </button>
                                        {availableYears.slice(0, 10).map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                                                className={`px-[12px] py-[6px] rounded-full text-[11px] transition-all ${selectedYear === year
                                                    ? 'bg-[#FFD875] text-black font-semibold'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rating Filter */}
                            <div>
                                <p className="text-white/50 text-[11px] uppercase tracking-wider mb-[8px]">
                                    <FontAwesomeIcon icon={faStar} className="mr-[4px]" />
                                    Đánh giá tối thiểu
                                </p>
                                <div className="flex items-center gap-[8px]">
                                    {[0, 5, 6, 7, 8, 9].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                                            className={`px-[12px] py-[6px] rounded-full text-[11px] transition-all flex items-center gap-[4px] ${minRating === rating
                                                ? 'bg-[#FFD875] text-black font-semibold'
                                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                }`}
                                        >
                                            {rating === 0 ? 'Tất cả' : `⭐ ${rating}+`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center py-[60px]">
                        <FontAwesomeIcon icon={faSpinner} className="text-[40px] text-[#FFD875] animate-spin" />
                    </div>
                ) : filteredResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[12px] sm:gap-[16px]">
                        {filteredResults.map((movie) => (
                            <div
                                key={movie._id}
                                onClick={() => router.push(`/phim/${movie.slug}`)}
                                className="cursor-pointer group movie-card-premium"
                            >
                                <div className="relative aspect-[2/3] rounded-[12px] overflow-hidden bg-[#2a2d3e]">
                                    <Image
                                        src={getImageUrl(movie.poster_url || movie.thumb_url)}
                                        alt={movie.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-[16px]">
                                        <div className="w-[40px] h-[40px] rounded-full bg-[#FFD875] flex items-center justify-center">
                                            <FontAwesomeIcon icon={faPlay} className="text-black text-[14px] ml-[2px]" />
                                        </div>
                                    </div>
                                    <div className="absolute top-[8px] left-[8px] flex flex-col gap-[4px]">
                                        {typeof movie.quality === 'string' && movie.quality && (
                                            <span className="px-[6px] py-[2px] bg-[#FFD875] text-black text-[10px] font-semibold rounded">
                                                {movie.quality}
                                            </span>
                                        )}
                                    </div>
                                    {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                                        <span className="absolute top-[8px] right-[8px] px-[5px] py-[2px] bg-black/70 text-[#FFD875] text-[9px] font-bold rounded flex items-center gap-[2px]">
                                            ⭐ {movie.tmdb.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-[10px]">
                                    <h3 className="text-white text-[13px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
                                        {String(movie.name || "")}
                                    </h3>
                                    <p className="text-white/40 text-[11px] truncate">{String(movie.origin_name || "")}</p>
                                    <div className="flex items-center gap-[6px] mt-[4px]">
                                        <span className="text-[#888] text-[11px]">{String(movie.year || "")}</span>
                                        {movie.category && movie.category.length > 0 && (
                                            <span className="text-white/30 text-[10px] truncate">
                                                • {movie.category.slice(0, 2).map(c => c.name).join(", ")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-[60px]">
                        <p className="text-white/60 text-[18px]">Không tìm thấy kết quả nào</p>
                        <p className="text-[#888] text-[14px] mt-[8px]">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="mt-[16px] px-[20px] py-[10px] bg-[#FFD875]/20 text-[#FFD875] rounded-full text-[13px] hover:bg-[#FFD875]/30 transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-[60px]">
                        <FontAwesomeIcon icon={faSearch} className="text-[60px] text-white/20 mb-[16px]" />
                        <p className="text-white/40">Nhập từ khóa để tìm phim</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0F111A] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-[40px] text-[#FFD875] animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
