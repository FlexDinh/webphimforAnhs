import type { Metadata, Viewport } from 'next';
import "./globals.css";
import ClientLayout from "@/component/ClientLayout";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FFD875',
};

export const metadata: Metadata = {
  metadataBase: new URL("https://webphimfor-anhs.vercel.app"),
  title: "RoPhim - Xem Phim Online Miễn Phí | Phim Mới, Vietsub, Thuyết Minh",
  description: "RoPhim là trang xem phim online miễn phí với phim mới cập nhật nhanh, giao diện gọn, hỗ trợ Vietsub và Thuyết minh trên điện thoại lẫn desktop.",
  keywords: "rophim, xem phim, phim online, phim miễn phí, phim mới, phim hay, phim HD, phim 4K, phim Vietsub, phim thuyết minh, phim chiếu rạp, phim bộ, phim lẻ",
  authors: [{ name: "RoPhim" }],
  openGraph: {
    type: "website",
    url: "https://webphimfor-anhs.vercel.app/",
    title: "RoPhim - Xem Phim Online Miễn Phí | Phim Mới, Vietsub, Thuyết Minh",
    description: "RoPhim giúp xem phim nhanh hơn với giao diện tối ưu cho mobile, danh mục rõ ràng và kho phim cập nhật liên tục.",
    images: ["/icons/icon-512.png"],
    locale: "vi_VN",
    siteName: "RoPhim",
  },
  twitter: {
    card: "summary_large_image",
    site: "@RoPhim",
    title: "RoPhim - Xem Phim Online Miễn Phí | Phim Mới, Vietsub, Thuyết Minh",
    description: "RoPhim là nơi xem phim trực tuyến gọn, nhanh và tối ưu cho cả mobile lẫn desktop.",
    images: ["/icons/icon-512.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* iOS & Mobile Optimization */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Preconnect for performance - API & Image domains */}
        <link rel="preconnect" href="https://phimapi.com" />
        <link rel="preconnect" href="https://img.ophim1.com" />
        <link rel="preconnect" href="https://phimimg.com" />
        <link rel="preconnect" href="https://phim.nguonc.com" />
        <link rel="preconnect" href="https://vidsrc.me" />
        <link rel="preconnect" href="https://vidlink.pro" />

        {/* DNS Prefetch for faster lookups */}
        <link rel="dns-prefetch" href="https://phimapi.com" />
        <link rel="dns-prefetch" href="https://img.ophim1.com" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />

        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="RoPhim" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
