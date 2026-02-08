"use client";
import { useEffect, useState, memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getMoviesByCategory, getImageUrl, OPhimMovie } from "@/lib/ophimApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faFilter, faSort, faCalendar, faStar, faTimes, faChevronDown } from "@fortawesome/free-solid-svg-icons";

// Predefined categories
const CATEGORIES = [
    { slug: "hanh-dong", name: "Hành Động", icon: "🔥" },
    { slug: "tinh-cam", name: "Tình Cảm", icon: "💕" },
    { slug: "hai-huoc", name: "Hài Hước", icon: "😂" },
    { slug: "co-trang", name: "Cổ Trang", icon: "🏯" },
    { slug: "tam-ly", name: "Tâm Lý", icon: "🧠" },
    { slug: "hinh-su", name: "Hình Sự", icon: "🔍" },
    { slug: "chien-tranh", name: "Chiến Tranh", icon: "⚔️" },
    { slug: "vo-thuat", name: "Võ Thuật", icon: "🥋" },
    { slug: "vien-tuong", name: "Viễn Tưởng", icon: "🚀" },
    { slug: "phieu-luu", name: "Phiêu Lưu", icon: "🗺️" },
    { slug: "kinh-di", name: "Kinh Dị", icon: "👻" },
    { slug: "than-thoai", name: "Thần Thoại", icon: "⚡" },
    { slug: "gia-dinh", name: "Gia Đình", icon: "👨‍👩‍👧" },
    { slug: "bi-an", name: "Bí Ẩn", icon: "🔮" },
    { slug: "hoc-duong", name: "Học Đường", icon: "📚" },
    { slug: "the-thao", name: "Thể Thao", icon: "⚽" },
    { slug: "am-nhac", name: "Âm Nhạc", icon: "🎵" },
    { slug: "tai-lieu", name: "Tài Liệu", icon: "📹" },
    { slug: "chinh-kich", name: "Chính Kịch", icon: "🎭" },
    { slug: "khoa-hoc", name: "Khoa Học", icon: "🔬" },
    { slug: "kinh-dien", name: "Kinh Điển", icon: "🏆" },
];

// Sort options
const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "rating", label: "Đánh giá cao" },
    { value: "year-desc", label: "Năm mới → cũ" },
    { value: "year-asc", label: "Năm cũ → mới" },
    { value: "name-asc", label: "A → Z" },
];

// Year options
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - i);

// Memoized MovieCard
const MovieCard = memo(({ movie, onClick }: { movie: OPhimMovie; onClick: () => void }) => (
    <div onClick={onClick} className="cursor-pointer group active:scale-[0.98] transition-transform">
        <div className="relative aspect-[2/3] rounded-[12px] overflow-hidden bg-[#2a2d3e]">
            <Image
                src={getImageUrl(movie.poster_url || movie.thumb_url)}
                alt={typeof movie.name === 'string' ? movie.name : "Movie"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                loading="lazy"
                unoptimized
            />
            {/* Hover overlay */}
            <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity items-end justify-center pb-[16px]">
                <div className="w-[36px] h-[36px] rounded-full bg-[#FFD875] flex items-center justify-center">
                    <FontAwesomeIcon icon={faPlay} className="text-black text-[12px] ml-[2px]" />
                </div>
            </div>
            {/* Quality badge */}
            {movie.quality && (
                <span className="absolute top-[6px] left-[6px] px-[5px] py-[2px] bg-[#FFD875] text-black text-[9px] font-bold rounded">
                    {movie.quality}
                </span>
            )}
            {/* Rating badge */}
            {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                <span className="absolute top-[6px] right-[6px] px-[5px] py-[2px] bg-black/70 text-[#FFD875] text-[9px] font-bold rounded flex items-center gap-[2px]">
                    ⭐ {movie.tmdb.vote_average.toFixed(1)}
                </span>
            )}
        </div>
        <h3 className="mt-[8px] text-white text-[13px] font-medium truncate">{typeof movie.name === 'string' ? movie.name : ""}</h3>
        <div className="flex items-center gap-[6px] mt-[2px]">
            <span className="text-[#888] text-[11px]">{movie.year}</span>
            {movie.episode_current && (
                <span className="text-[#FFD875] text-[10px]">{movie.episode_current}</span>
            )}
        </div>
    </div>
));
MovieCard.displayName = 'MovieCard';

