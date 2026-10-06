import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";

// Brand typefaces (per the brand guidelines): Cinzel headings, Inter body, Noto Serif Devanagari
// for Hindi. Loaded from Google Fonts; next/font is intentionally not used: under Turbopack it
// always inserts a metric-adjusted Arial fallback ahead of the CSS stack, which changes glyphs.
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;500;600&display=swap";

export const metadata: Metadata = {
  // Makes relative canonical / Open Graph URLs absolute (link previews on social media need them).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: `${BRAND.name} - ${BRAND.line.replace(/\.$/, "")}`,
  description:
    `${BRAND.name} ${BRAND.place} celebrates the timeless tradition of Leela and the values of dharma, devotion, maryada, truth and community. ${BRAND.blessing}.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF9EE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
      </head>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before
          React hydrates; this ignores attribute differences on <body> only, not its children. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
