"use client";
import { useEffect, useState, useCallback, memo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getLatestMovies, getMoviesByType, getMoviesByCountry, getThuyetMinhMovies, getImageUrl, OPhimMovie } from "@/lib/ophimApi";
import { usePreferences } from "@/lib/usePreferences";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay, faAngleRight, faFilm, faTv, faClapperboard,
  faStar, faGlobe, faMicrophone, faFire, faChevronLeft,
  faChevronRight, faCircle
} from "@fortawesome/free-solid-svg-icons";
import ContinueWatching from "@/component/ContinueWatching";

// Memoized MovieCard for performance
const MovieCard = memo(({ movie, onClick }: { movie: OPhimMovie; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="cursor-pointer group movie-card-premium neon-glow flex-shrink-0 w-[140px] sm:w-[160px]"
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
      {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
        <span className="absolute top-[6px] right-[6px] px-[5px] py-[2px] bg-black/70 text-[#FFD875] text-[9px] font-bold rounded flex items-center gap-[2px]">
          ⭐ {movie.tmdb.vote_average.toFixed(1)}
        </span>
      )}
    </div>
    <h3 className="mt-[8px] text-white text-[12px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
      {typeof movie.name === 'string' ? movie.name : ""}
    </h3>
    <p className="text-white/40 text-[10px] truncate">
      {typeof movie.origin_name === 'string' ? movie.origin_name : ""}
    </p>
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

// =============================================
// HERO CAROUSEL COMPONENT
// =============================================
function HeroCarousel({ movies }: { movies: OPhimMovie[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const heroMovies = movies.slice(0, 6);

  const goToSlide = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(idx);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroMovies.length);
  }, [currentSlide, heroMovies.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroMovies.length) % heroMovies.length);
  }, [currentSlide, heroMovies.length, goToSlide]);

  // Auto advance slides
  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [nextSlide]);

  // Pause on hover
  const pauseTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resumeTimer = () => { timerRef.current = setInterval(nextSlide, 6000); };

  if (heroMovies.length === 0) {
    return <div className="w-full h-[60vh] min-h-[400px] bg-gradient-to-br from-[#1a1c2e] to-[#0F111A] animate-pulse" />;
  }

  const current = heroMovies[currentSlide];

  return (
    <div
      className="relative h-[65vh] min-h-[420px] max-h-[700px] overflow-hidden"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      {/* Background Images — all preloaded, only current visible */}
      {heroMovies.map((movie, idx) => (
        <div
          key={movie._id}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={getImageUrl(movie.poster_url || movie.thumb_url)}
            alt={movie.name}
            fill
            className="object-cover"
            priority={idx === 0}
            sizes="100vw"
            unoptimized
          />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F111A] via-[#0F111A]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-[#0F111A]/30" />

      {/* Slide Content */}
      <div className="absolute bottom-[60px] left-0 right-0 px-[16px] z-10">
        <div className="container max-w-[1400px] mx-auto">
          <div className="max-w-[550px]">
            {/* Badges */}
            <div className={`flex items-center gap-[8px] mb-[12px] transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-[10px]' : 'opacity-100 translate-y-0'}`}>
              {current.quality && (
                <span className="px-[10px] py-[4px] bg-[#FFD875] text-black text-[11px] font-semibold rounded-full">
                  {current.quality}
                </span>
              )}
              <span className="px-[10px] py-[4px] bg-white/10 text-white text-[11px] rounded-full backdrop-blur-sm">
                {String(current.year || "")}
              </span>
              {current.tmdb?.vote_average && current.tmdb.vote_average > 0 && (
                <span className="px-[10px] py-[4px] bg-[#FFD875]/20 text-[#FFD875] text-[11px] font-semibold rounded-full backdrop-blur-sm">
                  ⭐ {current.tmdb.vote_average.toFixed(1)}
                </span>
              )}
              {current.lang && (
                <span className="px-[10px] py-[4px] bg-white/10 text-white text-[11px] rounded-full backdrop-blur-sm">
                  {current.lang}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-[28px] lg:text-[40px] font-bold text-white mb-[6px] leading-tight transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-[15px]' : 'opacity-100 translate-y-0'}`}
              style={{ transitionDelay: '0.05s' }}
            >
              {String(current.name || "")}
            </h1>

            {/* Origin name */}
            <p className={`text-[14px] lg:text-[16px] text-[#FFD875] mb-[20px] transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-[15px]' : 'opacity-100 translate-y-0'}`}
              style={{ transitionDelay: '0.1s' }}
            >
              {String(current.origin_name || "")}
            </p>

            {/* CTA Buttons */}
            <div className={`flex items-center gap-[12px] transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-[15px]' : 'opacity-100 translate-y-0'}`}
              style={{ transitionDelay: '0.15s' }}
            >
              <button
                onClick={() => router.push(`/phim/${current.slug}`)}
                className="flex items-center gap-[8px] px-[28px] py-[14px] bg-gradient-to-r from-[#FFD875] to-[#f0a500] text-black font-semibold rounded-full hover:shadow-lg hover:shadow-[#FFD875]/30 transition-all text-[14px] hover:scale-105 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlay} className="text-[12px]" />
                Xem Ngay
              </button>
              <button
                onClick={() => router.push(`/phim/${current.slug}`)}
                className="flex items-center gap-[8px] px-[24px] py-[14px] bg-white/10 text-white rounded-full hover:bg-white/20 transition-all text-[14px] backdrop-blur-sm border border-white/10"
              >
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[44px] h-[44px] rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-10 flex items-center justify-center backdrop-blur-sm opacity-0 hover:opacity-100 group-hover:opacity-100 sm:opacity-60"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-[14px]" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[44px] h-[44px] rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-10 flex items-center justify-center backdrop-blur-sm opacity-0 hover:opacity-100 group-hover:opacity-100 sm:opacity-60"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-[14px]" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 flex items-center gap-[8px] z-10">
        {heroMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full ${idx === currentSlide
              ? 'w-[24px] h-[8px] bg-[#FFD875]'
              : 'w-[8px] h-[8px] bg-white/30 hover:bg-white/50'
              }`}
          />
        ))}
      </div>

      {/* Progress bar for current slide */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-10">
        <div
          className="h-full bg-[#FFD875] transition-all"
          style={{
            width: `${((currentSlide + 1) / heroMovies.length) * 100}%`,
            transition: 'width 0.5s ease'
          }}
        />
      </div>
    </div>
  );
}

// =============================================
// TRENDING SECTION COMPONENT
// =============================================
const TrendingSection = memo(({ movies }: { movies: OPhimMovie[] }) => {
  const router = useRouter();

  // Sort by TMDB rating for "trending" effect
  const trendingMovies = [...movies]
    .filter(m => m.tmdb?.vote_average && m.tmdb.vote_average > 0)
    .sort((a, b) => (b.tmdb?.vote_average || 0) - (a.tmdb?.vote_average || 0))
    .slice(0, 10);

  if (trendingMovies.length === 0) return null;

  return (
    <div className="mb-[40px]">
      <div className="flex items-center gap-[10px] mb-[16px]">
        <div className="w-[36px] h-[36px] rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#ee5a24] flex items-center justify-center">
          <FontAwesomeIcon icon={faFire} className="text-white text-[14px]" />
        </div>
        <h2 className="text-[18px] font-bold text-white">Trending 🔥</h2>
        <span className="px-[8px] py-[2px] bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Hot</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[12px]">
        {trendingMovies.map((movie, index) => (
          <div
            key={movie._id}
            onClick={() => router.push(`/phim/${movie.slug}`)}
            className="flex items-center gap-[12px] p-[12px] rounded-[12px] bg-white/5 hover:bg-white/10 cursor-pointer transition-all group"
          >
            {/* Rank Number */}
            <span className={`text-[28px] font-black min-w-[36px] text-center ${index < 3
              ? 'bg-gradient-to-b from-[#FFD875] to-[#f0a500] bg-clip-text text-transparent'
              : 'text-white/20'
              }`}>
              {index + 1}
            </span>

            {/* Poster */}
            <div className="w-[45px] h-[65px] rounded-[8px] overflow-hidden flex-shrink-0 relative bg-[#2a2d3e]">
              <Image
                src={getImageUrl(movie.poster_url || movie.thumb_url)}
                alt={movie.name}
                fill
                className="object-cover"
                sizes="45px"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-[13px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
                {String(movie.name || "")}
              </h4>
              <p className="text-white/40 text-[11px] truncate">{String(movie.origin_name || "")}</p>
              <div className="flex items-center gap-[6px] mt-[4px]">
                <span className="text-[#FFD875] text-[11px] font-semibold">
                  ⭐ {movie.tmdb?.vote_average?.toFixed(1)}
                </span>
                <span className="text-white/30 text-[10px]">•</span>
                <span className="text-white/40 text-[10px]">{String(movie.year || "")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
TrendingSection.displayName = 'TrendingSection';


// =============================================
// MAIN PAGE
// =============================================
export default function PhimHay() {
  const [heroMovies, setHeroMovies] = useState<OPhimMovie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<OPhimMovie[]>([]);
  const router = useRouter();
  const { preferences } = usePreferences();
  const { hiddenSections } = preferences;

  // Load hero movies for carousel
  useEffect(() => {
    getLatestMovies(1).then(data => {
      setHeroMovies(data.items.slice(0, 8));
    });
  }, []);

  // Load trending from multiple pages for variety
  useEffect(() => {
    Promise.all([
      getLatestMovies(1),
      getLatestMovies(2),
    ]).then(([p1, p2]) => {
      const all = [...p1.items, ...p2.items];
      setTrendingMovies(all);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0F111A]">
      {/* Hero Carousel */}
      <HeroCarousel movies={heroMovies} />

      {/* Content Sections */}
      <div className="container max-w-[1400px] mx-auto px-[16px] py-[30px]">

        {/* Continue Watching — shows only if user has history */}
        <ContinueWatching />

        {/* Trending Section */}
        <TrendingSection movies={trendingMovies} />

        {!hiddenSections.includes("phim-moi") && (
          <MovieSection
            title="Phim Mới"
            icon={faStar}
            fetchFn={async () => (await getLatestMovies(1)).items.slice(0, 12)}
            viewAllPath="/phim-moi"
            gradient="bg-gradient-to-br from-[var(--accent-color)] to-[#f0a500]"
          />
        )}

        {!hiddenSections.includes("phim-le") && (
          <MovieSection
            title="Phim Lẻ"
            icon={faFilm}
            fetchFn={async () => (await getMoviesByType("phim-le", 1)).items.slice(0, 12)}
            viewAllPath="/phim-le"
            gradient="bg-gradient-to-br from-[#e74c3c] to-[#c0392b]"
          />
        )}

        {!hiddenSections.includes("phim-bo") && (
          <MovieSection
            title="Phim Bộ"
            icon={faTv}
            fetchFn={async () => (await getMoviesByType("phim-bo", 1)).items.slice(0, 12)}
            viewAllPath="/phim-bo"
            gradient="bg-gradient-to-br from-[#3498db] to-[#2980b9]"
          />
        )}

        {!hiddenSections.includes("anime") && (
          <MovieSection
            title="Anime"
            icon={faClapperboard}
            fetchFn={async () => (await getMoviesByType("hoat-hinh", 1)).items.slice(0, 12)}
            viewAllPath="/anime"
            gradient="bg-gradient-to-br from-[#9b59b6] to-[#8e44ad]"
          />
        )}

        {!hiddenSections.includes("thuyet-minh") && (
          <MovieSection
            title="Phim Thuyết Minh"
            icon={faMicrophone}
            fetchFn={async () => (await getThuyetMinhMovies(1)).items.slice(0, 12)}
            viewAllPath="/thuyet-minh"
            gradient="bg-gradient-to-br from-[#e67e22] to-[#d35400]"
          />
        )}

        {/* Country Sections */}
        <MovieSection
          title="Phim Hàn Quốc"
          icon={faGlobe}
          fetchFn={async () => (await getMoviesByCountry("han-quoc", 1)).items.slice(0, 12)}
          viewAllPath="/quoc-gia/han-quoc"
          gradient="bg-gradient-to-br from-[#FF6B9D] to-[#C44569]"
        />

        <MovieSection
          title="Phim Trung Quốc"
          icon={faGlobe}
          fetchFn={async () => (await getMoviesByCountry("trung-quoc", 1)).items.slice(0, 12)}
          viewAllPath="/quoc-gia/trung-quoc"
          gradient="bg-gradient-to-br from-[#e74c3c] to-[#c0392b]"
        />

        <MovieSection
          title="Phim Âu Mỹ"
          icon={faGlobe}
          fetchFn={async () => (await getMoviesByCountry("au-my", 1)).items.slice(0, 12)}
          viewAllPath="/quoc-gia/au-my"
          gradient="bg-gradient-to-br from-[#4DA6FF] to-[#2980b9]"
        />
      </div>
    </div>
  );
}
