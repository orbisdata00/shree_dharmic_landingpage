import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts are loaded from Google Fonts exactly as in the original static site (same stylesheet and
// unicode-range subsets). next/font is intentionally not used: under Turbopack it always inserts
// a metric-adjusted Arial fallback ahead of the CSS stack, which changes glyphs Poppins lacks (e.g. "→").
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Poppins:wght@300;400;500;600&family=Tiro+Devanagari+Hindi&display=swap";

export const metadata: Metadata = {
  title: "Shree Dharmic Leela — Experience the Divine",
  description:
    "Shree Dharmic Leela brings timeless stories, spiritual traditions, and cultural expressions to life through devotion, creativity, and meaningful experiences.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF7ED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
