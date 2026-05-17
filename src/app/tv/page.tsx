"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getLatestMovies,
  getMoviesByType,
  getMoviesByCountry,
  getThuyetMinhMovies,
  OPhimMovie,
} from "@/lib/ophimApi";
import { getImageUrl } from "@/lib/imageUrl";
import TVMovieCard from "./_components/TVMovieCard";
import { COLORS, FONT, SPACING, RADIUS, styles } from "./_components/TVStyles";

/* ─── Movie Row Section ─── */
function TVMovieRow({
  title,
  fetchFn,
  viewAllPath,
}: {
  title: string;
  fetchFn: () => Promise<OPhimMovie[]>;
  viewAllPath: string;
}) {
  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFn()
      .then(setMovies)
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ marginBottom: "40px" }}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <button
          onClick={() => router.push(viewAllPath)}
          style={{
            background: "none",
            border: "none",
            color: COLORS.accent,
            fontSize: FONT.sm,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT.family,
          }}
        >
          Xem tất cả →
        </button>
      </div>
      <div style={styles.horizontalRow}>
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "180px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "150%",
                    borderRadius: RADIUS.md,
                    background: "#2a2d3e",
                  }}
                />
                <div
                  style={{
                    height: "14px",
                    width: "75%",
                    borderRadius: "4px",
                    background: "#2a2d3e",
                    marginTop: "8px",
                  }}
                />
              </div>
            ))
          : movies.map((movie) => (
              <TVMovieCard key={movie._id || movie.slug} movie={movie} />
            ))}
      </div>
    </section>
  );
}

