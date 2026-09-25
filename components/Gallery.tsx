"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { prefersReducedMotion } from "./ui";

const IMAGES = [
  { img: "g-diyas.jpg", alt: "Rows of lit clay diyas glowing on Diwali night", caption: "Diyas of Deepavali" },
  { img: "g-meenakshi.jpg", alt: "The gopuram and temple tank of Meenakshi Amman Temple, Madurai", caption: "Meenakshi Temple, Madurai" },
  { img: "g-marigold.jpg", alt: "Close-up of vivid orange marigold garlands", caption: "Marigold offerings" },
  { img: "g-kathakali.jpg", alt: "A Kathakali artist having his green face paint applied", caption: "Kathakali — the art of transformation" },
  { img: "g-aarti.jpg", alt: "A lone priest raising a flaming lamp during aarti at night", caption: "Evening aarti" },
  { img: "g-raas.jpg", alt: "Devotees in yellow and saffron attire at a Raas Leela festival", caption: "Raas Leela festival" },
  { img: "g-lamp.jpg", alt: "An ornate brass oil lamp hanging in a temple", caption: "Temple lamp" },
  { img: "g-hampi.jpg", alt: "The stone chariot temple complex of Vittala Temple, Hampi, reflected in water", caption: "Vittala Temple, Hampi" },
  { img: "g-rangoli.jpg", alt: "A rangoli made of glowing lamps and petals", caption: "The rangoli of lights" },
  { img: "g-chhath.jpg", alt: "Ghats illuminated with lamps along the water during Chhath Puja", caption: "Chhath Puja on the ghats" },
  { img: "g-krishna-float.jpg", alt: "Children dressed as Radha, Krishna and the gopis on a festival float", caption: "Krishna Leela tableau" },
  { img: "g-diya-bokeh.jpg", alt: "A single diya flame against warm bokeh lights", caption: "A single flame" },
  { img: "g-rangoli-diyas.jpg", alt: "Diyas placed around a rangoli on a polished floor", caption: "Rangoli & diyas" },
];
const wrap = (i: number) => (i + IMAGES.length) % IMAGES.length;

export default function Gallery() {
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

  const current = shown === null ? null : IMAGES[shown];

  return (
    <>
      <section className="section gallery" id="gallery">
        <div className="container">
          <header className="section-head reveal">
            <p className="eyebrow">Gallery</p>
            <h2 className="h2">Moments of <em>Light &amp; Devotion</em></h2>
            <div className="ornament" aria-hidden="true"></div>
          </header>

          <div className="masonry" id="gallery-grid">
            {IMAGES.map((g, i) => (
              <figure
                key={g.img}
                className="m-item reveal"
                tabIndex={0}
                role="button"
                aria-label={`View image: ${g.caption}`}
                onClick={() => open(i)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } }}
              >
                <img src={`/assets/img/${g.img}`} alt={g.alt} loading="lazy" />
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

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
              <img src={`/assets/img/${current.img}`} alt={current.alt} className={swapping ? "is-swapping" : undefined} />
            )}
            <figcaption>{current?.caption}</figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--next" aria-label="Next image" onClick={() => show(index + 1, true)}>
            <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>,
      document.body)}
    </>
  );
}
