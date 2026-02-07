"use client";
import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getLatestMovies, getMoviesByType, getImageUrl, OPhimMovie } from "@/lib/ophimApi";
import { usePreferences } from "@/lib/usePreferences";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faAngleRight, faFilm, faTv, faClapperboard, faStar } from "@fortawesome/free-solid-svg-icons";

// Memoized MovieCard for performance
const MovieCard = memo(({ movie, onClick }: { movie: OPhimMovie; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="cursor-pointer group movie-card-hover flex-shrink-0 w-[140px] sm:w-[160px]"
  >
    <div className="relative aspect-[2/3] rounded-[12px] overflow-hidden bg-[#2a2d3e]">
      <Image
        src={getImageUrl(movie.poster_url || movie.thumb_url)}
        alt={typeof movie.name === 'string' ? movie.name : "Movie"}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 140px, 160px"
        loading="lazy"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-[16px]">
        <div className="w-[36px] h-[36px] rounded-full bg-[#FFD875] flex items-center justify-center">
          <FontAwesomeIcon icon={faPlay} className="text-black text-[12px] ml-[2px]" />
        </div>
      </div>
      {typeof movie.quality === 'string' && movie.quality && (
        <span className="absolute top-[6px] left-[6px] px-[5px] py-[2px] bg-[#FFD875] text-black text-[9px] font-semibold rounded">
          {movie.quality}
        </span>
      )}
    </div>
    <h3 className="mt-[8px] text-white text-[12px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
      {typeof movie.name === 'string' ? movie.name : ""}
    </h3>
  </div>
));
MovieCard.displayName = 'MovieCard';

// Skeleton for fast initial render
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[140px] sm:w-[160px]">
    <div className="aspect-[2/3] rounded-[12px] bg-[#2a2d3e] animate-pulse" />
    <div className="mt-[8px] h-[14px] bg-[#2a2d3e] rounded animate-pulse w-3/4" />
  </div>
);

// Individual section that loads independently
const MovieSection = memo(({
  title,
  icon,
  fetchFn,
  viewAllPath,
  gradient
}: {
  title: string;
  icon: any;
  fetchFn: () => Promise<OPhimMovie[]>;
  viewAllPath: string;
  gradient: string;
}) => {
  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFn().then(data => {
      setMovies(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [fetchFn]);

  return (
    <div className="mb-[40px]">
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[10px]">
          <div className={`w-[36px] h-[36px] rounded-lg ${gradient} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className="text-white text-[14px]" />
          </div>
          <h2 className="text-[18px] font-bold text-white">{title}</h2>
        </div>
        <button
          onClick={() => router.push(viewAllPath)}
          className="flex items-center gap-[4px] text-[12px] text-white/60 hover:text-[#FFD875] transition-colors"
        >
          Xem tất cả
          <FontAwesomeIcon icon={faAngleRight} className="text-[10px]" />
        </button>
      </div>
      <div className="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-hide">
        {loading ? (
          [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onClick={() => router.push(`/phim/${movie.slug}`)}
            />
          ))
        )}
      </div>
    </div>
  );
});
MovieSection.displayName = 'MovieSection';

export default function PhimHay() {
  const [heroMovie, setHeroMovie] = useState<OPhimMovie | null>(null);
  const router = useRouter();
  const { preferences } = usePreferences();
  const { hiddenSections } = preferences;

  // Load hero first - instant display
  useEffect(() => {
    getLatestMovies(1).then(data => {
      if (data.items[0]) setHeroMovie(data.items[0]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0F111A]">
      {/* Hero Section - Show immediately with skeleton */}
      <div className="relative h-[60vh] min-h-[400px]">
        {heroMovie ? (
          <>
            <Image
              src={getImageUrl(heroMovie.poster_url || heroMovie.thumb_url)}
              alt={heroMovie.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F111A] via-[#0F111A]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-transparent" />

            <div className="absolute bottom-[60px] left-0 right-0 px-[16px]">
              <div className="container max-w-[1400px] mx-auto">
                <div className="max-w-[500px]">
                  <div className="flex items-center gap-[8px] mb-[10px]">
                    {heroMovie.quality && (
                      <span className="px-[8px] py-[3px] bg-[#FFD875] text-black text-[11px] font-semibold rounded-full">
                        {heroMovie.quality}
                      </span>
                    )}
                    <span className="px-[8px] py-[3px] bg-white/10 text-white text-[11px] rounded-full">
                      {String(heroMovie.year || "")}
                    </span>
                  </div>
                  <h1 className="text-[28px] lg:text-[36px] font-bold text-white mb-[6px] leading-tight">
                    {String(heroMovie.name || "")}
                  </h1>
                  <p className="text-[14px] text-[#FFD875] mb-[16px]">
                    {String(heroMovie.origin_name || "")}
                  </p>
                  <button
                    onClick={() => router.push(`/phim/${heroMovie.slug}`)}
                    className="flex items-center gap-[8px] px-[24px] py-[12px] bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold rounded-full hover:shadow-lg hover:shadow-[#FFD875]/30 transition-all text-[14px]"
                  >
                    <FontAwesomeIcon icon={faPlay} className="text-[12px]" />
                    Xem Ngay
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1c2e] to-[#0F111A] animate-pulse" />
        )}
      </div>

      {/* Content - Loads independently */}
      <div className="container max-w-[1400px] mx-auto px-[16px] py-[30px]">
        {!hiddenSections.includes("phim-moi") && (
          <MovieSection
            title="Phim Mới"
            icon={faStar}
            fetchFn={async () => (await getLatestMovies(1)).items.slice(0, 8)}
            viewAllPath="/phim-moi"
            gradient="bg-gradient-to-br from-[var(--accent-color)] to-[#f0a500]"
          />
        )}

        {!hiddenSections.includes("phim-le") && (
          <MovieSection
            title="Phim Lẻ"
            icon={faFilm}
            fetchFn={async () => (await getMoviesByType("phim-le", 1)).items.slice(0, 8)}
            viewAllPath="/phim-le"
            gradient="bg-gradient-to-br from-[#e74c3c] to-[#c0392b]"
          />
        )}

        {!hiddenSections.includes("phim-bo") && (
          <MovieSection
            title="Phim Bộ"
            icon={faTv}
            fetchFn={async () => (await getMoviesByType("phim-bo", 1)).items.slice(0, 8)}
            viewAllPath="/phim-bo"
            gradient="bg-gradient-to-br from-[#3498db] to-[#2980b9]"
          />
        )}

        {!hiddenSections.includes("anime") && (
          <MovieSection
            title="Anime"
            icon={faClapperboard}
            fetchFn={async () => (await getMoviesByType("hoat-hinh", 1)).items.slice(0, 8)}
            viewAllPath="/anime"
            gradient="bg-gradient-to-br from-[#9b59b6] to-[#8e44ad]"
          />
        )}
      </div>
    </div>
  );
}
