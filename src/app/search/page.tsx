"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faChevronDown,
  faFilter,
  faPlay,
  faSearch,
  faSortAmountDown,
  faSpinner,
  faStar,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { getImageUrl, OPhimMovie, searchMovies } from "@/lib/ophimApi";
import { extractAllGenres, extractAllYears, filterMoviesByGenres, filterMoviesByRating, filterMoviesByYear } from "@/lib/movieUtils";

function fuzzyMatch(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 80;
  const words = q.split(/\s+/);
  const matchedWords = words.filter((word) => t.includes(word));
  if (matchedWords.length === words.length) return 70;
  if (matchedWords.length > 0) return 40 + (matchedWords.length / words.length) * 30;
  let score = 0;
  let lastIndex = -1;
  for (const char of q) {
    const index = t.indexOf(char, lastIndex + 1);
    if (index !== -1) {
      score++;
      lastIndex = index;
    }
  }
  return (score / q.length) * 30;
}

function getSuggestions(query: string): string[] {
  const corrections: Record<string, string> = {
    "nguoi nhen": "người nhện",
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
  const normalized = query.toLowerCase().trim();
  for (const [key, value] of Object.entries(corrections)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      suggestions.push(query.replace(new RegExp(key, "gi"), value));
    }
  }
  return suggestions.slice(0, 3);
}

type SortOption = "relevance" | "rating-desc" | "rating-asc" | "year-desc" | "year-asc" | "name-asc";

