"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OPhimMovie } from "@/lib/ophimApi";
import { getImageUrl } from "@/lib/ophimApi";
import { getTVImageUrl } from "@/lib/tvImageUrl";
import { COLORS, FONT, RADIUS } from "./TVStyles";
import { isThuyetMinhMovie } from "@/lib/movieClassification";

interface TVMovieCardProps {
  movie: OPhimMovie & { episode_current?: string; lang?: string };
  width?: string;
  showRating?: boolean;
  rank?: number;
  loading?: "eager" | "lazy";
}

export default function TVMovieCard({
  movie,
  width = "220px",
  showRating = true,
  rank,
  loading = "lazy",
}: TVMovieCardProps) {
  const router = useRouter();
  const posterUrl = useMemo(
    () => getTVImageUrl(getImageUrl(movie.poster_url || movie.thumb_url)),
    [movie.poster_url, movie.thumb_url]
  );
  const fallbackUrl = useMemo(
    () => getTVImageUrl(getImageUrl(movie.thumb_url || movie.poster_url)),
    [movie.poster_url, movie.thumb_url]
  );
  const [imageUrl, setImageUrl] = useState(posterUrl);
  const imageLoadedRef = useRef(false);
  const rating = movie.tmdb?.vote_average;
  const [isFocused, setIsFocused] = useState(false);

  const isTM = useMemo(() => {
    return isThuyetMinhMovie(movie) || !!movie.lang?.toLowerCase().includes("thuyết minh");
  }, [movie]);

  useEffect(() => {
    imageLoadedRef.current = false;
    setImageUrl(posterUrl);
    if (posterUrl === fallbackUrl) return;

    const timer = window.setTimeout(() => {
      if (imageLoadedRef.current) return;
      setImageUrl((current) => (current === posterUrl ? fallbackUrl : current));
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [posterUrl, fallbackUrl]);

  return (
    <button
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={() => router.push(`/tv/phim/${movie.slug}`)}
      style={{
        width,
        flexShrink: 0,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        textAlign: "left" as const,
        color: COLORS.text,
        fontFamily: FONT.family,
        position: "relative" as const,
        outline: "none",
        transform: isFocused ? "scale(1.03)" : "scale(1)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Poster */}
      <div
        style={{
          position: "relative" as const,
          width: "100%",
          paddingBottom: "150%", // 2:3 aspect ratio
          borderRadius: RADIUS.md,
          overflow: "hidden",
          background: "#2a2d3e",
          border: isFocused ? `2px solid ${COLORS.borderFocus}` : "2px solid transparent",
          boxShadow: isFocused ? `0 0 15px ${COLORS.borderFocus}80` : "none",
        }}
      >
        <img
          src={imageUrl}
          alt={movie.name || "Movie"}
          loading={loading}
          fetchPriority={loading === "eager" ? "high" : "auto"}
          onLoad={() => {
            imageLoadedRef.current = true;
          }}
          onError={() => {
            setImageUrl((current) =>
              current !== fallbackUrl ? fallbackUrl : "/placeholder.svg"
            );
          }}
          style={{
            position: "absolute" as const,
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover" as const,
          }}
        />

        {/* Rank badge */}
        {rank !== undefined && (
          <div
            style={{
              position: "absolute" as const,
              top: "8px",
              left: "8px",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background:
                rank <= 3
                  ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`
                  : "rgba(0,0,0,0.7)",
              color: rank <= 3 ? "#000" : COLORS.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "20px",
              zIndex: 2,
            }}
          >
            {rank}
          </div>
        )}

        {/* Top Right Badges */}
        <div style={{ position: "absolute" as const, top: "8px", right: "8px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
          {/* Quality badge */}
          {movie.quality && (
            <span
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                background: COLORS.accent,
                color: "#000",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {movie.quality}
            </span>
          )}

          {/* TM badge */}
          {isTM && (
            <span
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                background: "linear-gradient(135deg, #FF8C00, #FF4500)",
                color: "#FFF",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              TM
            </span>
          )}
        </div>

        {/* Episode current badge */}
        {movie.episode_current && (
          <span
            style={{
              position: "absolute" as const,
              bottom: "8px",
              left: "8px",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "rgba(0,0,0,0.75)",
              color: "#FFF",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            {movie.episode_current}
          </span>
        )}

        {/* Rating */}
        {showRating && rating && rating > 0 && (
          <span
            style={{
              position: "absolute" as const,
              bottom: "8px",
              right: "8px",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "rgba(0,0,0,0.75)",
              color: COLORS.accent,
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            ★ {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          margin: "8px 0 2px",
          fontSize: FONT.sm,
          fontWeight: 600,
          color: isFocused ? COLORS.accent : COLORS.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        }}
      >
        {movie.name || ""}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          margin: 0,
          fontSize: FONT.xs,
          color: COLORS.textDim,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        }}
      >
        {movie.origin_name || ""}{" "}
        {movie.year ? `• ${movie.year}` : ""}
      </p>
    </button>
  );
}
