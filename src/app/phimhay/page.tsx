"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getImageUrl,
  getLatestMovies,
  getMoviesByCountry,
  getMoviesByType,
  getThuyetMinhMovies,
  OPhimMovie,
} from "@/lib/ophimApi";
import { usePreferences } from "@/lib/usePreferences";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faChevronLeft,
  faChevronRight,
  faClapperboard,
  faFilm,
  faFire,
  faGlobe,
  faMicrophone,
  faPlay,
  faStar,
  faTv,
} from "@fortawesome/free-solid-svg-icons";
import ContinueWatching from "@/component/ContinueWatching";

const MovieCard = memo(({ movie, onClick }: { movie: OPhimMovie; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="movie-card-premium neon-glow group w-[140px] flex-shrink-0 cursor-pointer text-left sm:w-[160px]"
  >
    <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] bg-[#2a2d3e]">
      <Image
        src={getImageUrl(movie.poster_url || movie.thumb_url)}
        alt={typeof movie.name === "string" ? movie.name : "Movie"}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 140px, 160px"
        loading="lazy"
        unoptimized
      />
      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent pb-[16px] opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#FFD875]">
          <FontAwesomeIcon icon={faPlay} className="ml-[2px] text-[12px] text-black" />
        </div>
      </div>
      {movie.quality && (
        <span className="absolute left-[6px] top-[6px] rounded bg-[#FFD875] px-[5px] py-[2px] text-[9px] font-semibold text-black">
          {movie.quality}
        </span>
      )}
      {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
        <span className="absolute right-[6px] top-[6px] flex items-center gap-[2px] rounded bg-black/70 px-[5px] py-[2px] text-[9px] font-bold text-[#FFD875]">
          ★ {movie.tmdb.vote_average.toFixed(1)}
        </span>
      )}
    </div>
    <h3 className="mt-[8px] truncate text-[12px] font-medium text-white transition-colors group-hover:text-[#FFD875]">
      {typeof movie.name === "string" ? movie.name : ""}
    </h3>
    <p className="truncate text-[10px] text-white/40">{typeof movie.origin_name === "string" ? movie.origin_name : ""}</p>
  </button>
));
MovieCard.displayName = "MovieCard";

const SkeletonCard = () => (
  <div className="w-[140px] flex-shrink-0 sm:w-[160px]">
    <div className="aspect-[2/3] rounded-[12px] bg-[#2a2d3e] animate-pulse" />
    <div className="mt-[8px] h-[14px] w-3/4 rounded bg-[#2a2d3e] animate-pulse" />
  </div>
);

