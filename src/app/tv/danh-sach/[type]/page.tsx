"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getLatestMovies,
  getMoviesByType,
  getMoviesByCountry,
  getTheatricalMovies,
  getThuyetMinhMovies,
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

  const config = TYPE_MAP[type];

  const fetchData = useCallback(
    async (p: number) => {
      if (!config) return;
      setLoading(true);
      try {
        const res = await config.fetch(p);
        setMovies(res.items || []);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch {
        setMovies([]);
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
          flexDirection: "column" as const,
          gap: "16px",
        }}
      >
        <p style={{ fontSize: FONT.lg, color: COLORS.textMuted }}>
          Danh mục không tồn tại
        </p>
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
        <span style={{ color: COLORS.textDim, fontSize: FONT.sm }}>
          Trang {page} / {totalPages}
        </span>
      </div>

      {/* Movie Grid */}
      {loading ? (
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
            flexDirection: "column" as const,
            gap: "16px",
          }}
        >
          <p style={{ fontSize: FONT.lg, color: COLORS.textMuted }}>
            Không tìm thấy phim
          </p>
        </div>
      ) : (
        <div style={styles.movieGrid}>
          {movies.map((movie, index) => (
            <TVMovieCard
              key={movie._id || movie.slug}
              movie={movie}
              width="100%"
              loading={index < 12 ? "eager" : "lazy"}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "40px",
            paddingBottom: "40px",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              ...styles.btnSecondary,
              opacity: page <= 1 ? 0.4 : 1,
              cursor: page <= 1 ? "default" : "pointer",
            }}
          >
            ← Trang trước
          </button>

          {/* Page numbers */}
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
                onClick={() => setPage(pageNum)}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background:
                    pageNum === page ? COLORS.accent : "rgba(255,255,255,0.1)",
                  color: pageNum === page ? "#000" : COLORS.text,
                  border: "none",
                  fontWeight: pageNum === page ? 700 : 500,
                  fontSize: FONT.md,
                  cursor: "pointer",
                  fontFamily: FONT.family,
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{
              ...styles.btnSecondary,
              opacity: page >= totalPages ? 0.4 : 1,
              cursor: page >= totalPages ? "default" : "pointer",
            }}
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  );
}
