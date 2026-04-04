"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl, OPhimMovie, OPhimResponse } from "@/lib/ophimApi";

interface MovieGridProps {
  fetchFunction: (page: number) => Promise<OPhimResponse>;
  title?: string;
  showFilters?: boolean;
}

export default function MovieGrid({ fetchFunction }: MovieGridProps) {
  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const data = await fetchFunction(page);
        setMovies(data.items);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, fetchFunction]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 18 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[2/3] rounded-[12px] bg-[#2a2d3e]" />
            <div className="mt-[10px] h-[14px] w-[80%] rounded bg-[#2a2d3e]" />
            <div className="mt-[6px] h-[12px] w-[60%] rounded bg-[#2a2d3e]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 sm:gap-[16px] md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <button
            key={movie._id}
            onClick={() => router.push(`/phim/${movie.slug}`)}
            className="group cursor-pointer text-left transition-transform active:scale-[0.98]"
          >
            <div className="movie-card-hover touch-feedback relative aspect-[2/3] overflow-hidden rounded-[12px] bg-[#2a2d3e] shadow-lg">
              <Image
                src={getImageUrl(movie.poster_url || movie.thumb_url)}
                alt={movie.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                unoptimized
              />

              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-[12px] opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-[13px] font-medium text-white">Xem ngay</span>
              </div>

              <div className="absolute left-[8px] top-[8px] flex flex-col gap-[4px]">
                {movie.quality && (
                  <span className="rounded bg-[#FFD875] px-[6px] py-[2px] text-[10px] font-semibold text-black">
                    {movie.quality}
                  </span>
                )}
                {typeof movie.lang === "string" && movie.lang.toLowerCase().includes("thuyết minh") && (
                  <span className="flex items-center gap-[2px] rounded bg-gradient-to-r from-[#e67e22] to-[#d35400] px-[6px] py-[2px] text-[10px] font-semibold text-white">
                    🎙️ TM
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

      <div className="mt-[40px] flex items-center justify-center gap-[8px]">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          className="rounded-full bg-[#ffffff15] px-[20px] py-[10px] text-[14px] text-white transition-colors hover:bg-[#ffffff25] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trước
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
          Tiếp
        </button>
      </div>
    </div>
  );
}
