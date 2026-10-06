"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { prefersReducedMotion } from "./ui";

export type GalleryImage = {
  /** Path under /public, e.g. "/assets/img/bhumi-poojan/bp-01.jpg" */
  src: string;
  /** Smaller version shown in the grid; the full `src` is loaded only in the viewer */
  thumb?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

/** Masonry photo grid with a full-screen lightbox (keyboard, swipe, focus trap). */
export default function Gallery({ images, label = "image" }: { images: GalleryImage[]; label?: string }) {
  const wrap = (i: number) => (i + images.length) % images.length;
  const [index, setIndex] = useState(0);        // target image
  const [shown, setShown] = useState<number | null>(null); // image currently displayed in the lightbox
  const [hidden, setHidden] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const lbRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const swapTimer = useRef<number | undefined>(undefined);
  const touchX = useRef<number | null>(null);

  const show = (i: number, animate: boolean) => {
    const next = wrap(i);
    setIndex(next);
    window.clearTimeout(swapTimer.current);
    if (animate && !prefersReducedMotion()) {
      setSwapping(true);
      swapTimer.current = window.setTimeout(() => { setShown(next); setSwapping(false); }, 200);
    } else {
      setShown(next);
      setSwapping(false);
    }
  };

  const open = (i: number) => {
    lastFocus.current = document.activeElement as HTMLElement;
    show(i, false);
    setHidden(false);
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
    window.setTimeout(() => setHidden(true), prefersReducedMotion() ? 0 : 400);
    lastFocus.current?.focus();
  };

  // Fade in on the frame after the dialog becomes visible, then move focus into it
  useEffect(() => {
    if (hidden) return;
    const raf = requestAnimationFrame(() => setIsOpen(true));
    closeBtnRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, [hidden]);

  // Keyboard: Escape, arrows, and a focus trap while open
  useEffect(() => {
    if (hidden) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(index + 1, true);
      if (e.key === "ArrowLeft") show(index - 1, true);
      if (e.key === "Tab") {
        const f = [...lbRef.current!.querySelectorAll("button")];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  // The lightbox is portalled to the end of <body> (as in the original markup) once mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = shown === null ? null : images[shown];

  return (
    <>
      <div className="masonry">
        {images.map((g, i) => (
          <figure
            key={g.src}
            className="m-item"
            tabIndex={0}
            role="button"
            aria-label={`View ${g.caption ?? `${label} ${i + 1} of ${images.length}`}`}
            onClick={() => open(i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } }}
          >
            <img src={g.thumb ?? g.src} alt={g.alt} width={g.width} height={g.height} loading="lazy" decoding="async" />
            {g.caption && <figcaption>{g.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {mounted && createPortal(
        <div
          ref={lbRef}
          className={`lightbox${isOpen ? " is-open" : ""}`}
          id="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          hidden={hidden}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), true);
            touchX.current = null;
          }}
        >
          <button ref={closeBtnRef} className="lightbox__close" aria-label="Close image viewer" onClick={close}>&times;</button>
          <button className="lightbox__nav lightbox__nav--prev" aria-label="Previous image" onClick={() => show(index - 1, true)}>
            <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <figure className="lightbox__figure">
            {current && (
              <img src={current.src} alt={current.alt} className={swapping ? "is-swapping" : undefined} />
            )}
            <figcaption>
              {current?.caption}
              {shown !== null && <span className="lightbox__count">{shown + 1} / {images.length}</span>}
            </figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--next" aria-label="Next image" onClick={() => show(index + 1, true)}>
            <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>,
      document.body)}
    </>
  );
}
