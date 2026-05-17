"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchMovies, OPhimMovie } from "@/lib/ophimApi";
import TVMovieCard from "../_components/TVMovieCard";
import { COLORS, FONT, RADIUS, styles } from "../_components/TVStyles";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<OPhimMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    searchMovies(query, 24)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    router.push(`/tv/tim-kiem?q=${encodeURIComponent(q)}`);
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.push("/tv")} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: COLORS.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <h1 style={{ fontSize: FONT.xxl, fontWeight: 800, color: COLORS.text, margin: 0 }}>Tìm kiếm</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Nhập tên phim..." autoFocus
          style={{ flex: 1, padding: "14px 20px", background: "rgba(255,255,255,0.08)", border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.md, color: COLORS.text, fontSize: FONT.lg, outline: "none", fontFamily: FONT.family, minHeight: 52 }} />
        <button type="submit" style={{ ...styles.btnPrimary, fontSize: FONT.lg, padding: "14px 32px" }}>Tìm</button>
      </form>

      {query && <p style={{ color: COLORS.textMuted, fontSize: FONT.sm, marginBottom: 16 }}>{loading ? "Đang tìm..." : `${results.length} kết quả cho "${query}"`}</p>}

      {loading ? (
        <div style={styles.movieGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div style={{ width: "100%", paddingBottom: "150%", borderRadius: RADIUS.md, background: "#2a2d3e" }} />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div style={styles.movieGrid}>
          {results.map((movie) => <TVMovieCard key={movie._id || movie.slug} movie={movie} width="100%" />)}
        </div>
      ) : query ? (
        <div style={{ ...styles.flexCenter, minHeight: "30vh", flexDirection: "column" as const, gap: 12 }}>
          <p style={{ fontSize: FONT.lg, color: COLORS.textMuted }}>Không tìm thấy phim nào</p>
        </div>
      ) : null}
    </div>
  );
}

export default function TVSearchPage() {
  return (
    <Suspense fallback={
      <div style={{ ...styles.flexCenter, minHeight: "60vh" }}>
        <p style={{ color: COLORS.textMuted }}>Đang tải...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
