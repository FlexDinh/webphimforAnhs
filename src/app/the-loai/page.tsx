"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronDown, faFilter, faPlay, faSort, faTimes } from "@fortawesome/free-solid-svg-icons";
import { getImageUrl, getMoviesByCategory, OPhimMovie } from "@/lib/ophimApi";
import { getProxiedImageUrl } from "@/lib/imageProxy";

const CATEGORIES = [
  { slug: "hanh-dong", name: "Hành động", icon: "🔥" },
  { slug: "tinh-cam", name: "Tình cảm", icon: "💛" },
  { slug: "hai-huoc", name: "Hài hước", icon: "😂" },
  { slug: "co-trang", name: "Cổ trang", icon: "🏯" },
  { slug: "tam-ly", name: "Tâm lý", icon: "🧠" },
  { slug: "hinh-su", name: "Hình sự", icon: "🔎" },
  { slug: "chien-tranh", name: "Chiến tranh", icon: "⚔️" },
  { slug: "vo-thuat", name: "Võ thuật", icon: "🥋" },
  { slug: "vien-tuong", name: "Viễn tưởng", icon: "🚀" },
  { slug: "phieu-luu", name: "Phiêu lưu", icon: "🗺️" },
  { slug: "kinh-di", name: "Kinh dị", icon: "👻" },
  { slug: "than-thoai", name: "Thần thoại", icon: "⚡" },
  { slug: "gia-dinh", name: "Gia đình", icon: "👨‍👩‍👧" },
  { slug: "bi-an", name: "Bí ẩn", icon: "🔮" },
  { slug: "hoc-duong", name: "Học đường", icon: "📚" },
  { slug: "the-thao", name: "Thể thao", icon: "⚽" },
  { slug: "am-nhac", name: "Âm nhạc", icon: "🎵" },
  { slug: "tai-lieu", name: "Tài liệu", icon: "📹" },
  { slug: "chinh-kich", name: "Chính kịch", icon: "🎭" },
  { slug: "khoa-hoc", name: "Khoa học", icon: "🔬" },
  { slug: "kinh-dien", name: "Kinh điển", icon: "🏆" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "year-desc", label: "Năm mới → cũ" },
  { value: "year-asc", label: "Năm cũ → mới" },
  { value: "name-asc", label: "A → Z" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, index) => currentYear - index);

