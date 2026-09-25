import type { CSSProperties } from "react";

/** Staggered animation delay, consumed by `.reveal` / `.fade-up` via `--d`. */
export const delay = (d: string) => ({ "--d": d }) as CSSProperties;

/** Diya (oil lamp) mark used in the brand, badges and newsletter. */
export function DiyaMark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path className="flame" d="M32 6c6 9 9 15 9 20a9 9 0 0 1-18 0c0-5 3-11 9-20z" />
      <path d="M6 38h52c-3 11-13 18-26 18S9 49 6 38z" />
    </svg>
  );
}

/* ---------- Mandala artwork (generated SVG) ---------- */
function mandalaSVG() {
  const c = 100;
  const parts: string[] = [];
  const ring = (n: number, fn: (a: number) => string) => {
    for (let i = 0; i < n; i++) parts.push(fn((360 / n) * i));
  };
  const rot = (a: number, s: string) => `<g transform="rotate(${a} ${c} ${c})">${s}</g>`;

  [96, 92, 70, 50, 30, 12].forEach((r) => parts.push(`<circle cx="${c}" cy="${c}" r="${r}"/>`));
  // outer scallops
  ring(32, (a) => rot(a, `<path d="M${c - 9} ${c - 92} Q${c} ${c - 104} ${c + 9} ${c - 92}"/>`));
  // large petals
  ring(16, (a) => rot(a, `<path d="M${c} ${c - 50} C${c + 12} ${c - 62} ${c + 10} ${c - 80} ${c} ${c - 90} C${c - 10} ${c - 80} ${c - 12} ${c - 62} ${c} ${c - 50}Z"/><path d="M${c} ${c - 56} L${c} ${c - 82}"/>`));
  // dots
  ring(32, (a) => rot(a + 5.6, `<circle cx="${c}" cy="${c - 81}" r="1.4" class="f"/>`));
  // middle lotus
  ring(12, (a) => rot(a, `<path d="M${c} ${c - 30} C${c + 14} ${c - 38} ${c + 12} ${c - 58} ${c} ${c - 68} C${c - 12} ${c - 58} ${c - 14} ${c - 38} ${c} ${c - 30}Z"/>`));
  ring(24, (a) => rot(a, `<path d="M${c} ${c - 50} L${c + 6.5} ${c - 70} "/>`));
  // inner star petals
  ring(8, (a) => rot(a, `<path d="M${c} ${c - 12} C${c + 8} ${c - 18} ${c + 7} ${c - 26} ${c} ${c - 30} C${c - 7} ${c - 26} ${c - 8} ${c - 18} ${c} ${c - 12}Z"/>`));
  ring(16, (a) => rot(a, `<circle cx="${c}" cy="${c - 40}" r="2"/>`));
  parts.push(`<circle cx="${c}" cy="${c}" r="4" class="f"/>`);

  return `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width=".6" aria-hidden="true" focusable="false"><style>.f{fill:currentColor;stroke:none}</style>${parts.join("")}</svg>`;
}
const MANDALA = mandalaSVG();

/** Decorative rotating mandala; styled per-section through `className`. */
export function Mandala({ className }: { className: string }) {
  return <div className={className} data-mandala="" aria-hidden="true" dangerouslySetInnerHTML={{ __html: MANDALA }} />;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
