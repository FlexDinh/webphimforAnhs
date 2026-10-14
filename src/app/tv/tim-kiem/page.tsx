"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchMovies, OPhimMovie } from "@/lib/ophimApi";
import { searchKkPhimMovies } from "@/lib/kkphimApi";
import TVMovieCard from "../_components/TVMovieCard";
import { COLORS, FONT, RADIUS, styles } from "../_components/TVStyles";

const TYPO_MAP: Record<string, string> = {
  "nguoi nhen": "người nhện",
  "co trang": "cổ trang",
  "hanh dong": "hành động",
  "hai huoc": "hài hước",
  "tinh cam": "tình cảm",
  "kinh di": "kinh dị",
  "phieu luu": "phiêu lưu",
  "vien tuong": "viễn tưởng",
  "than thoai": "thần thoại",
  "tai lieu": "tài liệu",
  "hoat hinh": "hoạt hình",
  "vo thuat": "võ thuật",
  "hoc duong": "học đường",
};

interface MovieWithSource extends OPhimMovie {
  _source: "ophim" | "kkphim";
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function scoreTitle(title: string, query: string) {
  const normalizedTitle = normalizeSearchText(title);
  if (normalizedTitle === query) return 100;
  if (normalizedTitle.startsWith(query)) return 80;
  if (normalizedTitle.includes(query)) return 60;

  const queryWords = query.split(/\s+/).filter(Boolean);
  const matchedWords = queryWords.filter((word) => normalizedTitle.includes(word)).length;
  return queryWords.length ? (matchedWords / queryWords.length) * 40 : 0;
}

function getRelevanceScore(movie: OPhimMovie, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;
  return Math.max(
    scoreTitle(movie.name || "", normalizedQuery),
    scoreTitle(movie.origin_name || "", normalizedQuery)
  );
}

function compareRating(a: OPhimMovie, b: OPhimMovie) {
  return (b.tmdb?.vote_average ?? 0) - (a.tmdb?.vote_average ?? 0);
}

function compareYear(a: OPhimMovie, b: OPhimMovie) {
  return (b.year ?? 0) - (a.year ?? 0);
}

function compareName(a: OPhimMovie, b: OPhimMovie) {
  return (a.name || "").localeCompare(b.name || "");
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState<MovieWithSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [sourceFilter, setSourceFilter] = useState<"all" | "ophim" | "kkphim">("all");
  const [sortOrder, setSortOrder] = useState<"relevance" | "year" | "score">("relevance");

  useEffect(() => {
    if (!query) return;
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    setLoading(true);

    Promise.allSettled([
      searchMovies(query, 24),
      searchKkPhimMovies(query, 24),
    ]).then((outcomes) => {
      let ophimRes: OPhimMovie[] = [];
      let kkphimRes: OPhimMovie[] = [];

      if (outcomes[0].status === "fulfilled") ophimRes = outcomes[0].value;
      if (outcomes[1].status === "fulfilled") kkphimRes = outcomes[1].value;

      const ophimMapped = ophimRes.map((m) => ({ ...m, _source: "ophim" as const }));
      const kkphimMapped = kkphimRes.map((m) => ({ ...m, _source: "kkphim" as const }));

      const combined = [...ophimMapped, ...kkphimMapped];
      const deduped = combined.filter(
        (movie, index, self) => index === self.findIndex((m) => m.slug === movie.slug)
      );

      setResults(deduped);
      setLoading(false);
    });
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    router.push(`/tv/tim-kiem?query=${encodeURIComponent(q)}`);
  };

  const suggestion = TYPO_MAP[query.toLowerCase()];

  let filtered = results;
  if (sourceFilter !== "all") {
    filtered = results.filter((m) => m._source === sourceFilter);
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "relevance") {
      return (
        getRelevanceScore(b, query) - getRelevanceScore(a, query) ||
        compareRating(a, b) ||
        compareYear(a, b) ||
        compareName(a, b)
      );
    } else if (sortOrder === "year") {
      return compareYear(a, b) || compareRating(a, b) || compareName(a, b);
    } else if (sortOrder === "score") {
      return compareRating(a, b) || compareYear(a, b) || compareName(a, b);
    }
    return 0;
  });

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => router.push("/tv")}
          style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: COLORS.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ←
        </button>
        <h1 style={{ fontSize: FONT.xxl, fontWeight: 800, color: COLORS.text, margin: 0 }}>Tìm kiếm</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Nhập tên phim..."
          autoFocus
          style={{ flex: 1, padding: "14px 20px", background: "rgba(255,255,255,0.08)", border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.md, color: COLORS.text, fontSize: FONT.lg, outline: "none", fontFamily: FONT.family, minHeight: 52 }}
        />
        <button type="submit" style={{ ...styles.btnPrimary, fontSize: FONT.lg, padding: "14px 32px" }}>
          🔍 Tìm
        </button>
      </form>

      {suggestion && (
        <div style={{ marginBottom: 24 }}>
          <span style={{ color: COLORS.textMuted, fontSize: FONT.md }}>Bạn có ý tìm: </span>
          <button
            onClick={() => {
              setSearchInput(suggestion);
              router.push(`/tv/tim-kiem?query=${encodeURIComponent(suggestion)}`);
            }}
            style={{ background: "none", border: "none", color: COLORS.accent, fontSize: FONT.md, fontWeight: "bold", cursor: "pointer", padding: 0 }}
          >
            {suggestion}?
          </button>
        </div>
      )}

      {query && !loading && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {(["all", "ophim", "kkphim"] as const).map((source) => (
              <button
                key={source}
                onClick={() => setSourceFilter(source)}
                style={{
                  ...styles.btnSecondary,
                  background: sourceFilter === source ? COLORS.accent : "rgba(255,255,255,0.1)",
                  color: sourceFilter === source ? "#000" : COLORS.text,
                  border: "none",
                }}
              >
                {source === "all" ? "Tất cả" : source === "ophim" ? "OPhim" : "KKPhim"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: COLORS.textMuted, fontSize: FONT.sm }}>Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              style={{ padding: "8px 12px", background: "rgba(255,255,255,0.1)", border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.md, color: COLORS.text, fontSize: FONT.sm, outline: "none", cursor: "pointer" }}
            >
              <option value="relevance" style={{ background: COLORS.bgCard }}>Liên quan</option>
              <option value="score" style={{ background: COLORS.bgCard }}>Điểm cao → thấp</option>
              <option value="year" style={{ background: COLORS.bgCard }}>Năm mới → cũ</option>
            </select>
          </div>
        </div>
      )}

      {query && <p style={{ color: COLORS.textMuted, fontSize: FONT.sm, marginBottom: 16 }}>{loading ? "Đang tìm..." : `${sorted.length} kết quả cho "${query}"`}</p>}

      {loading ? (
        <div style={styles.movieGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div style={{ width: "100%", paddingBottom: "150%", borderRadius: RADIUS.md, background: "#2a2d3e" }} />
            </div>
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div style={styles.movieGrid}>
          {sorted.map((movie) => (
            <TVMovieCard key={movie._id || movie.slug} movie={movie} width="100%" />
          ))}
        </div>
      ) : query ? (
        <div style={{ ...styles.flexCenter, minHeight: "30vh", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: FONT.lg, color: COLORS.textMuted }}>Không tìm thấy phim nào</p>
        </div>
      ) : null}
    </div>
  );
}

export default function TVSearchPage() {
  return (
    <Suspense
      fallback={
        <div style={{ ...styles.flexCenter, minHeight: "60vh" }}>
          <p style={{ color: COLORS.textMuted }}>Đang tải...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
