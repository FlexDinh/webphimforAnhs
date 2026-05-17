"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/ophimApi";
import {
  getUnifiedMovieDetail,
  UnifiedResponse,
  UnifiedEpisode,
} from "@/lib/stableApi";
import { STREAMING_SOURCES } from "@/lib/streamingApi";
import {
  getSafeEmbedUrl,
  PLAYER_IFRAME_ALLOW,
  PLAYER_IFRAME_SANDBOX,
} from "@/lib/playerSecurity";
import { COLORS, FONT, RADIUS, styles } from "../../_components/TVStyles";

export default function TVMoviePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [movie, setMovie] = useState<UnifiedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<UnifiedEpisode | null>(null);
  const [selectedEpisodeIdx, setSelectedEpisodeIdx] = useState(0);
  const [hdSource, setHdSource] = useState<string | null>(null);
  const [useHdSource, setUseHdSource] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getUnifiedMovieDetail(slug)
      .then((data) => {
        if (!data.status) { setError("Không tìm thấy phim"); return; }
        setMovie(data);
        if (data.episodes?.[0]?.server_data?.[0]) {
          setSelectedEpisode(data.episodes[0].server_data[0]);
        }
      })
      .catch(() => setError("Không thể tải phim"))
      .finally(() => setLoading(false));
  }, [slug]);

  const serverData = movie?.episodes?.[selectedServer]?.server_data || [];
  const hasNext = selectedEpisodeIdx < serverData.length - 1;
  const hasPrev = selectedEpisodeIdx > 0;

  const goTo = useCallback((idx: number) => {
    const ep = serverData[idx];
    if (!ep) return;
    setSelectedEpisode(ep);
    setSelectedEpisodeIdx(idx);
    setUseHdSource(false);
    setHdSource(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [serverData]);

  if (loading) return (
    <div style={{ ...styles.flexCenter, minHeight: "60vh", flexDirection: "column" as const, gap: "16px" }}>
      <div className="tv-spinner" style={{ width: 48, height: 48, border: `4px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%" }} />
      <p style={{ color: COLORS.textMuted }}>Đang tải phim...</p>
    </div>
  );

  if (error || !movie) return (
    <div style={{ ...styles.flexCenter, minHeight: "60vh", flexDirection: "column" as const, gap: 16 }}>
      <p style={{ fontSize: FONT.lg, color: COLORS.text }}>{error || "Không tìm thấy phim"}</p>
      <button onClick={() => router.back()} style={styles.btnPrimary}>← Quay lại</button>
    </div>
  );

  const { movie: m, episodes } = movie;
  const embed = useHdSource ? getSafeEmbedUrl(hdSource) : getSafeEmbedUrl(selectedEpisode?.link_embed);

  return (
    <div>
      {/* Player */}
      <div style={{ width: "100%", background: "#000" }}>
        <div style={{ width: "min(100%, calc(80vh * 16 / 9))", maxWidth: "100%", margin: "0 auto", aspectRatio: "16/9" }}>
          {embed ? (
            <iframe src={embed} style={{ width: "100%", height: "100%", border: "none" }} title={m.name} allowFullScreen allow={PLAYER_IFRAME_ALLOW} sandbox={PLAYER_IFRAME_SANDBOX} referrerPolicy="no-referrer" />
          ) : (
            <div style={{ ...styles.flexCenter, width: "100%", height: "100%", background: "#1a1c2e", flexDirection: "column" as const }}>
              <span style={{ fontSize: 60, opacity: 0.2 }}>▶</span>
              <p style={{ color: COLORS.textDim }}>Chọn tập phim để xem</p>
            </div>
          )}
        </div>
        {/* Controls */}
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,17,26,0.9)", flexWrap: "wrap" as const, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.back()} style={{ ...styles.btnSecondary, padding: "8px 16px", minHeight: 40 }}>← Quay lại</button>
            {selectedEpisode && <span style={{ color: COLORS.textMuted, fontSize: FONT.sm }}>Đang xem: <span style={{ color: COLORS.accent, fontWeight: 600 }}>{selectedEpisode.name}</span></span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {hasPrev && <button onClick={() => goTo(selectedEpisodeIdx - 1)} style={{ ...styles.btnSecondary, padding: "8px 16px", minHeight: 40 }}>← Tập trước</button>}
            {hasNext && <button onClick={() => goTo(selectedEpisodeIdx + 1)} style={{ ...styles.btnPrimary, padding: "8px 16px", minHeight: 40, fontSize: FONT.sm }}>Tập sau →</button>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {/* Movie Info */}
        <div style={{ display: "flex", gap: 30, marginBottom: 40, flexWrap: "wrap" as const }}>
          <div style={{ width: 200, flexShrink: 0 }}>
            <img src={getImageUrl(m.poster_url || m.thumb_url)} alt={m.name} style={{ width: "100%", borderRadius: RADIUS.md }} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>{m.name || ""}</h1>
            <p style={{ fontSize: FONT.lg, color: COLORS.accent, margin: "0 0 16px" }}>{m.origin_name || ""}</p>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 16 }}>
              {m.quality && <span style={{ ...styles.badge, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})` }}>{m.quality}</span>}
              {m.lang && <span style={styles.tag}>{m.lang}</span>}
              <span style={styles.tag}>{m.year}</span>
              {m.time && <span style={styles.tag}>{m.time}</span>}
            </div>
            <p style={{ color: COLORS.textMuted, fontSize: FONT.sm, margin: "0 0 8px" }}>Trạng thái: <span style={{ color: COLORS.accent }}>{m.episode_current || ""}</span>{m.episode_total && ` / ${m.episode_total}`}</p>
            {m.category?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 16 }}>
                {m.category.map((c) => <span key={c.id} style={styles.tag}>{c.name}</span>)}
              </div>
            )}
            {m.content && <div style={{ color: COLORS.textMuted, fontSize: FONT.sm, lineHeight: 1.7, maxHeight: 120, overflow: "auto" }} dangerouslySetInnerHTML={{ __html: m.content }} />}
          </div>
        </div>

        {/* Episodes Panel */}
        {episodes?.length > 0 && (
          <div style={{ background: COLORS.bgSurface, borderRadius: RADIUS.lg, padding: 24 }}>
            <h2 style={{ fontSize: FONT.lg, fontWeight: 700, color: COLORS.text, marginBottom: 20 }}>▶ Danh sách tập phim</h2>

            {/* HD Sources */}
            <HDSourcePanel tmdbId={m.tmdb?.id} tmdbType={m.tmdb?.type} movieSlug={m.slug} hdSource={hdSource} useHdSource={useHdSource} setHdSource={setHdSource} setUseHdSource={setUseHdSource} />

            {/* Servers */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: COLORS.textDim, fontSize: FONT.xs, textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 10 }}>Chọn Server</p>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                {episodes.map((srv, idx) => (
                  <button key={idx} onClick={() => { setSelectedServer(idx); if (srv.server_data[0]) { setSelectedEpisode(srv.server_data[0]); setSelectedEpisodeIdx(0); setUseHdSource(false); setHdSource(null); } }}
                    style={{ padding: "10px 18px", borderRadius: RADIUS.full, background: selectedServer === idx ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})` : "rgba(255,255,255,0.08)", color: selectedServer === idx ? "#000" : COLORS.text, border: `1px solid ${selectedServer === idx ? COLORS.accent : COLORS.border}`, fontSize: FONT.sm, fontWeight: selectedServer === idx ? 700 : 500, cursor: "pointer", fontFamily: FONT.family }}>
                    {srv.server_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes */}
            <div>
              <p style={{ color: COLORS.textDim, fontSize: FONT.xs, textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 10 }}>Chọn Tập</p>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, maxHeight: 320, overflow: "auto" }}>
                {episodes[selectedServer]?.server_data.map((ep, idx) => (
                  <button key={idx} onClick={() => goTo(idx)}
                    style={{ minWidth: 60, padding: "10px 16px", borderRadius: 10, background: selectedEpisode?.slug === ep.slug ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})` : "rgba(255,255,255,0.05)", color: selectedEpisode?.slug === ep.slug ? "#000" : COLORS.text, border: `1px solid ${selectedEpisode?.slug === ep.slug ? COLORS.accent : COLORS.border}`, fontSize: FONT.sm, fontWeight: selectedEpisode?.slug === ep.slug ? 700 : 500, cursor: "pointer", fontFamily: FONT.family }}>
                    {ep.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* HD Source Sub-component */
function HDSourcePanel({ tmdbId, tmdbType, movieSlug, hdSource, useHdSource, setHdSource, setUseHdSource }: { tmdbId?: string; tmdbType?: string; movieSlug: string; hdSource: string | null; useHdSource: boolean; setHdSource: (s: string | null) => void; setUseHdSource: (b: boolean) => void }) {
  return (
    <div style={{ padding: 16, background: "rgba(255,216,117,0.05)", border: `1px solid rgba(255,216,117,0.2)`, borderRadius: RADIUS.md, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap" as const, gap: 8 }}>
        <span style={{ color: COLORS.accent, fontSize: FONT.sm, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "1px" }}>💎 Nguồn HD/4K</span>
        {useHdSource && <button onClick={() => { setUseHdSource(false); setHdSource(null); }} style={{ padding: "6px 14px", borderRadius: RADIUS.full, background: "rgba(255,100,100,0.2)", color: "#ff6b6b", border: "1px solid rgba(255,100,100,0.3)", fontSize: FONT.xs, cursor: "pointer", fontFamily: FONT.family }}>✕ Tắt HD</button>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
        {STREAMING_SOURCES.map((src) => (
          <button key={src.id} disabled={!tmdbId}
            onClick={() => { if (tmdbId && src.getMovieUrl) { const url = tmdbType === "tv" && src.getTvUrl ? src.getTvUrl(tmdbId, 1, 1) : src.getMovieUrl(tmdbId); setHdSource(url); } else if (src.getMovieUrl) { setHdSource(src.getMovieUrl(movieSlug)); } setUseHdSource(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ padding: "8px 14px", borderRadius: RADIUS.full, background: useHdSource && hdSource?.includes(src.id) ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})` : "rgba(255,255,255,0.08)", color: useHdSource && hdSource?.includes(src.id) ? "#000" : COLORS.text, border: `1px solid ${COLORS.border}`, fontSize: FONT.xs, fontWeight: 600, cursor: tmdbId ? "pointer" : "default", opacity: tmdbId ? 1 : 0.4, fontFamily: FONT.family }}>
            {src.icon} {src.name} [{src.quality}]
          </button>
        ))}
      </div>
      {!tmdbId && <p style={{ color: "#f0a500", fontSize: FONT.xs, marginTop: 8 }}>⚠️ Không có TMDB ID</p>}
    </div>
  );
}
