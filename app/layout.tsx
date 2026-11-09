import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vở Song Ngữ",
  description: "Học tiếng Anh và tiếng Trung từ con số 0: thẻ ghi nhớ lặp lại ngắt quãng, phát âm, luyện nghe.",
  appleWebApp: { capable: true, title: "Vở Song Ngữ", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f4" },
    { media: "(prefers-color-scheme: dark)", color: "#10151b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        {/* Font tải từ Google Fonts lúc chạy: không tốn băng thông Vercel */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;700&display=swap"
        />
      </head>
      <body data-lang="en">{children}</body>
    </html>
  );
}
