"use client";

import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/ophimApi";
import type { OPhimMovie } from "@/lib/ophimApi";
import { COLORS, FONT, RADIUS } from "./TVStyles";

interface TVMovieCardProps {
  movie: OPhimMovie;
  width?: string;
  showRating?: boolean;
  rank?: number;
}

export default function TVMovieCard({
  movie,
  width = "180px",
  showRating = true,
  rank,
}: TVMovieCardProps) {
  const router = useRouter();
  const imageUrl = getImageUrl(movie.poster_url || movie.thumb_url);
  const rating = movie.tmdb?.vote_average;

  return (
    <button
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
        }}
      >
        <img
          src={imageUrl}
          alt={movie.name || "Movie"}
          loading="lazy"
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
              width: "32px",
              height: "32px",
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
              fontSize: "16px",
            }}
          >
            {rank}
          </div>
        )}

        {/* Quality badge */}
        {movie.quality && (
          <span
            style={{
              position: "absolute" as const,
              top: "8px",
              right: "8px",
              padding: "3px 8px",
              borderRadius: "4px",
              background: COLORS.accent,
              color: "#000",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {movie.quality}
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
              fontSize: "12px",
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
          color: COLORS.text,
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
