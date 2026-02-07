import type { Metadata } from 'next';
import "./globals.css";
import ClientLayout from "@/component/ClientLayout";

export const metadata: Metadata = {
  title: "RoPhim - Xem Phim Online Miễn Phí | Phim Hay Cả Rổ",
  description: "RoPhim - Trang xem phim online chất lượng cao miễn phí... Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K, Vietsub, thuyết minh. Cập nhật liên tục 2024.",
  keywords: "xem phim, phim online, phim miễn phí, phim hay, phim HD, phim 4K, phim Vietsub, phim thuyết minh, phim chiếu rạp, phim bộ, phim lẻ, RoPhim",
  authors: [{ name: "RoPhim" }],
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
  themeColor: "#191B24",
  openGraph: {
    type: "website",
    url: "https://rophim.me/",
    title: "RoPhim - Xem Phim Online Miễn Phí | Phim Hay Cả Rổ",
    description: "RoPhim - Trang xem phim online chất lượng cao miễn phí. Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K.",
    images: ["/logo.svg"],
    locale: "vi_VN",
    siteName: "RoPhim",
  },
  twitter: {
    card: "summary_large_image",
    site: "@RoPhim",
    title: "RoPhim - Xem Phim Online Miễn Phí | Phim Hay Cả Rổ",
    description: "RoPhim - Trang xem phim online chất lượng cao miễn phí. Kho phim khổng lồ: phim chiếu rạp, phim bộ, phim lẻ HD 4K.",
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
    <html lang="vi">
      <head>
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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
