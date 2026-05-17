import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoPhim TV — Xem Phim Trên Tivi",
  description:
    "Phiên bản RoPhim tối ưu cho Smart TV. Giao diện đơn giản, dễ dùng trên màn hình lớn.",
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
          `,
        }}
      />
      <div className="tv-root">
        {/* TV Header */}
        <TVHeaderWrapper />
        {/* Page content with top padding for fixed header */}
        <main style={{ paddingTop: "110px" }}>{children}</main>
      </div>
    </>
  );
}

// Separate client component wrapper for the header
import TVHeader from "./_components/TVHeader";

function TVHeaderWrapper() {
  return <TVHeader />;
}
