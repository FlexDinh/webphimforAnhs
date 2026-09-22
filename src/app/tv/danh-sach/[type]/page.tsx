"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getLatestMovies,
  getMoviesByType,
  getMoviesByCountry,
  getTheatricalMovies,
  getThuyetMinhMovies,
  getLongTiengMovies,
  getCungDauMovies,
  getCoTrangMovies,
  OPhimMovie,
} from "@/lib/ophimApi";
import TVMovieCard from "../../_components/TVMovieCard";
import { COLORS, FONT, SPACING, RADIUS, styles } from "../../_components/TVStyles";

const TYPE_MAP: Record<string, { title: string; fetch: (page: number) => Promise<any> }> = {
  "phim-moi": {
    title: "Phim mới cập nhật",
    fetch: getLatestMovies,
  },
  "phim-le": {
    title: "Phim lẻ",
    fetch: (p) => getMoviesByType("phim-le", p),
  },
  "phim-bo": {
    title: "Phim bộ",
    fetch: (p) => getMoviesByType("phim-bo", p),
  },
  "hoat-hinh": {
    title: "Anime / Hoạt hình",
    fetch: (p) => getMoviesByType("hoat-hinh", p),
  },
  "chieu-rap": {
    title: "Phim chiếu rạp",
    fetch: getTheatricalMovies,
  },
  "thuyet-minh": {
    title: "Phim thuyết minh",
    fetch: getThuyetMinhMovies,
  },
  "long-tieng": {
    title: "Phim lồng tiếng",
    fetch: getLongTiengMovies,
  },
  "cung-dau": {
    title: "Cung đấu Triều Thanh",
    fetch: getCungDauMovies,
  },
  "co-trang": {
    title: "Phim cổ trang",
    fetch: getCoTrangMovies,
  },
  "han-quoc": {
    title: "Phim Hàn Quốc",
    fetch: (p) => getMoviesByCountry("han-quoc", p),
  },
  "trung-quoc": {
    title: "Phim Trung Quốc",
    fetch: (p) => getMoviesByCountry("trung-quoc", p),
  },
  "au-my": {
    title: "Phim Âu Mỹ",
    fetch: (p) => getMoviesByCountry("au-my", p),
  },
};

export default function TVListPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;

  const [movies, setMovies] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const loadingMoreRef = useRef<HTMLDivElement>(null);

  const config = TYPE_MAP[type];

  const fetchData = useCallback(
    async (p: number) => {
      if (!config) return;
      setLoading(true);
      try {
        const res = await config.fetch(p);
        if (p === 1) {
          setMovies(res.items || []);
        } else {
          setMovies((prev) => [...prev, ...(res.items || [])]);
          setTimeout(() => {
            if (loadingMoreRef.current) {
              loadingMoreRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100);
        }
        setTotalPages(res.pagination?.totalPages || 1);
      } catch {
        if (p === 1) setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  if (!config) {
    return (
      <div
        style={{
          ...styles.flexCenter,
          minHeight: "60vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <p style={{ fontSize: FONT.lg, color: COLORS.textMuted }}>Danh mục không tồn tại</p>
        <button onClick={() => router.push("/tv")} style={styles.btnPrimary}>
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: `${SPACING.lg}px`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => router.push("/tv")}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: COLORS.text,
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
          <h1
            style={{
              fontSize: FONT.xxl,
              fontWeight: 800,
              color: COLORS.text,
              margin: 0,
            }}
          >
            {config.title}
          </h1>
        </div>
      </div>

      {/* Movie Grid */}
      {loading && page === 1 ? (
        <div style={styles.movieGrid}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i}>
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
                  width: "70%",
                  borderRadius: "4px",
                  background: "#2a2d3e",
                  marginTop: "8px",
                }}
              />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div
          style={{
            ...styles.flexCenter,
            minHeight: "40vh",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p style={{ fontSize: FONT.lg, color: COLORS.textMuted }}>Không tìm thấy phim</p>
        </div>
      ) : (
        <div style={styles.movieGrid}>
          {movies.map((movie, index) => {
            const isFirstNewItem = page > 1 && index === (page - 1) * (movies.length / page);
            return (
              <div key={`${movie._id || movie.slug}-${index}`} ref={isFirstNewItem ? loadingMoreRef : null}>
                <TVMovieCard movie={movie} width="100%" loading={index < 12 ? "eager" : "lazy"} />
              </div>
            );
          })}
        </div>
      )}

      {loading && page > 1 && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p style={{ color: COLORS.textMuted, fontSize: FONT.lg }}>Đang tải thêm...</p>
        </div>
      )}

      {/* Load More Button */}
      {!loading && page < totalPages && movies.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "40px", paddingBottom: "40px" }}>
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              ...styles.btnSecondary,
              padding: "16px 40px",
              fontSize: FONT.lg,
            }}
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
