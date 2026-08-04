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
  getLongTiengMovies,
  getCoTrangMovies,
  getCungDauMovies,
  OPhimMovie,
} from "@/lib/ophimApi";
import { getProxiedImageUrl } from "@/lib/imageProxy";
import { usePreferences } from "@/lib/usePreferences";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faChevronLeft,
  faChevronRight,
  faClapperboard,
  faCrown,
  faFilm,
  faFire,
  faGlobe,
  faMicrophone,
  faPlay,
  faStar,
  faTv,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import ContinueWatching from "@/component/ContinueWatching";

const MovieCard = memo(({ movie, onClick }: { movie: OPhimMovie; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="tv-row-card movie-card-premium neon-glow group w-[140px] flex-shrink-0 cursor-pointer text-left sm:w-[160px]"
  >
    <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] bg-[#2a2d3e]">
      <Image
        src={getProxiedImageUrl(getImageUrl(movie.poster_url || movie.thumb_url))}
        alt={typeof movie.name === "string" ? movie.name : "Movie"}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(min-width: 2200px) 270px, (min-width: 1600px) 230px, (max-width: 640px) 140px, 160px"
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
  <div className="tv-row-card w-[140px] flex-shrink-0 sm:w-[160px]">
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
      <section ref={sectionRef} className="tv-row-section mb-[40px]">
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

        <div className="tv-horizontal-row scrollbar-hide flex gap-[12px] overflow-x-auto pb-[8px]">
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

const TrendingSection = memo(({ movies }: { movies: OPhimMovie[] }) => {
  const router = useRouter();

  const trendingMovies = Array.isArray(movies) && movies.length > 0
    ? [...movies]
        .sort((a, b) => (b.tmdb?.vote_average || 0) - (a.tmdb?.vote_average || 0))
        .slice(0, 10)
    : [];

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

      <div className="tv-trending-grid grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-5">
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
                src={getProxiedImageUrl(getImageUrl(movie.poster_url || movie.thumb_url))}
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
                <span className="text-[11px] font-semibold text-[#FFD875]">
                  ★ {movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : (movie.quality || "HD")}
                </span>
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
  const [trendingMovies, setTrendingMovies] = useState<OPhimMovie[]>([]);
  const { preferences } = usePreferences();
  const { hiddenSections } = preferences;

  const fetchLatestSection = useCallback(async () => (await getLatestMovies(1)).items.slice(0, 12), []);
  const fetchPhimLeSection = useCallback(async () => (await getMoviesByType("phim-le", 1)).items.slice(0, 12), []);
  const fetchPhimBoSection = useCallback(async () => (await getMoviesByType("phim-bo", 1)).items.slice(0, 12), []);
  const fetchAnimeSection = useCallback(async () => (await getMoviesByType("hoat-hinh", 1)).items.slice(0, 12), []);
  const fetchThuyetMinhSection = useCallback(async () => (await getThuyetMinhMovies(1)).items.slice(0, 12), []);
  const fetchLongTiengSection = useCallback(async () => (await getLongTiengMovies(1)).items.slice(0, 12), []);
  const fetchCungDauSection = useCallback(async () => (await getCungDauMovies(1)).items.slice(0, 12), []);
  const fetchCoTrangSection = useCallback(async () => (await getCoTrangMovies(1)).items.slice(0, 12), []);
  const fetchHanQuocSection = useCallback(async () => (await getMoviesByCountry("han-quoc", 1)).items.slice(0, 12), []);
  const fetchTrungQuocSection = useCallback(async () => (await getMoviesByCountry("trung-quoc", 1)).items.slice(0, 12), []);
  const fetchAuMySection = useCallback(async () => (await getMoviesByCountry("au-my", 1)).items.slice(0, 12), []);

  useEffect(() => {
    getLatestMovies(1)
      .then((pageOne) => {
        setTrendingMovies(pageOne.items || []);
      })
      .catch(() => {
        setTrendingMovies([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0F111A]">
      <div className="container mx-auto max-w-[1400px] px-[16px] pt-[20px] pb-[30px]">
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
          title="Phim Lồng Tiếng"
          icon={faVolumeHigh}
          fetchFn={fetchLongTiengSection}
          viewAllPath="/long-tieng"
          gradient="bg-gradient-to-br from-[#8E44AD] to-[#6C3483]"
        />

        <MovieSection
          title="Cung Đấu Triều Thanh"
          icon={faCrown}
          fetchFn={fetchCungDauSection}
          viewAllPath="/cung-dau"
          gradient="bg-gradient-to-br from-[#C0392B] to-[#922B21]"
        />

        <MovieSection
          title="Phim Cổ Trang"
          icon={faCrown}
          fetchFn={fetchCoTrangSection}
          viewAllPath="/the-loai/co-trang"
          gradient="bg-gradient-to-br from-[#D4AC0D] to-[#B7950B]"
        />

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

