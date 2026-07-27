"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getTrendingAll, getTMDBImageUrl, TMDBMovie } from "@/lib/tmdbApi";

export default function TrendingSection() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('day');
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    getTrendingAll(timeWindow)
      .then((data) => setMovies(data.results?.slice(0, 10) || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [timeWindow]);

  if (!loading && movies.length === 0) return null;

  return (
    <section className="mb-[40px] px-4">
      <div className="flex items-center justify-between mb-[20px]">
        <h2 className="text-white text-[20px] font-bold">🔥 Trending</h2>
        <div className="flex bg-[#1E2030] rounded-full p-1">
          <button 
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${timeWindow === 'day' ? 'bg-[#FFD875] text-black' : 'text-white'}`}
            onClick={() => setTimeWindow('day')}
          >
            Hôm nay
          </button>
          <button 
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${timeWindow === 'week' ? 'bg-[#FFD875] text-black' : 'text-white'}`}
            onClick={() => setTimeWindow('week')}
          >
            Tuần này
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 stagger-children snap-x">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] bg-[#2a2d3e] rounded-xl animate-pulse flex-shrink-0 snap-start" />
            ))
          ) : (
            movies.map((movie, index) => {
              const slug = (movie.title || movie.name || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              return (
                <div 
                  key={movie.id}
                  className="movie-card-premium relative min-w-[150px] md:min-w-[200px] cursor-pointer flex-shrink-0 snap-start group"
                  onClick={() => router.push(`/phim/${slug}`)}
                >
                  <span className="trending-number absolute -left-4 bottom-4 text-[100px] font-black text-transparent opacity-80 z-0 pointer-events-none stroke-white" style={{ WebkitTextStroke: '2px #444', color: 'transparent' }}>
                    {index + 1}
                  </span>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#2a2d3e] shadow-lg z-10 ml-6">
                    <Image
                      src={getTMDBImageUrl(movie.poster_path || '', 'w342')}
                      alt={movie.title || movie.name || 'Movie poster'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 150px, 200px"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-bold text-[#FFD875]">
                      ★ {movie.vote_average?.toFixed(1)}
                    </div>
                  </div>
                  <h3 className="text-white text-sm font-medium mt-2 truncate pl-6 group-hover:text-[#FFD875] transition-colors">
                    {movie.title || movie.name}
                  </h3>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