const MovieSection = memo(
  ({
    title,
    icon,
    fetchFn,
    viewAllPath,
    gradient,
    lazy = true,
  }: {
    title: string;
    icon: typeof faStar;
    fetchFn: () => Promise<OPhimMovie[]>;
    viewAllPath: string;
    gradient: string;
    lazy?: boolean;
  }) => {
    const [movies, setMovies] = useState<OPhimMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [shouldLoad, setShouldLoad] = useState(!lazy);
    const fetchFnRef = useRef(fetchFn);
    const hasFetchedRef = useRef(false);
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useEffect(() => {
      fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    useEffect(() => {
      if (shouldLoad || !lazy) return;
      if (!sectionRef.current || typeof IntersectionObserver === "undefined") {
        setShouldLoad(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setShouldLoad(true);
          observer.disconnect();
        },
        { rootMargin: "300px 0px" }
      );

      observer.observe(sectionRef.current);
      return () => observer.disconnect();
    }, [lazy, shouldLoad]);

    useEffect(() => {
      if (!shouldLoad || hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      fetchFnRef.current()
        .then((data) => setMovies(data))
        .catch(() => setMovies([]))
        .finally(() => setLoading(false));
    }, [shouldLoad]);

    return (
      <section ref={sectionRef} className="mb-[40px]">
        <div className="mb-[16px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <div className={`flex h-[36px] w-[36px] items-center justify-center rounded-lg ${gradient}`}>
              <FontAwesomeIcon icon={icon} className="text-[14px] text-white" />
            </div>
            <h2 className="text-[18px] font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={() => router.push(viewAllPath)}
            className="flex items-center gap-[4px] text-[12px] text-white/60 transition-colors hover:text-[#FFD875]"
          >
            Xem tất cả
            <FontAwesomeIcon icon={faAngleRight} className="text-[10px]" />
          </button>
        </div>

        <div className="scrollbar-hide flex gap-[12px] overflow-x-auto pb-[8px]">
          {loading
            ? [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
            : movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} onClick={() => router.push(`/phim/${movie.slug}`)} />
              ))}
        </div>
      </section>
    );
  }
);
MovieSection.displayName = "MovieSection";

function HeroCarousel({ movies }: { movies: OPhimMovie[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const heroMovies = movies.slice(0, 6);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || heroMovies.length === 0) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [heroMovies.length, isTransitioning]
  );

  const nextSlide = useCallback(() => {
    if (heroMovies.length === 0) return;
    goToSlide((currentSlide + 1) % heroMovies.length);
  }, [currentSlide, goToSlide, heroMovies.length]);

  const prevSlide = useCallback(() => {
    if (heroMovies.length === 0) return;
    goToSlide((currentSlide - 1 + heroMovies.length) % heroMovies.length);
  }, [currentSlide, goToSlide, heroMovies.length]);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    timerRef.current = setInterval(nextSlide, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [heroMovies.length, nextSlide]);

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeTimer = () => {
    if (heroMovies.length === 0) return;
    timerRef.current = setInterval(nextSlide, 6000);
  };

  if (heroMovies.length === 0) {
    return <div className="h-[60vh] min-h-[400px] w-full animate-pulse bg-gradient-to-br from-[#1a1c2e] to-[#0F111A]" />;
  }

  const current = heroMovies[currentSlide];

  return (
    <div className="relative h-[65vh] min-h-[420px] max-h-[700px] overflow-hidden" onMouseEnter={pauseTimer} onMouseLeave={resumeTimer}>
      {heroMovies.map((movie, index) => (
        <div
          key={movie._id}
          className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={getImageUrl(movie.poster_url || movie.thumb_url)}
            alt={movie.name}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
            unoptimized
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-[#0F111A] via-[#0F111A]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-[#0F111A]/30" />

      <div className="absolute bottom-[60px] left-0 right-0 z-10 px-[16px]">
        <div className="container mx-auto max-w-[1400px]">
          <div className="max-w-[550px]">
            <div className={`mb-[12px] flex items-center gap-[8px] transition-all duration-500 ${isTransitioning ? "translate-y-[10px] opacity-0" : "translate-y-0 opacity-100"}`}>
              {current.quality && (
                <span className="rounded-full bg-[#FFD875] px-[10px] py-[4px] text-[11px] font-semibold text-black">
                  {current.quality}
                </span>
              )}
              <span className="rounded-full bg-white/10 px-[10px] py-[4px] text-[11px] text-white backdrop-blur-sm">
                {String(current.year || "")}
              </span>
              {current.tmdb?.vote_average && current.tmdb.vote_average > 0 && (
                <span className="rounded-full bg-[#FFD875]/20 px-[10px] py-[4px] text-[11px] font-semibold text-[#FFD875] backdrop-blur-sm">
                  ★ {current.tmdb.vote_average.toFixed(1)}
                </span>
              )}
              {current.lang && (
                <span className="rounded-full bg-white/10 px-[10px] py-[4px] text-[11px] text-white backdrop-blur-sm">
                  {current.lang}
                </span>
              )}
            </div>

            <h1
              className={`mb-[6px] text-[28px] font-bold leading-tight text-white transition-all duration-500 lg:text-[40px] ${isTransitioning ? "translate-y-[15px] opacity-0" : "translate-y-0 opacity-100"}`}
              style={{ transitionDelay: "0.05s" }}
            >
              {String(current.name || "")}
            </h1>

            <p
              className={`mb-[20px] text-[14px] text-[#FFD875] transition-all duration-500 lg:text-[16px] ${isTransitioning ? "translate-y-[15px] opacity-0" : "translate-y-0 opacity-100"}`}
              style={{ transitionDelay: "0.1s" }}
            >
              {String(current.origin_name || "")}
            </p>

            <div
              className={`flex items-center gap-[12px] transition-all duration-500 ${isTransitioning ? "translate-y-[15px] opacity-0" : "translate-y-0 opacity-100"}`}
              style={{ transitionDelay: "0.15s" }}
            >
              <button
                onClick={() => router.push(`/phim/${current.slug}`)}
                className="flex items-center gap-[8px] rounded-full bg-gradient-to-r from-[#FFD875] to-[#f0a500] px-[28px] py-[14px] text-[14px] font-semibold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FFD875]/30 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlay} className="text-[12px]" />
                Xem ngay
              </button>
              <button
                onClick={() => router.push(`/phim/${current.slug}`)}
                className="flex items-center gap-[8px] rounded-full border border-white/10 bg-white/10 px-[24px] py-[14px] text-[14px] text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-[16px] top-1/2 z-10 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-all hover:bg-black/60 hover:opacity-100 sm:opacity-60"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-[14px]" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-[16px] top-1/2 z-10 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-all hover:bg-black/60 hover:opacity-100 sm:opacity-60"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-[14px]" />
      </button>

      <div className="absolute bottom-[20px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[8px]">
        {heroMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide ? "h-[8px] w-[24px] bg-[#FFD875]" : "h-[8px] w-[8px] bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-[3px] bg-white/10">
        <div
          className="h-full bg-[#FFD875] transition-all"
          style={{
            width: `${((currentSlide + 1) / heroMovies.length) * 100}%`,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

const TrendingSection = memo(({ movies }: { movies: OPhimMovie[] }) => {
  const router = useRouter();

  const trendingMovies = [...movies]
    .filter((movie) => movie.tmdb?.vote_average && movie.tmdb.vote_average > 0)
    .sort((a, b) => (b.tmdb?.vote_average || 0) - (a.tmdb?.vote_average || 0))
    .slice(0, 10);

  if (trendingMovies.length === 0) return null;

  return (
    <section className="mb-[40px]">
      <div className="mb-[16px] flex items-center gap-[10px]">
        <div className="flex h-[36px] w-[36px] items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#ee5a24]">
          <FontAwesomeIcon icon={faFire} className="text-[14px] text-white" />
        </div>
        <h2 className="text-[18px] font-bold text-white">Trending 🔥</h2>
        <span className="rounded-full bg-red-500/20 px-[8px] py-[2px] text-[10px] font-bold uppercase tracking-wider text-red-400">
          Hot
        </span>
      </div>

      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-5">
        {trendingMovies.map((movie, index) => (
          <button
            key={movie._id}
            onClick={() => router.push(`/phim/${movie.slug}`)}
            className="group flex items-center gap-[12px] rounded-[12px] bg-white/5 p-[12px] text-left transition-all hover:bg-white/10"
          >
            <span
              className={`min-w-[36px] text-center text-[28px] font-black ${
                index < 3 ? "bg-gradient-to-b from-[#FFD875] to-[#f0a500] bg-clip-text text-transparent" : "text-white/20"
              }`}
            >
              {index + 1}
            </span>

            <div className="relative h-[65px] w-[45px] flex-shrink-0 overflow-hidden rounded-[8px] bg-[#2a2d3e]">
              <Image
                src={getImageUrl(movie.poster_url || movie.thumb_url)}
                alt={movie.name}
                fill
                className="object-cover"
                sizes="45px"
                unoptimized
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-[13px] font-medium text-white transition-colors group-hover:text-[#FFD875]">
                {String(movie.name || "")}
              </h4>
              <p className="truncate text-[11px] text-white/40">{String(movie.origin_name || "")}</p>
              <div className="mt-[4px] flex items-center gap-[6px]">
                <span className="text-[11px] font-semibold text-[#FFD875]">★ {movie.tmdb?.vote_average?.toFixed(1)}</span>
                <span className="text-[10px] text-white/30">•</span>
                <span className="text-[10px] text-white/40">{String(movie.year || "")}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
});
TrendingSection.displayName = "TrendingSection";

export default function PhimHay() {
  const [heroMovies, setHeroMovies] = useState<OPhimMovie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<OPhimMovie[]>([]);
  const { preferences } = usePreferences();
  const { hiddenSections } = preferences;

  const fetchLatestSection = useCallback(async () => (await getLatestMovies(1)).items.slice(0, 12), []);
  const fetchPhimLeSection = useCallback(async () => (await getMoviesByType("phim-le", 1)).items.slice(0, 12), []);
  const fetchPhimBoSection = useCallback(async () => (await getMoviesByType("phim-bo", 1)).items.slice(0, 12), []);
  const fetchAnimeSection = useCallback(async () => (await getMoviesByType("hoat-hinh", 1)).items.slice(0, 12), []);
  const fetchThuyetMinhSection = useCallback(async () => (await getThuyetMinhMovies(1)).items.slice(0, 12), []);
  const fetchHanQuocSection = useCallback(async () => (await getMoviesByCountry("han-quoc", 1)).items.slice(0, 12), []);
  const fetchTrungQuocSection = useCallback(async () => (await getMoviesByCountry("trung-quoc", 1)).items.slice(0, 12), []);
  const fetchAuMySection = useCallback(async () => (await getMoviesByCountry("au-my", 1)).items.slice(0, 12), []);

  useEffect(() => {
    Promise.all([getLatestMovies(1), getLatestMovies(2)])
      .then(([pageOne, pageTwo]) => {
        setHeroMovies(pageOne.items.slice(0, 8));
        setTrendingMovies([...pageOne.items, ...pageTwo.items]);
      })
      .catch(() => {
        setHeroMovies([]);
        setTrendingMovies([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0F111A]">
      <HeroCarousel movies={heroMovies} />

      <div className="container mx-auto max-w-[1400px] px-[16px] py-[30px]">
        <section className="mb-[28px] grid gap-[14px] lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,216,117,0.1),rgba(255,255,255,0.03))] px-[20px] py-[22px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#FFD875]">Khám phá nhanh</p>
            <h2 className="mt-[8px] text-[28px] font-semibold text-white">
              Phim mới, xu hướng và các nhóm nội dung theo quốc gia.
            </h2>
            <p className="mt-[8px] max-w-[760px] text-[14px] leading-6 text-white/58">
              Trang này đã được dọn lại theo hướng ưu tiên nội dung: hero nổi bật ở trên, xu hướng ngay bên dưới, rồi tới các hàng phim theo từng nhóm dễ quét hơn trên cả điện thoại và desktop.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] px-[20px] py-[22px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/40">API trạng thái</p>
            <div className="mt-[12px] space-y-[10px] text-[14px] text-white/72">
              <p className="flex items-center justify-between gap-[16px]">
                <span>OPhim latest</span>
                <span className="text-[#7dffa6]">OK</span>
              </p>
              <p className="flex items-center justify-between gap-[16px]">
                <span>Nguồn C latest</span>
                <span className="text-[#7dffa6]">OK</span>
              </p>
              <p className="flex items-center justify-between gap-[16px]">
                <span>Chiếu rạp</span>
                <span className="text-[#FFD875]">Đã sửa endpoint</span>
              </p>
            </div>
          </div>
        </section>

        <ContinueWatching />
        <TrendingSection movies={trendingMovies} />

        {!hiddenSections.includes("phim-moi") && (
          <MovieSection
            title="Phim mới"
            icon={faStar}
            fetchFn={fetchLatestSection}
            viewAllPath="/phim-moi"
            gradient="bg-gradient-to-br from-[var(--accent-color)] to-[#f0a500]"
            lazy={false}
          />
        )}

        {!hiddenSections.includes("phim-le") && (
          <MovieSection
            title="Phim lẻ"
            icon={faFilm}
            fetchFn={fetchPhimLeSection}
            viewAllPath="/phim-le"
            gradient="bg-gradient-to-br from-[#e74c3c] to-[#c0392b]"
          />
        )}

        {!hiddenSections.includes("phim-bo") && (
          <MovieSection
            title="Phim bộ"
            icon={faTv}
            fetchFn={fetchPhimBoSection}
            viewAllPath="/phim-bo"
            gradient="bg-gradient-to-br from-[#3498db] to-[#2980b9]"
          />
        )}

        {!hiddenSections.includes("anime") && (
          <MovieSection
            title="Anime"
            icon={faClapperboard}
            fetchFn={fetchAnimeSection}
            viewAllPath="/anime"
            gradient="bg-gradient-to-br from-[#9b59b6] to-[#8e44ad]"
          />
        )}

        {!hiddenSections.includes("thuyet-minh") && (
          <MovieSection
            title="Phim thuyết minh"
            icon={faMicrophone}
            fetchFn={fetchThuyetMinhSection}
            viewAllPath="/thuyet-minh"
            gradient="bg-gradient-to-br from-[#e67e22] to-[#d35400]"
          />
        )}

        <MovieSection
          title="Phim Hàn Quốc"
          icon={faGlobe}
          fetchFn={fetchHanQuocSection}
          viewAllPath="/quoc-gia/han-quoc"
          gradient="bg-gradient-to-br from-[#FF6B9D] to-[#C44569]"
        />

        <MovieSection
          title="Phim Trung Quốc"
          icon={faGlobe}
          fetchFn={fetchTrungQuocSection}
          viewAllPath="/quoc-gia/trung-quoc"
          gradient="bg-gradient-to-br from-[#e74c3c] to-[#c0392b]"
        />

        <MovieSection
          title="Phim Âu Mỹ"
          icon={faGlobe}
          fetchFn={fetchAuMySection}
          viewAllPath="/quoc-gia/au-my"
          gradient="bg-gradient-to-br from-[#4DA6FF] to-[#2980b9]"
        />
      </div>
    </div>
  );
}
