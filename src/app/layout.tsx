import type { Metadata, Viewport } from 'next';
import "./globals.css";
import ClientLayout from "@/component/ClientLayout";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C41E3A', // Tet Red
};

export const metadata: Metadata = {
  metadataBase: new URL("https://webphimfor-anhs.vercel.app"),
  title: "WebForAnhs - Xem Phim Online Miễn Phí | Chúc Mừng Năm Mới 🧧",
  description: "WebForAnhs - Trang xem phim online chất lượng cao miễn phí. Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K, Vietsub, thuyết minh.",
  keywords: "xem phim, phim online, phim miễn phí, phim hay, phim HD, phim 4K, phim Vietsub, phim thuyết minh, phim chiếu rạp, phim bộ, phim lẻ, WebForAnhs",
  authors: [{ name: "WebForAnhs" }],
  openGraph: {
    type: "website",
    url: "https://webphimfor-anhs.vercel.app/",
    title: "WebForAnhs - Xem Phim Online Miễn Phí | Chúc Mừng Năm Mới 🧧",
    description: "WebForAnhs - Trang xem phim online chất lượng cao miễn phí. Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K.",
    images: ["/logo.svg"],
    locale: "vi_VN",
    siteName: "WebForAnhs",
  },
  twitter: {
    card: "summary_large_image",
    site: "@WebForAnhs",
    title: "WebForAnhs - Xem Phim Online Miễn Phí | Chúc Mừng Năm Mới 🧧",
    description: "WebForAnhs - Trang xem phim online chất lượng cao miễn phí. Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K.",
    images: ["/logo.svg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.svg",
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
        <link rel="preconnect" href="https://embed.su" />

        {/* DNS Prefetch for faster lookups */}
        <link rel="dns-prefetch" href="https://phimapi.com" />
        <link rel="dns-prefetch" href="https://img.ophim1.com" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />

        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/logo.svg" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
