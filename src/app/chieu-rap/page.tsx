"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getTheatricalMovies, getImageUrl, OPhimMovie } from "@/lib/ophimApi";

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
    <div className="min-h-screen bg-[#0F111A] pb-[60px] pt-[90px]">
      <div className="container mx-auto max-w-[1400px] px-[16px]">

        {/* Hero Header */}
        <div className="mb-[32px] overflow-hidden rounded-[28px] border border-[#FFD875]/20 bg-[linear-gradient(135deg,rgba(255,216,117,0.14),rgba(255,165,0,0.06),rgba(255,255,255,0.03))] px-[24px] py-[28px] sm:px-[36px]">
          <div className="flex flex-col gap-[16px] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-[6px] text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFD875]">
                🎬 Đang chiếu tại rạp
              </p>
              <h1 className="mb-[8px] text-[32px] font-bold text-white sm:text-[36px]">
                Phim Chiếu Rạp
              </h1>
              <p className="max-w-[600px] text-[14px] leading-6 text-[#888]">
                Tổng hợp {totalItems > 0 ? totalItems.toLocaleString() : "hàng trăm"} tựa phim đang và sắp chiếu rạp. Cập nhật liên tục từ OPhim.
              </p>
            </div>
            <div className="flex items-center gap-[12px]">
              <div className="rounded-[16px] border border-[#FFD875]/20 bg-[#FFD875]/10 px-[20px] py-[14px] text-center">
                <div className="text-[28px] font-bold text-[#FFD875]">{totalItems > 0 ? totalItems.toLocaleString() : "—"}</div>
                <div className="text-[11px] text-[#888]">Tổng phim</div>
              </div>
              <div className="rounded-[16px] border border-white/10 bg-white/5 px-[20px] py-[14px] text-center">
                <div className="text-[28px] font-bold text-white">{totalPages}</div>
                <div className="text-[11px] text-[#888]">Trang</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-[28px] flex flex-col gap-[12px]">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#666]">🔍</span>
            <input
              type="text"
              placeholder="Tìm trong trang này..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[12px] border border-white/10 bg-white/5 py-[11px] pl-[40px] pr-[16px] text-[14px] text-white placeholder-[#555] outline-none focus:border-[#FFD875]/50 focus:bg-white/8 transition-colors"
            />
          </div>

          {/* Genre + Year + Sort */}
          <div className="flex flex-wrap gap-[8px]">
            {/* Genre pills */}
            <div className="flex flex-wrap gap-[6px]">
              {GENRES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setSelectedGenre(g.value)}
                  className={`rounded-full px-[14px] py-[7px] text-[13px] font-medium transition-all ${
                    selectedGenre === g.value
                      ? "bg-[#FFD875] text-black shadow-[0_0_16px_rgba(255,216,117,0.3)]"
                      : "bg-white/8 text-[#aaa] hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-[8px]">
              {/* Year filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-[10px] border border-white/10 bg-[#1a1d2e] px-[12px] py-[8px] text-[13px] text-white outline-none focus:border-[#FFD875]/50"
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-[10px] border border-white/10 bg-[#1a1d2e] px-[12px] py-[8px] text-[13px] text-white outline-none focus:border-[#FFD875]/50"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter summary */}
          {hasActiveFilter && (
            <div className="flex items-center justify-between rounded-[10px] bg-[#FFD875]/10 px-[14px] py-[9px]">
              <span className="text-[13px] text-[#FFD875]">
                Đang lọc — hiển thị {filteredMovies.length} / {allMovies.length} phim trang này
              </span>
              <button
                onClick={() => { setSelectedGenre(""); setSelectedYear(0); setSearchQuery(""); setSortBy("newest"); }}
                className="text-[12px] text-[#888] underline hover:text-white"
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-[14px] bg-[#2a2d3e]" />
                <div className="mt-[10px] h-[14px] w-[80%] rounded bg-[#2a2d3e]" />
                <div className="mt-[6px] h-[12px] w-[60%] rounded bg-[#2a2d3e]" />
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[80px] text-center">
            <div className="mb-[16px] text-[60px]">🎭</div>
            <h3 className="mb-[8px] text-[20px] font-semibold text-white">Không tìm thấy phim</h3>
            <p className="text-[14px] text-[#666]">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
            <button
              onClick={() => { setSelectedGenre(""); setSelectedYear(0); setSearchQuery(""); }}
              className="mt-[20px] rounded-full bg-[#FFD875] px-[24px] py-[10px] text-[14px] font-semibold text-black hover:bg-[#FFD875]/90"
            >
              Xoá bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 sm:gap-[16px] md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredMovies.map((movie) => (
              <button
                key={movie._id}
                onClick={() => router.push(`/phim/${movie.slug}`)}
                className="group cursor-pointer text-left transition-transform active:scale-[0.97]"
              >
                <div className="movie-card-hover relative aspect-[2/3] overflow-hidden rounded-[14px] bg-[#2a2d3e] shadow-lg">
                  <Image
                    src={getImageUrl(movie.poster_url || movie.thumb_url)}
                    alt={movie.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    unoptimized
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-[6px] rounded-full bg-[#FFD875] px-[14px] py-[6px] text-[13px] font-semibold text-black shadow-lg">
                      ▶ Xem ngay
                    </span>
                  </div>

                  {/* Top badges */}
                  <div className="absolute left-[8px] top-[8px] flex flex-col gap-[4px]">
                    {movie.quality && (
                      <span className="rounded-[5px] bg-[#FFD875] px-[6px] py-[2px] text-[10px] font-bold text-black">
                        {movie.quality}
                      </span>
                    )}
                    <span className="rounded-[5px] bg-[rgba(255,80,80,0.85)] px-[6px] py-[2px] text-[10px] font-bold text-white">
                      📽 Rạp
                    </span>
                  </div>

                  {/* Rating badge */}
                  {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                    <div className="absolute right-[8px] top-[8px]">
                      <span className="rounded-[5px] bg-black/70 px-[6px] py-[2px] text-[10px] font-semibold text-[#FFD875]">
                        ★ {movie.tmdb.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Episode label */}
                  {movie.episode_current && movie.episode_current !== "Full" && (
                    <div className="absolute bottom-[8px] right-[8px]">
                      <span className="rounded-[5px] bg-black/70 px-[6px] py-[2px] text-[10px] text-white">
                        {movie.episode_current}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-[10px]">
                  <h3 className="truncate text-[14px] font-medium text-white transition-colors group-hover:text-[#FFD875]">
                    {movie.name}
                  </h3>
                  <div className="mt-[4px] flex items-center gap-[8px]">
                    <span className="text-[12px] text-[#666]">{movie.year}</span>
                    {movie.type === "hoathinh" && (
                      <span className="rounded bg-purple-600/80 px-[5px] py-[1px] text-[10px] text-white">Hoạt hình</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-[48px] flex flex-col items-center gap-[16px]">
            <p className="text-[13px] text-[#666]">
              Trang {page} / {totalPages} — {totalItems.toLocaleString()} phim
            </p>
            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="rounded-full bg-white/8 px-[14px] py-[9px] text-[13px] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                «
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="rounded-full bg-white/8 px-[20px] py-[9px] text-[14px] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>

              <div className="flex items-center gap-[4px]">
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
                      className={`h-[38px] w-[38px] rounded-full text-[14px] font-medium transition-all ${
                        pageNum === page
                          ? "bg-[#FFD875] text-black shadow-[0_0_14px_rgba(255,216,117,0.4)]"
                          : "bg-white/8 text-white hover:bg-white/18"
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
                className="rounded-full bg-[#FFD875] px-[20px] py-[9px] text-[14px] font-semibold text-black transition hover:bg-[#FFD875]/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tiếp
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className="rounded-full bg-white/8 px-[14px] py-[9px] text-[13px] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
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