/* ─── Hero Carousel ─── */
function TVHero({ movies }: { movies: OPhimMovie[] }) {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const heroMovies = movies.slice(0, 5);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroMovies.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  if (heroMovies.length === 0) {
    return (
      <div
        style={{
          height: "500px",
          background: "linear-gradient(135deg, #1a1c2e, #0B0D13)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: `4px solid ${COLORS.border}`,
            borderTopColor: COLORS.accent,
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  const movie = heroMovies[current];
  const bgUrl = getImageUrl(movie.poster_url || movie.thumb_url);

  return (
    <div
      style={{
        position: "relative" as const,
        height: "540px",
        overflow: "hidden",
        background: "#0B0D13",
      }}
    >
      {/* Background image */}
      <img
        src={bgUrl}
        alt=""
        style={{
          position: "absolute" as const,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover" as const,
          opacity: 0.5,
        }}
      />

      {/* Gradient overlays */}
      <div
        style={{
          position: "absolute" as const,
          inset: 0,
          background:
            "linear-gradient(to right, rgba(11,13,19,0.95) 0%, rgba(11,13,19,0.6) 50%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute" as const,
          inset: 0,
          background:
            "linear-gradient(to top, rgba(11,13,19,1) 0%, transparent 40%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative" as const,
          zIndex: 2,
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `0 ${SPACING.lg}px`,
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: "600px" }}>
          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "14px",
              flexWrap: "wrap" as const,
            }}
          >
            {movie.quality && (
              <span
                style={{
                  padding: "5px 14px",
                  borderRadius: RADIUS.full,
                  background: COLORS.accent,
                  color: "#000",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {movie.quality}
              </span>
            )}
            <span
              style={{
                padding: "5px 14px",
                borderRadius: RADIUS.full,
                background: "rgba(255,255,255,0.1)",
                color: COLORS.text,
                fontSize: "13px",
              }}
            >
              {movie.year || ""}
            </span>
            {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
              <span
                style={{
                  padding: "5px 14px",
                  borderRadius: RADIUS.full,
                  background: "rgba(255,216,117,0.2)",
                  color: COLORS.accent,
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                ★ {movie.tmdb.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "42px",
              fontWeight: 800,
              color: COLORS.text,
              margin: "0 0 8px",
              lineHeight: 1.1,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {movie.name || ""}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "18px",
              color: COLORS.accent,
              margin: "0 0 24px",
            }}
          >
            {movie.origin_name || ""}
          </p>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push(`/tv/phim/${movie.slug}`)}
              style={styles.btnPrimary}
            >
              ▶ Xem ngay
            </button>
            <button
              onClick={() => router.push(`/tv/phim/${movie.slug}`)}
              style={styles.btnSecondary}
            >
              Chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div
        style={{
          position: "absolute" as const,
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 3,
        }}
      >
        {heroMovies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? "32px" : "10px",
              height: "10px",
              borderRadius: "5px",
              background: i === current ? COLORS.accent : "rgba(255,255,255,0.3)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.3s",
            }}
          />
        ))}
      </div>

      {/* Nav arrows */}
      <button
        onClick={() =>
          setCurrent((c) => (c - 1 + heroMovies.length) % heroMovies.length)
        }
        style={{
          position: "absolute" as const,
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          color: COLORS.text,
          border: "none",
          cursor: "pointer",
          fontSize: "20px",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ‹
      </button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % heroMovies.length)}
        style={{
          position: "absolute" as const,
          right: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          color: COLORS.text,
          border: "none",
          cursor: "pointer",
          fontSize: "20px",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ›
      </button>
    </div>
  );
}

/* ─── Trending Section ─── */
function TVTrending({ movies }: { movies: OPhimMovie[] }) {
  const trendingMovies = [...movies]
    .filter((m) => m.tmdb?.vote_average && m.tmdb.vote_average > 0)
    .sort((a, b) => (b.tmdb?.vote_average || 0) - (a.tmdb?.vote_average || 0))
    .slice(0, 10);

  if (trendingMovies.length === 0) return null;

  return (
    <section style={{ marginBottom: "40px" }}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>🔥 Trending</h2>
      </div>
      <div style={styles.horizontalRow}>
        {trendingMovies.map((movie, i) => (
          <TVMovieCard
            key={movie._id || movie.slug}
            movie={movie}
            rank={i + 1}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Main Homepage ─── */
export default function TVHomePage() {
  const [heroMovies, setHeroMovies] = useState<OPhimMovie[]>([]);
  const [allMovies, setAllMovies] = useState<OPhimMovie[]>([]);

  const fetchLatest = useCallback(
    async () => (await getLatestMovies(1)).items.slice(0, 14),
    []
  );
  const fetchPhimLe = useCallback(
    async () => (await getMoviesByType("phim-le", 1)).items.slice(0, 14),
    []
  );
  const fetchPhimBo = useCallback(
    async () => (await getMoviesByType("phim-bo", 1)).items.slice(0, 14),
    []
  );
  const fetchAnime = useCallback(
    async () => (await getMoviesByType("hoat-hinh", 1)).items.slice(0, 14),
    []
  );
  const fetchThuyetMinh = useCallback(
    async () => (await getThuyetMinhMovies(1)).items.slice(0, 14),
    []
  );
  const fetchHanQuoc = useCallback(
    async () => (await getMoviesByCountry("han-quoc", 1)).items.slice(0, 14),
    []
  );
  const fetchTrungQuoc = useCallback(
    async () => (await getMoviesByCountry("trung-quoc", 1)).items.slice(0, 14),
    []
  );
  const fetchAuMy = useCallback(
    async () => (await getMoviesByCountry("au-my", 1)).items.slice(0, 14),
    []
  );

  useEffect(() => {
    Promise.all([getLatestMovies(1), getLatestMovies(2)])
      .then(([p1, p2]) => {
        setHeroMovies(p1.items.slice(0, 6));
        setAllMovies([...p1.items, ...p2.items]);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <TVHero movies={heroMovies} />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `${SPACING.xl}px ${SPACING.lg}px`,
        }}
      >
        <TVTrending movies={allMovies} />

        <TVMovieRow
          title="⭐ Phim mới"
          fetchFn={fetchLatest}
          viewAllPath="/tv/danh-sach/phim-moi"
        />
        <TVMovieRow
          title="🎬 Phim lẻ"
          fetchFn={fetchPhimLe}
          viewAllPath="/tv/danh-sach/phim-le"
        />
        <TVMovieRow
          title="📺 Phim bộ"
          fetchFn={fetchPhimBo}
          viewAllPath="/tv/danh-sach/phim-bo"
        />
        <TVMovieRow
          title="🎌 Anime"
          fetchFn={fetchAnime}
          viewAllPath="/tv/danh-sach/hoat-hinh"
        />
        <TVMovieRow
          title="🎙️ Thuyết minh"
          fetchFn={fetchThuyetMinh}
          viewAllPath="/tv/danh-sach/thuyet-minh"
        />
        <TVMovieRow
          title="🇰🇷 Phim Hàn Quốc"
          fetchFn={fetchHanQuoc}
          viewAllPath="/tv/danh-sach/han-quoc"
        />
        <TVMovieRow
          title="🇨🇳 Phim Trung Quốc"
          fetchFn={fetchTrungQuoc}
          viewAllPath="/tv/danh-sach/trung-quoc"
        />
        <TVMovieRow
          title="🇺🇸 Phim Âu Mỹ"
          fetchFn={fetchAuMy}
          viewAllPath="/tv/danh-sach/au-my"
        />
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center" as const,
          padding: "40px 24px",
          borderTop: `1px solid ${COLORS.border}`,
          color: COLORS.textDim,
          fontSize: FONT.sm,
        }}
      >
        <p style={{ margin: 0 }}>
          RoPhim TV — Xem phim tối ưu cho màn hình lớn
        </p>
        <p style={{ margin: "8px 0 0", fontSize: FONT.xs }}>
          © {new Date().getFullYear()} RoPhim
        </p>
      </footer>
    </div>
  );
}
