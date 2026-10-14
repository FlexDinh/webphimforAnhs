"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { COLORS, FONT, RADIUS } from "./TVStyles";

const NAV_ITEMS = [
  { label: "Trang chủ", path: "/tv" },
  { label: "Phim mới", path: "/tv/danh-sach/phim-moi" },
  { label: "Phim lẻ", path: "/tv/danh-sach/phim-le" },
  { label: "Phim bộ", path: "/tv/danh-sach/phim-bo" },
  { label: "Anime", path: "/tv/danh-sach/hoat-hinh" },
  { label: "Chiếu rạp", path: "/tv/danh-sach/chieu-rap" },
  { label: "Thuyết minh", path: "/tv/danh-sach/thuyet-minh" },
  { label: "Hàn Quốc", path: "/tv/danh-sach/han-quoc" },
  { label: "Trung Quốc", path: "/tv/danh-sach/trung-quoc" },
  { label: "Âu Mỹ", path: "/tv/danh-sach/au-my" },
];

export default function TVHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/tv/tim-kiem?query=${encodeURIComponent(q)}`);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(11, 13, 19, 0.95)",
        borderBottom: `1px solid ${COLORS.border}`,
        fontFamily: FONT.family,
      }}
    >
      <div
        style={{
          maxWidth: "1760px",
          margin: "0 auto",
          padding: "0 40px",
        }}
      >
        {/* Top row: Logo + Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "76px",
            gap: "24px",
          }}
        >
          {/* Logo */}
          <button
            onClick={() => router.push("/tv")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "36px",
                fontWeight: 900,
                color: COLORS.accent,
                letterSpacing: "-1px",
              }}
            >
              RoPhim
            </span>
            <span
              style={{
                fontSize: "14px",
                color: COLORS.textMuted,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              TV
            </span>
          </button>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
              maxWidth: "520px",
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm phim..."
              style={{
                flex: 1,
                padding: "12px 20px",
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.md,
                color: COLORS.text,
                fontSize: FONT.md,
                outline: "none",
                fontFamily: FONT.family,
                minHeight: "56px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                background: COLORS.accent,
                color: "#000",
                border: "none",
                borderRadius: RADIUS.md,
                fontWeight: 700,
                fontSize: FONT.md,
                cursor: "pointer",
                minHeight: "56px",
                fontFamily: FONT.family,
              }}
            >
              🔍 Tìm
            </button>
          </form>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => router.push("/tv/watchlist")}
              title="Phim đã lưu"
              style={{
                width: "56px",
                height: "56px",
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.md,
                color: COLORS.accent,
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🔖
            </button>

            {/* Link to main site */}
            <button
              onClick={() => router.push("/phimhay")}
              style={{
                padding: "10px 20px",
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.md,
                color: COLORS.textMuted,
                fontSize: FONT.md,
                cursor: "pointer",
                fontFamily: FONT.family,
                minHeight: "56px",
              }}
            >
              Bản Desktop ↗
            </button>
          </div>
        </div>

        {/* Nav row */}
        <nav
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "12px",
            scrollBehavior: "smooth",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                padding: "10px 18px",
                background: isActive(item.path) ? COLORS.accent : "transparent",
                color: isActive(item.path) ? "#000" : COLORS.textMuted,
                border: "none",
                borderRadius: RADIUS.full,
                fontSize: FONT.md,
                fontWeight: isActive(item.path) ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: "52px",
                fontFamily: FONT.family,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
