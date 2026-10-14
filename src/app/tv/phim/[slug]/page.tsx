"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import { useParams, useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/ophimApi";
import { getTVImageUrl } from "@/lib/tvImageUrl";
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
import { saveWatchProgress } from "@/lib/movieUtils";
import { isInWatchlist, toggleWatchlist } from "@/lib/watchlistUtils";
import { isThuyetMinhServerName } from "@/lib/movieClassification";

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

  // New states
  const [playerLoading, setPlayerLoading] = useState(true);
  const [playerSlow, setPlayerSlow] = useState(false);
  const [playerBlocked, setPlayerBlocked] = useState(false);
  const [autoSelectNotice, setAutoSelectNotice] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  
  // Auto play next
  const [showAutoPlayOverlay, setShowAutoPlayOverlay] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(8);

  const iframeKey = useRef(0);
  const playerSlowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getUnifiedMovieDetail(slug)
      .then((data) => {
        if (!data.status) { setError("Không tìm thấy phim"); return; }
        setMovie(data);
        
        // Watchlist
        setInWatchlist(isInWatchlist(slug));

        // Auto select server
        let targetServerIdx = 0;
        try {
          const pref = localStorage.getItem("rophim-preferences");
          if (pref) {
            const prefs = JSON.parse(pref);
            if (prefs.preferredServer === "thuyet-minh" && data.episodes?.length > 0) {
              const tmIdx = data.episodes.findIndex((s: any) => isThuyetMinhServerName(s.server_name));
              if (tmIdx >= 0) {
                targetServerIdx = tmIdx;
                setAutoSelectNotice("🎙️ Đã tự động chọn server Thuyết Minh");
                setTimeout(() => setAutoSelectNotice(null), 4000);
              }
            }
          }
        } catch (e) {}

        setSelectedServer(targetServerIdx);
        if (data.episodes?.[targetServerIdx]?.server_data?.[0]) {
          setSelectedEpisode(data.episodes[targetServerIdx].server_data[0]);
          setSelectedEpisodeIdx(0);
        }
      })
      .catch(() => setError("Không thể tải phim"))
      .finally(() => setLoading(false));
  }, [slug]);

  const serverData = movie?.episodes?.[selectedServer]?.server_data || [];
  const hasNext = selectedEpisodeIdx < serverData.length - 1;
  const hasPrev = selectedEpisodeIdx > 0;

  const startPlayerLoad = useCallback(() => {
    setPlayerLoading(true);
    setPlayerSlow(false);
    setPlayerBlocked(false);
    iframeKey.current += 1;
    if (playerSlowTimerRef.current) clearTimeout(playerSlowTimerRef.current);
    playerSlowTimerRef.current = setTimeout(() => {
      setPlayerSlow(true);
    }, 10000);
  }, []);

  const handlePlayerLoaded = useCallback(() => {
    setPlayerLoading(false);
    if (playerSlowTimerRef.current) clearTimeout(playerSlowTimerRef.current);
    setPlayerSlow(false);
  }, []);

  const goTo = useCallback((idx: number) => {
    const ep = serverData[idx];
    if (!ep) return;
    setSelectedEpisode(ep);
    setSelectedEpisodeIdx(idx);
    setUseHdSource(false);
    setHdSource(null);
    startPlayerLoad();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [serverData, startPlayerLoad]);

  const handleNextEpisode = useCallback(() => {
    if (hasNext) goTo(selectedEpisodeIdx + 1);
  }, [hasNext, goTo, selectedEpisodeIdx]);

  const handlePrevEpisode = useCallback(() => {
    if (hasPrev) goTo(selectedEpisodeIdx - 1);
  }, [hasPrev, goTo, selectedEpisodeIdx]);

  // Save watch progress
  useEffect(() => {
    if (!movie || !selectedEpisode) return;

    const saveProgress = (time: number) => {
      saveWatchProgress(
        movie.movie.slug,
        movie.movie.name,
        movie.movie.poster_url || movie.movie.thumb_url,
        time,
        120, // approximate duration
        selectedEpisode.slug,
        selectedEpisode.name
      );
    };

    const interval = setInterval(() => saveProgress(30), 30000);
    saveProgress(1); // Immediate save

    return () => clearInterval(interval);
  }, [movie, selectedEpisode]);

  // Block detection
  useEffect(() => {
    const urlToCheck = useHdSource ? hdSource : selectedEpisode?.link_embed;
    const targetUrl = getSafeEmbedUrl(urlToCheck);
    if (!targetUrl) return;
    startPlayerLoad();

    try {
      const urlObj = new URL(targetUrl.startsWith("//") ? `https:${targetUrl}` : targetUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      
      fetch(urlObj.origin, { mode: 'no-cors', method: 'HEAD', signal: controller.signal })
        .then(() => clearTimeout(timeout))
        .catch((err) => {
          clearTimeout(timeout);
          if (err.name !== 'AbortError') {
            setPlayerBlocked(true);
            setPlayerLoading(false);
            if (playerSlowTimerRef.current) clearTimeout(playerSlowTimerRef.current);
          }
        });
    } catch (e) {}
  }, [selectedEpisode, hdSource, useHdSource, startPlayerLoad]);

  // Auto-play countdown logic
  useEffect(() => {
    if (showAutoPlayOverlay && autoPlayCountdown > 0) {
      autoPlayTimerRef.current = setTimeout(() => {
        setAutoPlayCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showAutoPlayOverlay && autoPlayCountdown === 0) {
      handleNextEpisode();
      setShowAutoPlayOverlay(false);
      setAutoPlayCountdown(8);
    }
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [showAutoPlayOverlay, autoPlayCountdown, handleNextEpisode]);

  const handleWatchlistToggle = () => {
    if (!movie) return;
    const isNowIn = toggleWatchlist({
      slug: movie.movie.slug,
      name: movie.movie.name,
      origin_name: movie.movie.origin_name,
      poster_url: movie.movie.poster_url || movie.movie.thumb_url,
      quality: movie.movie.quality,
      year: movie.movie.year,
      addedAt: Date.now()
    });
    setInWatchlist(isNowIn);
  };

  const handleSwitchServer = () => {
    if (!movie || !movie.episodes) return;
    const nextServerIdx = (selectedServer + 1) % movie.episodes.length;
    setSelectedServer(nextServerIdx);
    const ep = movie.episodes[nextServerIdx]?.server_data?.[selectedEpisodeIdx] || movie.episodes[nextServerIdx]?.server_data?.[0];
    if (ep) {
      setSelectedEpisode(ep);
      setSelectedEpisodeIdx(movie.episodes[nextServerIdx]?.server_data?.[selectedEpisodeIdx] ? selectedEpisodeIdx : 0);
    }
    setUseHdSource(false);
    setHdSource(null);
  };

  if (loading) return (
    <div style={{ ...styles.flexCenter, minHeight: "60vh", flexDirection: "column" as const, gap: "16px" }}>
      <div className="tv-spinner" style={styles.spinner} />
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
      {autoSelectNotice && (
        <div style={{ position: "fixed", top: 20, right: 20, background: COLORS.accent, color: "#000", padding: "12px 24px", borderRadius: RADIUS.md, zIndex: 9999, fontWeight: "bold" }}>
          {autoSelectNotice}
        </div>
      )}

      {/* Player */}
      <div style={{ width: "100%", background: "#000", position: "relative" }}>
        <div style={{ width: "min(100%, calc(80vh * 16 / 9))", maxWidth: "100%", margin: "0 auto", aspectRatio: "16/9", position: "relative" }}>
          {embed ? (
            <>
              {playerBlocked && (
                <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 16 }}>
                  <p style={{ color: COLORS.error, fontSize: FONT.lg, fontWeight: "bold" }}>⚠️ Server này đang bị chặn</p>
                  <button onClick={handleSwitchServer} style={styles.btnPrimary}>Đổi Server Khác</button>
                </div>
              )}
              {playerLoading && !playerBlocked && (
                <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 16 }}>
                  <div style={styles.spinner} />
                  {playerSlow && <p style={{ color: COLORS.accent, fontSize: FONT.md }}>⚠️ Server đang chậm...</p>}
                </div>
              )}
              <iframe
                key={iframeKey.current}
                src={embed}
                style={{ width: "100%", height: "100%", border: "none" }}
                title={m.name}
                allowFullScreen
                allow={PLAYER_IFRAME_ALLOW}
                sandbox={PLAYER_IFRAME_SANDBOX}
                referrerPolicy="no-referrer"
                onLoad={handlePlayerLoaded}
              />

              {showAutoPlayOverlay && (
                <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 24 }}>
                  <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke={COLORS.accent} strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * autoPlayCountdown) / 8} style={{ transition: "stroke-dashoffset 1s linear" }} />
                    </svg>
                    <span style={{ color: "#fff", fontSize: 32, fontWeight: "bold" }}>{autoPlayCountdown}</span>
                  </div>
                  <p style={{ color: "#fff", fontSize: FONT.lg }}>Tự động chuyển tập sau...</p>
                  <div style={{ display: "flex", gap: 16 }}>
                    <button onClick={() => { setShowAutoPlayOverlay(false); setAutoPlayCountdown(8); handleNextEpisode(); }} style={styles.btnPrimary}>▶ Phát ngay</button>
                    <button onClick={() => { setShowAutoPlayOverlay(false); setAutoPlayCountdown(8); }} style={styles.btnSecondary}>✕ Hủy</button>
                  </div>
                </div>
              )}
            </>
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
            {hasPrev && <button onClick={handlePrevEpisode} style={{ ...styles.btnSecondary, padding: "8px 16px", minHeight: 40 }}>← Tập trước</button>}
            {hasNext && (
              <>
                <button onClick={() => setShowAutoPlayOverlay(true)} style={{ ...styles.btnSecondary, padding: "8px 16px", minHeight: 40, border: `1px solid ${COLORS.accent}`, color: COLORS.accent }}>Auto ▶</button>
                <button onClick={handleNextEpisode} style={{ ...styles.btnPrimary, padding: "8px 16px", minHeight: 40, fontSize: FONT.sm }}>Tập sau →</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {/* Movie Info */}
        <div style={{ display: "flex", gap: 30, marginBottom: 40, flexWrap: "wrap" as const }}>
          <div style={{ width: 200, flexShrink: 0 }}>
            <img src={getTVImageUrl(getImageUrl(m.poster_url || m.thumb_url))} alt={m.name} style={{ width: "100%", borderRadius: RADIUS.md }} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>{m.name || ""}</h1>
                <p style={{ fontSize: FONT.lg, color: COLORS.accent, margin: "0 0 16px" }}>{m.origin_name || ""}</p>
              </div>
              <button 
                onClick={handleWatchlistToggle} 
                style={{ ...styles.btnSecondary, padding: "8px 16px", minHeight: 40, background: inWatchlist ? COLORS.accent : "rgba(255,255,255,0.1)", color: inWatchlist ? "#000" : COLORS.text, border: `1px solid ${inWatchlist ? COLORS.accent : COLORS.border}` }}
              >
                {inWatchlist ? "🔖 Đã lưu" : "🔖 Lưu phim"}
              </button>
            </div>
            
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
            {m.content && <div style={{ color: COLORS.textMuted, fontSize: FONT.sm, lineHeight: 1.7, maxHeight: 120, overflow: "auto" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }} />}
          </div>
        </div>

        {/* Episodes Panel */}
        {episodes?.length > 0 && (
          <div style={{ background: COLORS.bgSurface, borderRadius: RADIUS.lg, padding: 24 }}>
            <h2 style={{ fontSize: FONT.lg, fontWeight: 700, color: COLORS.text, marginBottom: 20 }}>▶ Danh sách tập phim</h2>

            {/* HD Sources */}
            <HDSourcePanel tmdbId={m.tmdb?.id} tmdbType={m.tmdb?.type} movieSlug={m.slug} hdSource={hdSource} useHdSource={useHdSource} setHdSource={setHdSource} setUseHdSource={setUseHdSource} selectedEpisodeIdx={selectedEpisodeIdx} startPlayerLoad={startPlayerLoad} />

            {/* Servers */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: COLORS.textDim, fontSize: FONT.xs, textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 10 }}>Chọn Server</p>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                {episodes.map((srv, idx) => (
                  <button key={idx} onClick={() => { setSelectedServer(idx); if (srv.server_data[0]) { setSelectedEpisode(srv.server_data[0]); setSelectedEpisodeIdx(0); setUseHdSource(false); setHdSource(null); startPlayerLoad(); } }}
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
function HDSourcePanel({ tmdbId, tmdbType, movieSlug, hdSource, useHdSource, setHdSource, setUseHdSource, selectedEpisodeIdx, startPlayerLoad }: { tmdbId?: string; tmdbType?: string; movieSlug: string; hdSource: string | null; useHdSource: boolean; setHdSource: (s: string | null) => void; setUseHdSource: (b: boolean) => void; selectedEpisodeIdx: number; startPlayerLoad: () => void }) {
  return (
    <div style={{ padding: 16, background: "rgba(255,216,117,0.05)", border: `1px solid rgba(255,216,117,0.2)`, borderRadius: RADIUS.md, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap" as const, gap: 8 }}>
        <span style={{ color: COLORS.accent, fontSize: FONT.sm, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "1px" }}>💎 Nguồn HD/4K</span>
        {useHdSource && <button onClick={() => { setUseHdSource(false); setHdSource(null); startPlayerLoad(); }} style={{ padding: "6px 14px", borderRadius: RADIUS.full, background: "rgba(255,100,100,0.2)", color: "#ff6b6b", border: "1px solid rgba(255,100,100,0.3)", fontSize: FONT.xs, cursor: "pointer", fontFamily: FONT.family }}>✕ Tắt HD</button>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
        {STREAMING_SOURCES.map((src) => (
          <button key={src.id} disabled={!tmdbId}
            onClick={() => { 
              if (tmdbId && src.getMovieUrl) { 
                const url = tmdbType === "tv" && src.getTvUrl ? src.getTvUrl(tmdbId, 1, selectedEpisodeIdx + 1) : src.getMovieUrl(tmdbId); 
                setHdSource(url); 
              } else if (src.getMovieUrl) { 
                setHdSource(src.getMovieUrl(movieSlug)); 
              } 
              setUseHdSource(true); 
              startPlayerLoad();
              window.scrollTo({ top: 0, behavior: "smooth" }); 
            }}
            style={{ padding: "8px 14px", borderRadius: RADIUS.full, background: useHdSource && hdSource?.includes(src.id) ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})` : "rgba(255,255,255,0.08)", color: useHdSource && hdSource?.includes(src.id) ? "#000" : COLORS.text, border: `1px solid ${COLORS.border}`, fontSize: FONT.xs, fontWeight: 600, cursor: tmdbId ? "pointer" : "default", opacity: tmdbId ? 1 : 0.4, fontFamily: FONT.family }}>
            {src.icon} {src.name} [{src.quality}]
          </button>
        ))}
      </div>
      {!tmdbId && <p style={{ color: "#f0a500", fontSize: FONT.xs, marginTop: 8 }}>⚠️ Không có TMDB ID</p>}
    </div>
  );
}