const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof faSearch }[] = [
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
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
    const runSearch = async () => {
      setLoading(true);
      try {
        const movies = await searchMovies(normalizedQuery, 48);
        setResults(movies);
        setDidYouMean(movies.length < 3 ? getSuggestions(normalizedQuery) : []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };
    runSearch();
  }, [query]);

  const availableGenres = useMemo(() => extractAllGenres(results), [results]);
  const availableYears = useMemo(() => extractAllYears(results), [results]);

  const filteredResults = useMemo(() => {
    let filtered = [...results];
    if (selectedGenres.length > 0) filtered = filterMoviesByGenres(filtered, selectedGenres);
    if (selectedYear) filtered = filterMoviesByYear(filtered, selectedYear);
    if (minRating > 0) filtered = filterMoviesByRating(filtered, minRating);
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
      default:
        if (query) {
          filtered.sort((a, b) => {
            const scoreA = Math.max(fuzzyMatch(a.name || "", query), fuzzyMatch(a.origin_name || "", query));
            const scoreB = Math.max(fuzzyMatch(b.name || "", query), fuzzyMatch(b.origin_name || "", query));
            return scoreB - scoreA;
          });
        }
    }
    return filtered;
  }, [results, selectedGenres, selectedYear, minRating, sortBy, query]);

  const activeFilterCount = (selectedGenres.length > 0 ? 1 : 0) + (selectedYear ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedYear(null);
    setMinRating(0);
    setSortBy("relevance");
  };

  return (
    <div className="min-h-screen bg-[#0F111A] pb-[100px] pt-[90px]">
      <div className="container mx-auto max-w-[1400px] px-[16px]">
        <section className="mb-[28px] grid gap-[14px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,216,117,0.12),rgba(255,255,255,0.03))] px-[20px] py-[22px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#FFD875]">Tìm kiếm thông minh</p>
            <h1 className="mt-[8px] text-[28px] font-semibold text-white">Tìm theo tên phim, diễn viên hoặc cụm từ gần đúng.</h1>
            <p className="mt-[8px] max-w-[760px] text-[14px] leading-6 text-white/58">Khu vực tìm kiếm đã được đồng bộ lại với phần gợi ý, bộ lọc và trạng thái kết quả để tránh cảm giác rời rạc giữa ô search, trang search và page phim.</p>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] px-[20px] py-[22px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/40">Gợi ý sử dụng</p>
            <div className="mt-[12px] space-y-[10px] text-[14px] text-white/72">
              <p>Tên phim: `One Piece`, `Dandadan`</p>
              <p>Thể loại gần đúng: `hanh dong`, `kinh di`</p>
              <p>Dùng bộ lọc để thu hẹp theo năm và rating.</p>
            </div>
          </div>
        </section>

        <form onSubmit={(e) => { e.preventDefault(); if (searchInput.trim()) router.push(`/search?query=${encodeURIComponent(searchInput.trim())}`); }} className="mb-[30px]">
          <div className="relative mx-auto max-w-[640px]">
            <FontAwesomeIcon icon={faSearch} className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[18px] text-[#666]" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm phim, diễn viên, đạo diễn..." className="w-full rounded-full border border-white/10 bg-white/10 py-[16px] pl-[56px] pr-[20px] text-[16px] text-white placeholder-[#666] transition-all focus:border-[#FFD875]/50 focus:bg-white/15 focus:outline-none" autoFocus />
          </div>
        </form>

        {didYouMean.length > 0 && <div className="mb-[20px] text-center"><span className="text-[14px] text-white/50">Bạn có ý tìm: </span>{didYouMean.map((suggestion, index) => <button key={index} onClick={() => router.push(`/search?query=${encodeURIComponent(suggestion)}`)} className="mx-[4px] text-[14px] font-medium text-[#FFD875] hover:underline">&quot;{suggestion}&quot;</button>)}</div>}

        {query && <div className="mb-[20px] flex flex-wrap items-center justify-between gap-[12px]">
          <div>
            <h2 className="text-[22px] font-bold text-white">Kết quả: <span className="text-[#FFD875]">&quot;{query}&quot;</span></h2>
            <p className="mt-[2px] text-[13px] text-[#888]">{filteredResults.length} / {results.length} phim{activeFilterCount > 0 && ` (${activeFilterCount} bộ lọc đang áp dụng)`}</p>
          </div>
          <div className="flex items-center gap-[8px]">
            <div className="relative">
              <button onClick={() => setShowSortDropdown((v) => !v)} className="flex items-center gap-[6px] rounded-full border border-white/10 bg-white/10 px-[14px] py-[8px] text-[12px] text-white transition-all hover:bg-white/20">
                <FontAwesomeIcon icon={faSortAmountDown} className="text-[10px]" />
                {SORT_OPTIONS.find((item) => item.value === sortBy)?.label}
                <FontAwesomeIcon icon={faChevronDown} className="text-[8px]" />
              </button>
              {showSortDropdown && <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                <div className="absolute right-0 top-full z-50 mt-[4px] w-[210px] overflow-hidden rounded-[12px] border border-white/10 bg-[#1E2545] shadow-xl">
                  {SORT_OPTIONS.map((option) => <button key={option.value} onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }} className={`flex w-full items-center gap-[8px] px-[14px] py-[10px] text-left text-[13px] transition-colors ${sortBy === option.value ? "bg-[#FFD875]/10 text-[#FFD875]" : "text-white hover:bg-white/10"}`}><FontAwesomeIcon icon={option.icon} className="w-[14px] text-[10px]" />{option.label}</button>)}
                </div>
              </>}
            </div>
            <button onClick={() => setShowFilters((v) => !v)} className={`flex items-center gap-[6px] rounded-full border px-[14px] py-[8px] text-[12px] transition-all ${showFilters || activeFilterCount > 0 ? "border-[#FFD875]/40 bg-[#FFD875]/20 text-[#FFD875]" : "border-white/10 bg-white/10 text-white hover:bg-white/20"}`}>
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
              Bộ lọc
              {activeFilterCount > 0 && <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#FFD875] text-[10px] font-bold text-black">{activeFilterCount}</span>}
            </button>
          </div>
        </div>}

        {showFilters && results.length > 0 && <div className="mb-[24px] animate-fade-in rounded-[16px] border border-white/5 bg-[#1a1c2e] p-[20px]">
          <div className="mb-[16px] flex items-center justify-between">
            <h3 className="flex items-center gap-[8px] text-[15px] font-semibold text-white"><FontAwesomeIcon icon={faFilter} className="text-[13px] text-[#FFD875]" />Bộ lọc nâng cao</h3>
            {activeFilterCount > 0 && <button onClick={clearAllFilters} className="flex items-center gap-[4px] text-[12px] text-red-400 hover:text-red-300"><FontAwesomeIcon icon={faTimes} className="text-[9px]" />Xóa bộ lọc</button>}
          </div>
          {availableGenres.length > 0 && <div className="mb-[16px]">
            <p className="mb-[8px] text-[11px] uppercase tracking-wider text-white/50">Thể loại</p>
            <div className="flex flex-wrap gap-[6px]">{availableGenres.map((genre) => <button key={genre} onClick={() => setSelectedGenres((prev) => prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre])} className={`rounded-full px-[12px] py-[6px] text-[11px] transition-all ${selectedGenres.includes(genre) ? "bg-[#FFD875] font-semibold text-black" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>{genre}</button>)}</div>
          </div>}
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
            {availableYears.length > 0 && <div>
              <p className="mb-[8px] text-[11px] uppercase tracking-wider text-white/50"><FontAwesomeIcon icon={faCalendarAlt} className="mr-[4px]" />Năm sản xuất</p>
              <div className="flex flex-wrap gap-[6px]">
                <button onClick={() => setSelectedYear(null)} className={`rounded-full px-[12px] py-[6px] text-[11px] transition-all ${!selectedYear ? "bg-[#FFD875] font-semibold text-black" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>Tất cả</button>
                {availableYears.slice(0, 10).map((year) => <button key={year} onClick={() => setSelectedYear(selectedYear === year ? null : year)} className={`rounded-full px-[12px] py-[6px] text-[11px] transition-all ${selectedYear === year ? "bg-[#FFD875] font-semibold text-black" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>{year}</button>)}
              </div>
            </div>}
            <div>
              <p className="mb-[8px] text-[11px] uppercase tracking-wider text-white/50"><FontAwesomeIcon icon={faStar} className="mr-[4px]" />Đánh giá tối thiểu</p>
              <div className="flex items-center gap-[8px]">{[0, 5, 6, 7, 8, 9].map((rating) => <button key={rating} onClick={() => setMinRating(minRating === rating ? 0 : rating)} className={`flex items-center gap-[4px] rounded-full px-[12px] py-[6px] text-[11px] transition-all ${minRating === rating ? "bg-[#FFD875] font-semibold text-black" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>{rating === 0 ? "Tất cả" : `★ ${rating}+`}</button>)}</div>
            </div>
          </div>
        </div>}

        {loading ? <div className="flex justify-center py-[60px]"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-[40px] text-[#FFD875]" /></div> : filteredResults.length > 0 ? <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 sm:gap-[16px] md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredResults.map((movie) => <button key={movie._id} onClick={() => router.push(`/phim/${movie.slug}`)} className="movie-card-premium group cursor-pointer text-left">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] bg-[#2a2d3e]">
              <Image src={getImageUrl(movie.poster_url || movie.thumb_url)} alt={movie.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw" unoptimized />
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent pb-[16px] opacity-0 transition-opacity group-hover:opacity-100"><div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#FFD875]"><FontAwesomeIcon icon={faPlay} className="ml-[2px] text-[14px] text-black" /></div></div>
              {movie.quality && <span className="absolute left-[8px] top-[8px] rounded bg-[#FFD875] px-[6px] py-[2px] text-[10px] font-semibold text-black">{movie.quality}</span>}
              {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && <span className="absolute right-[8px] top-[8px] flex items-center gap-[2px] rounded bg-black/70 px-[5px] py-[2px] text-[9px] font-bold text-[#FFD875]">★ {movie.tmdb.vote_average.toFixed(1)}</span>}
            </div>
            <div className="mt-[10px]"><h3 className="truncate text-[13px] font-medium text-white transition-colors group-hover:text-[#FFD875]">{String(movie.name || "")}</h3><p className="truncate text-[11px] text-white/40">{String(movie.origin_name || "")}</p><div className="mt-[4px] flex items-center gap-[6px]"><span className="text-[11px] text-[#888]">{String(movie.year || "")}</span>{movie.category && movie.category.length > 0 && <span className="truncate text-[10px] text-white/30">• {movie.category.slice(0, 2).map((item) => item.name).join(", ")}</span>}</div></div>
          </button>)}
        </div> : query ? <div className="py-[60px] text-center"><p className="text-[18px] text-white/60">Không tìm thấy kết quả nào</p><p className="mt-[8px] text-[14px] text-[#888]">Thử từ khóa khác hoặc nới bộ lọc để mở rộng danh sách.</p>{activeFilterCount > 0 && <button onClick={clearAllFilters} className="mt-[16px] rounded-full bg-[#FFD875]/20 px-[20px] py-[10px] text-[13px] text-[#FFD875] transition-colors hover:bg-[#FFD875]/30">Xóa bộ lọc</button>}</div> : <div className="py-[60px] text-center"><FontAwesomeIcon icon={faSearch} className="mb-[16px] text-[60px] text-white/20" /><p className="text-white/40">Nhập từ khóa để tìm phim</p></div>}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0F111A]"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-[40px] text-[#FFD875]" /></div>}><SearchContent /></Suspense>;
}
