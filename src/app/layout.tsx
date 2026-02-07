"use client";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "animate.css";
import "@ant-design/v5-patch-for-react-19";

import "./globals.css";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
// import SettingsPanel from "@/component/SettingsPanel";
import { PreferencesProvider } from "@/lib/usePreferences";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";

const SettingsPanel = dynamic(() => import("@/component/SettingsPanel"), { ssr: false });

config.autoAddCss = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);
  return (
    <html lang="vi">
      <head>
        {/* Primary Meta Tags */}
        <title>RoPhim - Xem Phim Online Miễn Phí | Phim Hay Cả Rổ</title>
        <meta name="title" content="RoPhim - Xem Phim Online Miễn Phí | Phim Hay Cả Rổ" />
        <meta name="description" content="RoPhim - Trang xem phim online chất lượng cao miễn phí. Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K, Vietsub, thuyết minh. Cập nhật liên tục 2024." />
        <meta name="keywords" content="xem phim, phim online, phim miễn phí, phim hay, phim HD, phim 4K, phim Vietsub, phim thuyết minh, phim chiếu rạp, phim bộ, phim lẻ, RoPhim" />
        <meta name="author" content="RoPhim" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="theme-color" content="#191B24" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rophim.me/" />
        <meta property="og:title" content="RoPhim - Xem Phim Online Miễn Phí | Phim Hay Cả Rổ" />
        <meta property="og:description" content="RoPhim - Trang xem phim online chất lượng cao miễn phí. Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K." />
        <meta property="og:image" content="/logo.svg" />
        <meta property="og:locale" content="vi_VN" />
        <meta property="og:site_name" content="RoPhim" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://rophim.me/" />
        <meta property="twitter:title" content="RoPhim - Xem Phim Online Miễn Phí | Phim Hay Cả Rổ" />
        <meta property="twitter:description" content="RoPhim - Trang xem phim online chất lượng cao miễn phí. Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K." />
        <meta property="twitter:image" content="/logo.svg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.svg" />

        {/* Preconnect for performance - API & Image domains */}
        <link rel="preconnect" href="https://phimapi.com" />
        <link rel="preconnect" href="https://img.ophim1.com" />
        <link rel="preconnect" href="https://phimimg.com" />
        <link rel="preconnect" href="https://phim.nguonc.com" />
        <link rel="preconnect" href="https://vidsrc.me" />
        <link rel="preconnect" href="https://embed.su" />

        {/* DNS Prefetch for faster lookups */}
        <link rel="dns-prefetch" href="https://phimapi.com" />
        <link rel="dns-prefetch" href="https://img.ophim1.com" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />

        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <PreferencesProvider>
          {pathname === "/" ? (
            <>{children}</>
          ) : (
            <>
              <Header />
              {children}
              <ToastContainer />
              <Footer />
              <SettingsPanel />
            </>
          )}
        </PreferencesProvider>
      </body>
    </html>
  );
}
