"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl, OPhimMovie, OPhimResponse } from "@/lib/ophimApi";
import { getProxiedImageUrl } from "@/lib/imageProxy";
import { isThuyetMinhMovie } from "@/lib/movieClassification";
import { prefetchMoviePage } from "@/lib/ophimApi";

interface MovieGridProps {
  fetchFunction: (page: number) => Promise<OPhimResponse>;
  title?: string;
  showFilters?: boolean;
  infiniteScroll?: boolean;
}

export default function MovieGrid({ fetchFunction, infiniteScroll = false }: MovieGridProps) {
  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  const fetchFnRef = useRef(fetchFunction);
  fetchFnRef.current = fetchFunction;

  // Initial fetch
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        if (infiniteScroll && page > 1) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          if (!infiniteScroll) window.scrollTo({ top: 0, behavior: "smooth" });
        }

        const data = await fetchFnRef.current(page);
        
        if (infiniteScroll && page > 1) {
          setMovies(prev => {
            const existingSlugs = new Set(prev.map(m => m.slug));
            const newMovies = data.items.filter(m => !existingSlugs.has(m.slug));
            return [...prev, ...newMovies];
          });
        } else {
          setMovies(data.items);
        }
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    };

    fetchMovies();
  }, [page, infiniteScroll]);

  // Infinite scroll observer
  useEffect(() => {
    if (!infiniteScroll || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingRef.current && page < totalPages) {
          fetchingRef.current = true;
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [infiniteScroll, page, totalPages]);

  // Prefetch next page on hover near bottom
  const handlePrefetch = useCallback(() => {
    if (page < totalPages) {
      try { prefetchMoviePage(page + 1); } catch {}
    }
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="tv-movie-grid stagger-children grid grid-cols-2 gap-[16px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 18 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[2/3] rounded-[12px] bg-[#2a2d3e] skeleton-shimmer" 
                 style={{ background: 'linear-gradient(90deg, #2a2d3e 25%, #3a3d4e 50%, #2a2d3e 75%)' }} />
            <div className="mt-[10px] h-[14px] w-[80%] rounded bg-[#2a2d3e]" />
            <div className="mt-[6px] h-[12px] w-[60%] rounded bg-[#2a2d3e]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="tv-movie-grid stagger-children grid grid-cols-2 gap-[12px] sm:grid-cols-3 sm:gap-[16px] md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie, index) => (
          <button
            key={`${movie._id}-${index}`}
            onClick={() => router.push(`/phim/${movie.slug}`)}
            onMouseEnter={() => {
              router.prefetch(`/phim/${movie.slug}`);
              // Prefetch next page when hovering late items
              if (index > movies.length - 6) handlePrefetch();
            }}
            className="group cursor-pointer text-left transition-transform active:scale-[0.98]"
          >
            <div className="movie-card-premium touch-feedback relative aspect-[2/3] overflow-hidden rounded-[12px] bg-[#2a2d3e] shadow-lg">
              <Image
                src={getProxiedImageUrl(getImageUrl(movie.poster_url || movie.thumb_url))}
                alt={movie.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 2200px) 11vw, (min-width: 1600px) 13vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                unoptimized
                priority={index < 6}
                loading={index < 6 ? "eager" : "lazy"}
              />

              <div className="card-overlay absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-[12px]">
                <span className="text-[13px] font-medium text-white">Xem ngay</span>
              </div>

              <div className="absolute left-[8px] top-[8px] flex flex-col gap-[4px]">
                {movie.quality && (
                  <span className="rounded bg-[#FFD875] px-[6px] py-[2px] text-[10px] font-semibold text-black">
                    {movie.quality}
                  </span>
                )}
                {isThuyetMinhMovie(movie) && (
                  <span className="flex items-center gap-[2px] rounded bg-gradient-to-r from-[#e67e22] to-[#d35400] px-[6px] py-[2px] text-[10px] font-semibold text-white">
                    TM
                  </span>
                )}
              </div>

              {movie.episode_current && (
                <div className="absolute bottom-[8px] right-[8px]">
                  <span className="rounded bg-black/70 px-[6px] py-[2px] text-[10px] text-white">
                    {movie.episode_current}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-[10px]">
              <h3 className="truncate text-[14px] font-medium text-white transition-colors group-hover:text-[#FFD875]">
                {movie.name || ""}
              </h3>
              <div className="mt-[4px] flex items-center gap-[8px]">
                <span className="text-[12px] text-[#888]">{String(movie.year)}</span>
                {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                  <span className="text-[11px] text-[#FFD875]">★ {movie.tmdb.vote_average.toFixed(1)}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {infiniteScroll && page < totalPages && (
        <div ref={sentinelRef} className="infinite-scroll-sentinel">
          {loadingMore && (
            <div className="loading-more">
              <div className="loading-more-dots">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Traditional pagination (when not using infinite scroll) */}
      {!infiniteScroll && (
        <div className="tv-pagination mt-[40px] flex items-center justify-center gap-[8px]">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-full bg-[#ffffff15] px-[20px] py-[10px] text-[14px] text-white transition-colors hover:bg-[#ffffff25] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Trước
          </button>

          <div className="flex items-center gap-[4px]">
            {page > 2 && (
              <>
                <button onClick={() => setPage(1)} className="h-[36px] w-[36px] rounded-full bg-[#ffffff10] text-[13px] text-white hover:bg-[#ffffff20]">
                  1
                </button>
                {page > 3 && <span className="px-[4px] text-[#888]">...</span>}
              </>
            )}

            {page > 1 && (
              <button onClick={() => setPage(page - 1)} className="h-[36px] w-[36px] rounded-full bg-[#ffffff10] text-[13px] text-white hover:bg-[#ffffff20]">
                {page - 1}
              </button>
            )}

            <button className="h-[36px] w-[36px] rounded-full bg-[#FFD875] text-[13px] font-semibold text-black">
              {page}
            </button>

            {page < totalPages && (
              <button onClick={() => setPage(page + 1)} className="h-[36px] w-[36px] rounded-full bg-[#ffffff10] text-[13px] text-white hover:bg-[#ffffff20]">
                {page + 1}
              </button>
            )}

            {page < totalPages - 1 && (
              <>
                {page < totalPages - 2 && <span className="px-[4px] text-[#888]">...</span>}
                <button onClick={() => setPage(totalPages)} className="h-[36px] w-[36px] rounded-full bg-[#ffffff10] text-[13px] text-white hover:bg-[#ffffff20]">
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded-full bg-[#FFD875] px-[20px] py-[10px] text-[14px] font-semibold text-black transition-colors hover:bg-[#FFD875]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
}
