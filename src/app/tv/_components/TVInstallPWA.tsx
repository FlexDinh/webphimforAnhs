"use client";

import { useEffect, useState, useCallback } from "react";
import { COLORS, FONT, RADIUS } from "./TVStyles";

/**
 * PWA Install Prompt component for TV
 * Shows an install button when the browser supports it,
 * and a manual instruction banner otherwise.
 */
export default function TVInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches
    ) {
      setInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If no prompt after 3s, show manual instructions
    const timer = setTimeout(() => {
      if (!deferredPrompt) {
        setShowManual(true);
        setShowBanner(true);
      }
    }, 3000);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    // Don't show again for this session
    try {
      sessionStorage.setItem("rophim-tv-pwa-dismissed", "1");
    } catch {}
  }, []);

  // Don't render if dismissed this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem("rophim-tv-pwa-dismissed") === "1") {
        setShowBanner(false);
      }
    } catch {}
  }, []);

  if (installed || !showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        background: "linear-gradient(135deg, #1a1c2e 0%, #252840 100%)",
        border: `1px solid ${COLORS.accent}40`,
        borderRadius: RADIUS.lg,
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${COLORS.accent}20`,
        maxWidth: "700px",
        width: "90%",
        fontFamily: FONT.family,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: RADIUS.md,
          background: `linear-gradient(135deg, ${COLORS.accent}, #f0a030)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          flexShrink: 0,
        }}
      >
        📺
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: "4px",
          }}
        >
          Cài đặt RoPhim TV
        </div>
        <div
          style={{
            fontSize: "14px",
            color: COLORS.textDim,
            lineHeight: 1.4,
          }}
        >
          {deferredPrompt
            ? "Thêm vào màn hình chính để xem phim nhanh hơn, không cần mở trình duyệt!"
            : "Mở Menu trình duyệt → chọn \"Thêm vào màn hình chính\" để cài app"}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            style={{
              padding: "12px 24px",
              borderRadius: RADIUS.full,
              background: COLORS.accent,
              color: "#000",
              border: "none",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
            }}
          >
            Cài đặt
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            padding: "12px 16px",
            borderRadius: RADIUS.full,
            background: "rgba(255,255,255,0.1)",
            color: COLORS.textDim,
            border: "none",
            fontSize: "14px",
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
          }}
        >
          Để sau
        </button>
      </div>
    </div>
  );
}