// Skeleton
const SkeletonCard = () => (
    <div>
        <div className="aspect-[2/3] rounded-[12px] bg-[#2a2d3e] animate-pulse" />
        <div className="mt-[8px] h-[14px] bg-[#2a2d3e] rounded animate-pulse w-3/4" />
    </div>
);

export default function TheLoaiPage() {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [movies, setMovies] = useState<OPhimMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [yearFilter, setYearFilter] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const router = useRouter();

    const fetchMovies = useCallback(async (category: string, pageNum: number) => {
        setLoading(true);
        try {
            const data = await getMoviesByCategory(category, pageNum);
            setMovies(data.items);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching movies:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies(selectedCategory.slug, page);
    }, [selectedCategory, page, fetchMovies]);

    // Client-side filtering and sorting
    const filteredAndSortedMovies = useMemo(() => {
        let result = [...movies];

        // Filter by year
        if (yearFilter) {
            result = result.filter(m => m.year === yearFilter);
        }

        // Sort
        switch (sortBy) {
            case "rating":
                result.sort((a, b) => (b.tmdb?.vote_average || 0) - (a.tmdb?.vote_average || 0));
                break;
            case "year-desc":
                result.sort((a, b) => (b.year || 0) - (a.year || 0));
                break;
            case "year-asc":
                result.sort((a, b) => (a.year || 0) - (b.year || 0));
                break;
            case "name-asc":
                result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            default: // newest - keep original order
                break;
        }

        return result;
    }, [movies, sortBy, yearFilter]);

    const handleCategoryChange = (category: typeof CATEGORIES[0]) => {
        setSelectedCategory(category);
        setPage(1);
        setSortBy("newest");
        setYearFilter(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSortBy("newest");
        setYearFilter(null);
    };

    const hasActiveFilters = sortBy !== "newest" || yearFilter !== null;

    return (
        <div className="min-h-screen bg-[#0F111A] pt-[70px]">
            <div className="container max-w-[1400px] mx-auto px-[12px] sm:px-[16px] py-[20px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-[20px]">
                    <div className="flex items-center gap-[10px]">
                        <FontAwesomeIcon icon={faFilter} className="text-[#FFD875] text-[18px]" />
                        <h1 className="text-white text-[20px] sm:text-[24px] font-bold">Phim theo thể loại</h1>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-[6px] px-[14px] py-[10px] rounded-full text-[13px] min-h-[44px] transition-all ${showFilters || hasActiveFilters
                            ? "bg-[#FFD875] text-black font-semibold"
                            : "bg-white/10 text-white"
                            }`}
                    >
                        <FontAwesomeIcon icon={faSort} />
                        Bộ lọc
                        {hasActiveFilters && <span className="w-[6px] h-[6px] bg-red-500 rounded-full" />}
                    </button>
                </div>

                {/* Category Pills */}
                <div className="mb-[16px] -mx-[12px] sm:mx-0 px-[12px] sm:px-0 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-[8px] pb-[8px] sm:flex-wrap">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-[14px] py-[10px] rounded-full text-[13px] whitespace-nowrap transition-all duration-200 active:scale-95 min-h-[44px] flex items-center gap-[6px] ${selectedCategory.slug === cat.slug
                                    ? "bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold shadow-lg shadow-[#FFD875]/20"
                                    : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mb-[20px] p-[16px] bg-[#1a1c2e] rounded-[16px] border border-white/10">
                        <div className="flex flex-wrap gap-[16px]">
                            {/* Sort */}
                            <div className="flex-1 min-w-[150px]">
                                <label className="text-[12px] text-[#888] uppercase tracking-wider mb-[8px] flex items-center gap-[6px]">
                                    <FontAwesomeIcon icon={faSort} className="text-[10px]" />
                                    Sắp xếp
                                </label>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-[14px] py-[10px] bg-white/10 text-white text-[14px] rounded-[10px] border border-white/10 appearance-none cursor-pointer min-h-[44px]"
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value} className="bg-[#1a1c2e]">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <FontAwesomeIcon icon={faChevronDown} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#888] text-[12px] pointer-events-none" />
                                </div>
                            </div>

                            {/* Year */}
                            <div className="flex-1 min-w-[150px]">
                                <label className="text-[12px] text-[#888] uppercase tracking-wider mb-[8px] flex items-center gap-[6px]">
                                    <FontAwesomeIcon icon={faCalendar} className="text-[10px]" />
                                    Năm phát hành
                                </label>
                                <div className="relative">
                                    <select
                                        value={yearFilter || ""}
                                        onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full px-[14px] py-[10px] bg-white/10 text-white text-[14px] rounded-[10px] border border-white/10 appearance-none cursor-pointer min-h-[44px]"
                                    >
                                        <option value="" className="bg-[#1a1c2e]">Tất cả năm</option>
                                        {YEARS.map(year => (
                                            <option key={year} value={year} className="bg-[#1a1c2e]">{year}</option>
                                        ))}
                                    </select>
                                    <FontAwesomeIcon icon={faChevronDown} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#888] text-[12px] pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Clear filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-[12px] text-[12px] text-red-400 hover:text-red-300 flex items-center gap-[4px]"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="mb-[16px] flex flex-wrap items-center gap-[8px] text-[14px] text-[#888]">
                    <span>Đang xem:</span>
                    <span className="text-[#FFD875] font-medium flex items-center gap-[4px]">
                        {selectedCategory.icon} {selectedCategory.name}
                    </span>
                    {!loading && (
                        <>
                            <span>•</span>
                            <span>{filteredAndSortedMovies.length} phim</span>
                            <span>•</span>
                            <span>Trang {page}/{totalPages}</span>
                        </>
                    )}
                </div>

                {/* Movie Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-[10px] sm:gap-[16px]">
                    {loading ? (
                        Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : filteredAndSortedMovies.length > 0 ? (
                        filteredAndSortedMovies.map((movie) => (
                            <MovieCard
                                key={movie._id}
                                movie={movie}
                                onClick={() => router.push(`/phim/${movie.slug}`)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-[60px] text-[#888]">
                            <p className="text-[16px] mb-[8px]">Không tìm thấy phim</p>
                            <p className="text-[13px]">Thử thay đổi bộ lọc hoặc chọn thể loại khác</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-[8px] mt-[30px] flex-wrap">
                        <button
                            onClick={() => {
                                setPage(p => Math.max(1, p - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={page === 1}
                            className="px-[16px] py-[10px] rounded-full bg-white/10 text-white text-[13px] disabled:opacity-40 min-h-[44px] active:scale-95"
                        >
                            ← Trước
                        </button>

                        {/* Page 1 */}
                        {page > 3 && (
                            <>
                                <button
                                    onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="w-[40px] h-[40px] rounded-full text-[13px] bg-white/10 text-white hover:bg-white/20 min-h-[44px]"
                                >
                                    1
                                </button>
                                {page > 4 && <span className="text-[#888]">...</span>}
                            </>
                        )}

                        {/* Nearby pages */}
                        {Array.from({ length: 5 }, (_, i) => page - 2 + i)
                            .filter(p => p >= 1 && p <= totalPages)
                            .map(p => (
                                <button
                                    key={p}
                                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className={`w-[40px] h-[40px] rounded-full text-[13px] min-h-[44px] ${page === p
                                            ? "bg-[#FFD875] text-black font-bold"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))
                        }

                        {/* Last page */}
                        {page < totalPages - 2 && (
                            <>
                                {page < totalPages - 3 && <span className="text-[#888]">...</span>}
                                <button
                                    onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="w-[40px] h-[40px] rounded-full text-[13px] bg-white/10 text-white hover:bg-white/20 min-h-[44px]"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => {
                                setPage(p => Math.min(totalPages, p + 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={page === totalPages}
                            className="px-[16px] py-[10px] rounded-full bg-[#FFD875] text-black text-[13px] font-semibold disabled:opacity-40 min-h-[44px] active:scale-95"
                        >
                            Tiếp →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
