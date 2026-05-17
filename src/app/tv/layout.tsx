import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: 1920,
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFD875",
};

export const metadata: Metadata = {
  title: "RoPhim TV — Xem Phim Trên Tivi",
  description:
    "Phiên bản RoPhim tối ưu cho Smart TV. Giao diện đơn giản, dễ dùng trên màn hình lớn.",
  manifest: "/manifest-tv.json",
  appleWebApp: {
    capable: true,
    title: "RoPhim TV",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function TVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 
        Minimal inline CSS for animations that can't be done via style prop.
        We use a <style> tag directly instead of a CSS file to avoid the 
        Tailwind/PostCSS pipeline and @layer compatibility issues.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes tvspin {
              to { transform: rotate(360deg); }
            }
            .tv-spinner {
              animation: tvspin 0.8s linear infinite;
            }
            /* Reset for TV pages — override any leaked Tailwind styles */
            .tv-root, .tv-root * {
              box-sizing: border-box;
            }
            .tv-root {
              min-height: 100vh;
              background: #0B0D13;
              color: #ffffff;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-font-smoothing: antialiased;
            }
            .tv-root img {
              display: block;
            }
            .tv-root button {
              font-family: inherit;
            }
            /* Scrollbar styling for Samsung Tizen */
            .tv-root ::-webkit-scrollbar {
              height: 6px;
              width: 6px;
            }
            .tv-root ::-webkit-scrollbar-track {
              background: transparent;
            }
            .tv-root ::-webkit-scrollbar-thumb {
              background: rgba(255,255,255,0.15);
              border-radius: 3px;
            }
            /* PWA install banner animation */
            @keyframes tvSlideUp {
              from { transform: translateX(-50%) translateY(100px); opacity: 0; }
              to   { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
          `,
        }}
      />

      {/* TV-specific manifest override (replaces root manifest for /tv routes) */}
      <link rel="manifest" href="/manifest-tv.json" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Register TV-specific service worker */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw-tv.js', { scope: '/tv' })
                  .then(function(reg) {
                    // Check for updates periodically
                    setInterval(function() { reg.update(); }, 60 * 60 * 1000);
                  })
                  .catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
              });
            }
          `,
        }}
      />

      <div className="tv-root">
        {/* TV Header */}
        <TVHeaderWrapper />
        {/* Page content with top padding for fixed header */}
        <main style={{ paddingTop: "110px" }}>{children}</main>
        {/* PWA Install Prompt */}
        <TVInstallPWAWrapper />
      </div>
    </>
  );
}

// Separate client component wrapper for the header
import TVHeader from "./_components/TVHeader";

function TVHeaderWrapper() {
  return <TVHeader />;
}

// PWA install prompt wrapper
import TVInstallPWA from "./_components/TVInstallPWA";

function TVInstallPWAWrapper() {
  return <TVInstallPWA />;
}
