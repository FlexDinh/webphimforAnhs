"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OPhimMovie } from "@/lib/ophimApi";
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from "@/lib/watchlistUtils";
import TVMovieCard from "../_components/TVMovieCard";
import { COLORS, FONT, SPACING, styles } from "../_components/TVStyles";

function toMovie(item: WatchlistItem): OPhimMovie {
  return {
    _id: item.slug,
    name: item.name,
    slug: item.slug,
    origin_name: item.origin_name,
    thumb_url: item.poster_url,
    poster_url: item.poster_url,
    year: item.year || 0,
    quality: item.quality,
  };
}

export default function TVWatchlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setItems(getWatchlist());
  }, []);

  const handleRemove = (slug: string) => {
    removeFromWatchlist(slug);
    setItems(getWatchlist());
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: `24px ${SPACING.lg}px 48px` }}>
      <div style={{ ...styles.sectionHeader, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: FONT.xxl, fontWeight: 800, color: COLORS.text, margin: 0 }}>
            Danh sách xem sau
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: FONT.md, margin: "8px 0 0" }}>
            {items.length} phim đã lưu
          </p>
        </div>
        <button onClick={() => router.push("/tv")} style={styles.btnSecondary}>
          Khám phá phim
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ ...styles.flexCenter, minHeight: "35vh", flexDirection: "column", gap: 16 }}>
          <p style={{ color: COLORS.textMuted, fontSize: FONT.lg, margin: 0 }}>
            Bạn chưa lưu phim nào.
          </p>
          <button onClick={() => router.push("/tv")} style={styles.btnPrimary}>
            Xem phim mới
          </button>
        </div>
      ) : (
        <div style={styles.movieGrid}>
          {items.map((item) => (
            <div key={item.slug} style={{ position: "relative", minWidth: 0 }}>
              <TVMovieCard movie={toMovie(item)} width="100%" />
              <button
                onClick={() => handleRemove(item.slug)}
                aria-label={`Xóa ${item.name} khỏi danh sách xem sau`}
                title="Xóa khỏi danh sách"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(0,0,0,0.75)",
                  color: COLORS.text,
                  fontSize: FONT.md,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