const MovieCard = memo(({ movie, onClick }: { movie: OPhimMovie; onClick: () => void }) => (
  <button onClick={onClick} className="group cursor-pointer text-left transition-transform active:scale-[0.98]">
    <div className="cinema-poster relative aspect-[2/3] overflow-hidden rounded-[14px] bg-[#0D0F18]">
      <Image src={getProxiedImageUrl(getImageUrl(movie.poster_url || movie.thumb_url))} alt={typeof movie.name === "string" ? movie.name : "Movie"} fill className="object-cover" sizes="(min-width: 2200px) 11vw, (min-width: 1600px) 13vw, (max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw" loading="lazy" unoptimized />
      <div className="absolute inset-0 hidden items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
        <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-gradient-to-tr from-[#FFD875] to-[#FDB022] shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-transform duration-300 hover:scale-110"><FontAwesomeIcon icon={faPlay} className="ml-[4px] text-[16px] text-[#08090F]" /></div>
      </div>
      {movie.quality && <span className="cinema-badge cinema-badge-quality absolute left-[8px] top-[8px]">{movie.quality}</span>}
      {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && <span className="absolute right-[8px] top-[8px] flex items-center gap-[4px] rounded-[6px] bg-black/80 px-[6px] py-[3px] text-[11px] font-semibold text-[#FFD875] shadow-sm backdrop-blur-md">★ {movie.tmdb.vote_average.toFixed(1)}</span>}
    </div>
    <h3 className="mt-[12px] truncate text-[14px] font-semibold text-white/90">{typeof movie.name === "string" ? movie.name : ""}</h3>
    <div className="mt-[4px] flex items-center gap-[8px]"><span className="text-[12px] text-[#6B7280]">{movie.year}</span>{movie.episode_current && <span className="text-[11px] font-medium text-[#FFD875]/90">{movie.episode_current}</span>}</div>
  </button>
));
MovieCard.displayName = "MovieCard";

const SkeletonCard = () => <div><div className="aspect-[2/3] animate-pulse rounded-[12px] bg-[#2a2d3e]" /><div className="mt-[8px] h-[14px] w-3/4 animate-pulse rounded bg-[#2a2d3e]" /></div>;

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

  const fetchMovies = useCallback(async (category: string, pageNumber: number) => {
    setLoading(true);
    try {
      const data = await getMoviesByCategory(category, pageNumber);
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
  }, [fetchMovies, page, selectedCategory]);

  const filteredAndSortedMovies = useMemo(() => {
    let result = [...movies];
    if (yearFilter) result = result.filter((movie) => movie.year === yearFilter);
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
      default:
        break;
    }
    return result;
  }, [movies, sortBy, yearFilter]);

  const clearFilters = () => {
    setSortBy("newest");
    setYearFilter(null);
  };

  const hasActiveFilters = sortBy !== "newest" || yearFilter !== null;

  return (
    <div className="min-h-screen bg-[#0A0C14] pt-[70px]">
      <div className="container mx-auto max-w-[1400px] px-[12px] py-[20px] sm:px-[16px]">
        <section className="mb-[28px] grid gap-[16px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[20px] border border-white/5 bg-[#0D0F18] px-[24px] py-[28px] shadow-sm">
            <p className="mb-[6px] text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFD875]">Khám phá</p>
            <h1 className="cinema-heading-xl tracking-[-0.02em]">Phim theo thể loại, có lọc và sắp xếp rõ ràng.</h1>
            <p className="mt-[12px] max-w-[760px] text-[15px] leading-relaxed text-[#6B7280]">Khu vực thể loại đã được đồng bộ với style mới: pills rõ, bộ lọc sạch hơn, card phim và phân trang dùng cùng ngôn ngữ giao diện với các page còn lại.</p>
          </div>
          <div className="rounded-[20px] border border-white/5 bg-[#0D0F18] px-[24px] py-[28px] shadow-sm">
            <p className="mb-[12px] text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">Trạng thái xem</p>
            <div className="space-y-[12px] text-[14px] text-white/70">
              <p className="flex justify-between"><span>Thể loại:</span> <span className="font-medium text-white">{selectedCategory.name}</span></p>
              <p className="flex justify-between"><span>Năm:</span> <span className="font-medium text-white">{yearFilter ?? "Tất cả"}</span></p>
              <p className="flex justify-between"><span>Sắp xếp:</span> <span className="font-medium text-white">{SORT_OPTIONS.find((item) => item.value === sortBy)?.label}</span></p>
            </div>
          </div>
        </section>

        <div className="mb-[24px] flex items-center justify-between">
          <div className="flex items-center gap-[12px]"><FontAwesomeIcon icon={faFilter} className="text-[20px] text-[#FFD875]" /><h2 className="cinema-heading-lg">Phim theo thể loại</h2></div>
          <button onClick={() => setShowFilters((value) => !value)} className={`cinema-btn-ghost flex min-h-[44px] items-center gap-[8px] rounded-full px-[16px] py-[10px] text-[14px] transition-all ${showFilters || hasActiveFilters ? "bg-[#FFD875]/10 text-[#FFD875] border-[#FFD875]/20" : ""}`}><FontAwesomeIcon icon={faSort} />Bộ lọc{hasActiveFilters && <span className="h-[8px] w-[8px] rounded-full bg-[#FFD875]" />}</button>
        </div>

        <div className="scrollbar-hide -mx-[12px] mb-[24px] overflow-x-auto px-[12px] pb-[8px] sm:mx-0 sm:px-0"><div className="flex gap-[8px] pb-[8px] sm:flex-wrap">{CATEGORIES.map((category) => <button key={category.slug} onClick={() => { setSelectedCategory(category); setPage(1); setSortBy("newest"); setYearFilter(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`cinema-pill min-h-[44px] whitespace-nowrap px-[16px] py-[10px] text-[14px] ${selectedCategory.slug === category.slug ? "active" : ""}`}><span>{category.icon}</span>{category.name}</button>)}</div></div>

        {showFilters && <div className="mb-[24px] bg-[#0E1019] border border-white/6 rounded-[14px] p-[18px]">
          <div className="flex flex-wrap gap-[16px]">
            <div className="min-w-[150px] flex-1">
              <label className="mb-[8px] flex items-center gap-[6px] text-[12px] font-medium uppercase tracking-wider text-[#6B7280]"><FontAwesomeIcon icon={faSort} className="text-[12px]" />Sắp xếp</label>
              <div className="relative"><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-h-[44px] w-full cursor-pointer appearance-none rounded-[10px] border border-white/10 bg-white/5 px-[14px] py-[10px] text-[14px] text-white outline-none transition-colors focus:border-[#FFD875]/50 focus:bg-white/10">{SORT_OPTIONS.map((option) => <option key={option.value} value={option.value} className="bg-[#0A0C14]">{option.label}</option>)}</select><FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] text-[#6B7280]" /></div>
            </div>
            <div className="min-w-[150px] flex-1">
              <label className="mb-[8px] flex items-center gap-[6px] text-[12px] font-medium uppercase tracking-wider text-[#6B7280]"><FontAwesomeIcon icon={faCalendar} className="text-[12px]" />Năm phát hành</label>
              <div className="relative"><select value={yearFilter || ""} onChange={(event) => setYearFilter(event.target.value ? Number(event.target.value) : null)} className="min-h-[44px] w-full cursor-pointer appearance-none rounded-[10px] border border-white/10 bg-white/5 px-[14px] py-[10px] text-[14px] text-white outline-none transition-colors focus:border-[#FFD875]/50 focus:bg-white/10"><option value="" className="bg-[#0A0C14]">Tất cả năm</option>{YEARS.map((year) => <option key={year} value={year} className="bg-[#0A0C14]">{year}</option>)}</select><FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] text-[#6B7280]" /></div>
            </div>
          </div>
          {hasActiveFilters && <button onClick={clearFilters} className="mt-[16px] flex items-center gap-[6px] text-[13px] font-medium text-red-400 hover:text-red-300"><FontAwesomeIcon icon={faTimes} className="text-[12px]" />Xóa bộ lọc</button>}
        </div>}

        <div className="mb-[20px] flex flex-wrap items-center gap-[8px] text-[14px] text-[#6B7280]"><span>Đang xem:</span><span className="flex items-center gap-[4px] font-medium text-[#FFD875]">{selectedCategory.icon} {selectedCategory.name}</span>{!loading && <><span>•</span><span>{filteredAndSortedMovies.length} phim</span><span>•</span><span>Trang {page}/{totalPages}</span></>}</div>

        <div className="tv-movie-grid grid grid-cols-3 gap-[10px] sm:grid-cols-4 sm:gap-[16px] md:grid-cols-5 lg:grid-cols-6">{loading ? Array.from({ length: 18 }).map((_, index) => <SkeletonCard key={index} />) : filteredAndSortedMovies.length > 0 ? filteredAndSortedMovies.map((movie) => <MovieCard key={movie._id} movie={movie} onClick={() => router.push(`/phim/${movie.slug}`)} />) : <div className="col-span-full py-[80px] text-center text-[#6B7280]"><p className="mb-[8px] text-[18px] font-semibold text-white/80">Không tìm thấy phim</p><p className="text-[14px]">Thử thay đổi bộ lọc hoặc chuyển sang thể loại khác.</p></div>}</div>

        {!loading && totalPages > 1 && <div className="mt-[40px] flex flex-wrap items-center justify-center gap-[8px]">
          <button onClick={() => { setPage((current) => Math.max(1, current - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === 1} className="cinema-btn-ghost min-h-[44px] rounded-full px-[20px] py-[10px] text-[14px] font-medium disabled:opacity-40">← Trước</button>
          {page > 3 && <><button onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/5 text-[14px] text-white hover:bg-white/10">1</button>{page > 4 && <span className="text-[#6B7280]">...</span>}</>}
          {Array.from({ length: 5 }, (_, index) => page - 2 + index).filter((value) => value >= 1 && value <= totalPages).map((value) => <button key={value} onClick={() => { setPage(value); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-[14px] font-medium transition-all ${page === value ? "bg-[#FFD875] text-[#08090F] shadow-[0_0_14px_rgba(255,216,117,0.3)]" : "bg-white/5 text-white hover:bg-white/10"}`}>{value}</button>)}
          {page < totalPages - 2 && <>{page < totalPages - 3 && <span className="text-[#6B7280]">...</span>}<button onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/5 text-[14px] text-white hover:bg-white/10">{totalPages}</button></>}
          <button onClick={() => { setPage((current) => Math.min(totalPages, current + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === totalPages} className="cinema-btn min-h-[44px] rounded-full px-[20px] py-[10px] text-[14px] font-semibold disabled:opacity-40">Tiếp →</button>
        </div>}
      </div>
    </div>
  );
}
