"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getTheatricalMovies, getImageUrl, OPhimMovie } from "@/lib/ophimApi";
import { getProxiedImageUrl } from "@/lib/imageProxy";

const GENRES = [
  { label: "Tất cả", value: "" },
  { label: "Hành động", value: "hanh-dong" },
  { label: "Tình cảm", value: "tinh-cam" },
  { label: "Hài hước", value: "hai-huoc" },
  { label: "Kinh dị", value: "kinh-di" },
  { label: "Viễn tưởng", value: "vien-tuong" },
  { label: "Phiêu lưu", value: "phieu-luu" },
  { label: "Hoạt hình", value: "hoat-hinh" },
  { label: "Gia đình", value: "gia-dinh" },
  { label: "Tội phạm", value: "toi-pham" },
  { label: "Bí ẩn", value: "bi-an" },
];

const YEARS = [
  { label: "Tất cả năm", value: 0 },
  { label: "2025", value: 2025 },
  { label: "2024", value: 2024 },
  { label: "2023", value: 2023 },
  { label: "2022", value: 2022 },
];

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Đánh giá cao", value: "rating" },
  { label: "Tên A–Z", value: "name" },
];

export default function ChieuRapPage() {
  const router = useRouter();
  const [allMovies, setAllMovies] = useState<OPhimMovie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMovies = useCallback(async (p: number) => {
    try {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      const data = await getTheatricalMovies(p);
      setAllMovies(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    } catch (err) {
      console.error("Failed to load theatrical movies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(page);
  }, [page, fetchMovies]);

  // Client-side filtering & sorting on current page
  useEffect(() => {
    let result = [...allMovies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.origin_name?.toLowerCase().includes(q)
      );
    }

    if (selectedGenre) {
      result = result.filter((m) =>
        m.category?.some((c) => c.slug === selectedGenre)
      );
    }

    if (selectedYear > 0) {
      result = result.filter((m) => m.year === selectedYear);
    }

    if (sortBy === "rating") {
      result = result.sort(
        (a, b) => (b.tmdb?.vote_average ?? 0) - (a.tmdb?.vote_average ?? 0)
      );
    } else if (sortBy === "name") {
      result = result.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    }

    setFilteredMovies(result);
  }, [allMovies, selectedGenre, selectedYear, sortBy, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const hasActiveFilter = selectedGenre || selectedYear > 0 || searchQuery.trim();

  return (
    <div className="min-h-screen bg-[#0A0C14] pb-[60px] pt-[90px]">
      <div className="container mx-auto max-w-[1400px] px-[16px]">

        {/* Hero Header */}
        <div className="mb-[32px] overflow-hidden rounded-[20px] border border-[#FFD875]/20 bg-[linear-gradient(135deg,rgba(255,216,117,0.1),rgba(255,255,255,0.02))] px-[24px] py-[28px] sm:px-[36px] shadow-sm">
          <div className="flex flex-col gap-[16px] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-[6px] text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFD875]">
                🎬 Đang chiếu tại rạp
              </p>
              <h1 className="cinema-heading-xl tracking-[-0.02em] mb-[12px]">
                Phim Chiếu Rạp
              </h1>
              <p className="max-w-[600px] text-[15px] leading-relaxed text-[#6B7280]">
                Tổng hợp {totalItems > 0 ? totalItems.toLocaleString() : "hàng trăm"} tựa phim đang và sắp chiếu rạp. Cập nhật liên tục từ OPhim.
              </p>
            </div>
            <div className="flex items-center gap-[12px]">
              <div className="rounded-[16px] border border-[#FFD875]/20 bg-[#FFD875]/10 px-[20px] py-[14px] text-center backdrop-blur-sm">
                <div className="text-[28px] font-bold text-[#FFD875]">{totalItems > 0 ? totalItems.toLocaleString() : "—"}</div>
                <div className="text-[11px] uppercase tracking-wider text-[#FFD875]/70">Tổng phim</div>
              </div>
              <div className="rounded-[16px] border border-white/10 bg-white/5 px-[20px] py-[14px] text-center backdrop-blur-sm">
                <div className="text-[28px] font-bold text-white/90">{totalPages}</div>
                <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">Trang</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-[32px] flex flex-col gap-[16px] bg-[#0E1019] border border-white/6 rounded-[14px] p-[16px]">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#6B7280]">🔍</span>
            <input
              type="text"
              placeholder="Tìm trong trang này..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[12px] border border-white/10 bg-[#0A0C14] py-[12px] pl-[44px] pr-[16px] text-[14px] text-white placeholder-[#6B7280] outline-none focus:border-[#FFD875]/50 transition-colors"
            />
          </div>

          {/* Genre + Year + Sort */}
          <div className="flex flex-wrap items-center justify-between gap-[12px]">
            {/* Genre pills */}
            <div className="flex flex-wrap gap-[8px]">
              {GENRES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setSelectedGenre(g.value)}
                  className={`cinema-pill px-[14px] py-[6px] text-[13px] ${
                    selectedGenre === g.value ? "active" : ""
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-[10px]">
              {/* Year filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="cursor-pointer appearance-none rounded-[10px] border border-white/10 bg-[#0A0C14] px-[16px] py-[8px] text-[13px] text-white outline-none focus:border-[#FFD875]/50 transition-colors"
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value} className="bg-[#0A0C14]">{y.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer appearance-none rounded-[10px] border border-white/10 bg-[#0A0C14] px-[16px] py-[8px] text-[13px] text-white outline-none focus:border-[#FFD875]/50 transition-colors"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#0A0C14]">{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter summary */}
          {hasActiveFilter && (
            <div className="mt-[4px] flex items-center justify-between rounded-[10px] bg-[#FFD875]/10 px-[16px] py-[10px] border border-[#FFD875]/20">
              <span className="text-[13px] font-medium text-[#FFD875]">
                Đang lọc — hiển thị {filteredMovies.length} / {allMovies.length} phim trang này
              </span>
              <button
                onClick={() => { setSelectedGenre(""); setSelectedYear(0); setSearchQuery(""); setSortBy("newest"); }}
                className="text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="tv-movie-grid grid grid-cols-2 gap-[14px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-[14px] bg-[#141824]" />
                <div className="mt-[10px] h-[14px] w-[80%] rounded bg-[#141824]" />
                <div className="mt-[6px] h-[12px] w-[60%] rounded bg-[#141824]" />
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[80px] text-center">
            <div className="mb-[16px] text-[60px]">🎭</div>
            <h3 className="mb-[8px] text-[20px] font-semibold text-white/90">Không tìm thấy phim</h3>
            <p className="text-[15px] text-[#6B7280]">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
            <button
              onClick={() => { setSelectedGenre(""); setSelectedYear(0); setSearchQuery(""); }}
              className="cinema-btn mt-[24px] rounded-full px-[24px] py-[12px] text-[14px] font-semibold"
            >
              Xoá bộ lọc
            </button>
          </div>
        ) : (
          <div className="tv-movie-grid grid grid-cols-2 gap-[14px] sm:grid-cols-3 sm:gap-[16px] md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredMovies.map((movie) => (
              <button
                key={movie._id}
                onClick={() => router.push(`/phim/${movie.slug}`)}
                className="group cursor-pointer text-left transition-transform active:scale-[0.98]"
              >
                <div className="cinema-poster relative aspect-[2/3] overflow-hidden rounded-[14px] bg-[#0D0F18]">
                  <Image
                    src={getProxiedImageUrl(getImageUrl(movie.poster_url || movie.thumb_url))}
                    alt={movie.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 2200px) 11vw, (min-width: 1600px) 13vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    unoptimized
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 hidden items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
                    <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-gradient-to-tr from-[#FFD875] to-[#FDB022] shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-transform duration-300 hover:scale-110">
                      <span className="ml-[4px] text-[16px] text-[#08090F]">▶</span>
                    </div>
                  </div>

                  {/* Top badges */}
                  <div className="absolute left-[8px] top-[8px] flex flex-col gap-[4px]">
                    {movie.quality && (
                      <span className="cinema-badge cinema-badge-quality">
                        {movie.quality}
                      </span>
                    )}
                    <span className="cinema-badge bg-[rgba(255,80,80,0.9)] text-white shadow-sm backdrop-blur-md">
                      📽 Rạp
                    </span>
                  </div>

                  {/* Rating badge */}
                  {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                    <div className="absolute right-[8px] top-[8px]">
                      <span className="rounded-[6px] bg-black/80 px-[6px] py-[3px] text-[11px] font-semibold text-[#FFD875] shadow-sm backdrop-blur-md">
                        ★ {movie.tmdb.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Episode label */}
                  {movie.episode_current && movie.episode_current !== "Full" && (
                    <div className="absolute bottom-[8px] right-[8px]">
                      <span className="rounded-[6px] bg-black/80 px-[6px] py-[3px] text-[11px] font-medium text-white shadow-sm backdrop-blur-md">
                        {movie.episode_current}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-[12px]">
                  <h3 className="truncate text-[14px] font-semibold text-white/90 transition-colors group-hover:text-[#FFD875]">
                    {movie.name}
                  </h3>
                  <div className="mt-[4px] flex items-center gap-[8px]">
                    <span className="text-[12px] text-[#6B7280]">{movie.year}</span>
                    {movie.type === "hoathinh" && (
                      <span className="rounded-[4px] bg-purple-500/20 px-[6px] py-[2px] text-[10px] font-medium text-purple-300 border border-purple-500/30">Hoạt hình</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-[48px] flex flex-col items-center gap-[20px]">
            <p className="text-[13px] font-medium text-[#6B7280]">
              Trang {page} / {totalPages} — {totalItems.toLocaleString()} phim
            </p>
            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="cinema-btn-ghost flex h-[44px] w-[44px] items-center justify-center rounded-full text-[14px] font-medium disabled:opacity-40"
              >
                «
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="cinema-btn-ghost min-h-[44px] rounded-full px-[20px] py-[10px] text-[14px] font-medium disabled:opacity-40"
              >
                Trước
              </button>

              <div className="flex items-center gap-[6px]">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-[14px] font-medium transition-all ${
                        pageNum === page
                          ? "bg-[#FFD875] text-[#08090F] shadow-[0_0_14px_rgba(255,216,117,0.3)]"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="cinema-btn min-h-[44px] rounded-full px-[20px] py-[10px] text-[14px] font-semibold disabled:opacity-40"
              >
                Tiếp
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className="cinema-btn-ghost flex h-[44px] w-[44px] items-center justify-center rounded-full text-[14px] font-medium disabled:opacity-40"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
