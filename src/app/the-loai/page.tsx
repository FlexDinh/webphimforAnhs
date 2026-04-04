"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronDown, faFilter, faPlay, faSort, faTimes } from "@fortawesome/free-solid-svg-icons";
import { getImageUrl, getMoviesByCategory, OPhimMovie } from "@/lib/ophimApi";

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
    <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] bg-[#2a2d3e]">
      <Image src={getImageUrl(movie.poster_url || movie.thumb_url)} alt={typeof movie.name === "string" ? movie.name : "Movie"} fill className="object-cover" sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw" loading="lazy" unoptimized />
      <div className="absolute inset-0 hidden items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent pb-[16px] opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
        <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#FFD875]"><FontAwesomeIcon icon={faPlay} className="ml-[2px] text-[12px] text-black" /></div>
      </div>
      {movie.quality && <span className="absolute left-[6px] top-[6px] rounded bg-[#FFD875] px-[5px] py-[2px] text-[9px] font-bold text-black">{movie.quality}</span>}
      {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && <span className="absolute right-[6px] top-[6px] flex items-center gap-[2px] rounded bg-black/70 px-[5px] py-[2px] text-[9px] font-bold text-[#FFD875]">★ {movie.tmdb.vote_average.toFixed(1)}</span>}
    </div>
    <h3 className="mt-[8px] truncate text-[13px] font-medium text-white">{typeof movie.name === "string" ? movie.name : ""}</h3>
    <div className="mt-[2px] flex items-center gap-[6px]"><span className="text-[11px] text-[#888]">{movie.year}</span>{movie.episode_current && <span className="text-[10px] text-[#FFD875]">{movie.episode_current}</span>}</div>
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
    <div className="min-h-screen bg-[#0F111A] pt-[70px]">
      <div className="container mx-auto max-w-[1400px] px-[12px] py-[20px] sm:px-[16px]">
        <section className="mb-[20px] grid gap-[14px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,216,117,0.1),rgba(255,255,255,0.03))] px-[20px] py-[22px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#FFD875]">Đi theo nhóm nội dung</p>
            <h1 className="mt-[8px] text-[28px] font-semibold text-white">Phim theo thể loại, có lọc và sắp xếp rõ ràng.</h1>
            <p className="mt-[8px] max-w-[760px] text-[14px] leading-6 text-white/58">Khu vực thể loại đã được đồng bộ với style mới: pills rõ, bộ lọc sạch hơn, card phim và phân trang dùng cùng ngôn ngữ giao diện với các page còn lại.</p>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] px-[20px] py-[22px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/40">Trạng thái xem</p>
            <div className="mt-[12px] space-y-[10px] text-[14px] text-white/72">
              <p>Thể loại hiện tại: {selectedCategory.name}</p>
              <p>Bộ lọc năm: {yearFilter ?? "Tất cả"}</p>
              <p>Sắp xếp: {SORT_OPTIONS.find((item) => item.value === sortBy)?.label}</p>
            </div>
          </div>
        </section>

        <div className="mb-[20px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]"><FontAwesomeIcon icon={faFilter} className="text-[18px] text-[#FFD875]" /><h2 className="text-[20px] font-bold text-white sm:text-[24px]">Phim theo thể loại</h2></div>
          <button onClick={() => setShowFilters((value) => !value)} className={`flex min-h-[44px] items-center gap-[6px] rounded-full px-[14px] py-[10px] text-[13px] transition-all ${showFilters || hasActiveFilters ? "bg-[#FFD875] font-semibold text-black" : "bg-white/10 text-white"}`}><FontAwesomeIcon icon={faSort} />Bộ lọc{hasActiveFilters && <span className="h-[6px] w-[6px] rounded-full bg-red-500" />}</button>
        </div>

        <div className="scrollbar-hide -mx-[12px] mb-[16px] overflow-x-auto px-[12px] pb-[8px] sm:mx-0 sm:px-0"><div className="flex gap-[8px] pb-[8px] sm:flex-wrap">{CATEGORIES.map((category) => <button key={category.slug} onClick={() => { setSelectedCategory(category); setPage(1); setSortBy("newest"); setYearFilter(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`flex min-h-[44px] items-center gap-[6px] whitespace-nowrap rounded-full px-[14px] py-[10px] text-[13px] transition-all duration-200 active:scale-95 ${selectedCategory.slug === category.slug ? "bg-gradient-to-r from-[#FFD875] to-[#f0a500] font-semibold text-black shadow-lg shadow-[#FFD875]/20" : "bg-white/10 text-white hover:bg-white/20"}`}><span>{category.icon}</span>{category.name}</button>)}</div></div>

        {showFilters && <div className="mb-[20px] rounded-[16px] border border-white/10 bg-[#1a1c2e] p-[16px]">
          <div className="flex flex-wrap gap-[16px]">
            <div className="min-w-[150px] flex-1">
              <label className="mb-[8px] flex items-center gap-[6px] text-[12px] uppercase tracking-wider text-[#888]"><FontAwesomeIcon icon={faSort} className="text-[10px]" />Sắp xếp</label>
              <div className="relative"><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-h-[44px] w-full cursor-pointer appearance-none rounded-[10px] border border-white/10 bg-white/10 px-[14px] py-[10px] text-[14px] text-white">{SORT_OPTIONS.map((option) => <option key={option.value} value={option.value} className="bg-[#1a1c2e]">{option.label}</option>)}</select><FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] text-[#888]" /></div>
            </div>
            <div className="min-w-[150px] flex-1">
              <label className="mb-[8px] flex items-center gap-[6px] text-[12px] uppercase tracking-wider text-[#888]"><FontAwesomeIcon icon={faCalendar} className="text-[10px]" />Năm phát hành</label>
              <div className="relative"><select value={yearFilter || ""} onChange={(event) => setYearFilter(event.target.value ? Number(event.target.value) : null)} className="min-h-[44px] w-full cursor-pointer appearance-none rounded-[10px] border border-white/10 bg-white/10 px-[14px] py-[10px] text-[14px] text-white"><option value="" className="bg-[#1a1c2e]">Tất cả năm</option>{YEARS.map((year) => <option key={year} value={year} className="bg-[#1a1c2e]">{year}</option>)}</select><FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] text-[#888]" /></div>
            </div>
          </div>
          {hasActiveFilters && <button onClick={clearFilters} className="mt-[12px] flex items-center gap-[4px] text-[12px] text-red-400 hover:text-red-300"><FontAwesomeIcon icon={faTimes} className="text-[10px]" />Xóa bộ lọc</button>}
        </div>}

        <div className="mb-[16px] flex flex-wrap items-center gap-[8px] text-[14px] text-[#888]"><span>Đang xem:</span><span className="flex items-center gap-[4px] font-medium text-[#FFD875]">{selectedCategory.icon} {selectedCategory.name}</span>{!loading && <><span>•</span><span>{filteredAndSortedMovies.length} phim</span><span>•</span><span>Trang {page}/{totalPages}</span></>}</div>

        <div className="grid grid-cols-3 gap-[10px] sm:grid-cols-4 sm:gap-[16px] md:grid-cols-5 lg:grid-cols-6">{loading ? Array.from({ length: 18 }).map((_, index) => <SkeletonCard key={index} />) : filteredAndSortedMovies.length > 0 ? filteredAndSortedMovies.map((movie) => <MovieCard key={movie._id} movie={movie} onClick={() => router.push(`/phim/${movie.slug}`)} />) : <div className="col-span-full py-[60px] text-center text-[#888]"><p className="mb-[8px] text-[16px]">Không tìm thấy phim</p><p className="text-[13px]">Thử thay đổi bộ lọc hoặc chuyển sang thể loại khác.</p></div>}</div>

        {!loading && totalPages > 1 && <div className="mt-[30px] flex flex-wrap items-center justify-center gap-[8px]">
          <button onClick={() => { setPage((current) => Math.max(1, current - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === 1} className="min-h-[44px] rounded-full bg-white/10 px-[16px] py-[10px] text-[13px] text-white disabled:opacity-40">← Trước</button>
          {page > 3 && <><button onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="min-h-[44px] h-[40px] w-[40px] rounded-full bg-white/10 text-[13px] text-white hover:bg-white/20">1</button>{page > 4 && <span className="text-[#888]">...</span>}</>}
          {Array.from({ length: 5 }, (_, index) => page - 2 + index).filter((value) => value >= 1 && value <= totalPages).map((value) => <button key={value} onClick={() => { setPage(value); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`min-h-[44px] h-[40px] w-[40px] rounded-full text-[13px] ${page === value ? "bg-[#FFD875] font-bold text-black" : "bg-white/10 text-white hover:bg-white/20"}`}>{value}</button>)}
          {page < totalPages - 2 && <>{page < totalPages - 3 && <span className="text-[#888]">...</span>}<button onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="min-h-[44px] h-[40px] w-[40px] rounded-full bg-white/10 text-[13px] text-white hover:bg-white/20">{totalPages}</button></>}
          <button onClick={() => { setPage((current) => Math.min(totalPages, current + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === totalPages} className="min-h-[44px] rounded-full bg-[#FFD875] px-[16px] py-[10px] text-[13px] font-semibold text-black disabled:opacity-40">Tiếp →</button>
        </div>}
      </div>
    </div>
  );
}
