"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./ui";

const LEELAS = [
  { title: "Krishna Leela", img: "leela-krishna.jpg", alt: "Manipuri Rasa Lila dancers portraying Krishna and the gopis", text: "The playful, loving pastimes of Shri Krishna — from Vrindavan’s Raas to the wisdom of the Gita." },
  { title: "Ram Leela", img: "leela-ram.jpg", alt: "Ramlila performers in royal costume on a painted stage", text: "The journey of Maryada Purushottam Shri Ram — dharma, duty and devotion brought alive on stage." },
  { title: "Shiv Leela", img: "leela-shiv.jpg", alt: "Chola-era bronze sculpture of Shiva as Nataraja, the cosmic dancer", text: "The cosmic dance of Mahadev — creation, preservation and dissolution in a single divine rhythm." },
  { title: "Divine Stories", img: "leela-stories.jpg", alt: "Two Kathakali artists performing a dramatic epic scene", text: "Epics and Puranic tales retold through classical theatre, katha and expressive performance." },
  { title: "Bhakti & Celebration", img: "leela-bhakti.jpg", alt: "A golden, ornately decorated pandal with the idol of Maa Durga", text: "Festivals of light, colour and song where the whole community gathers in devotion." },
  { title: "Braj Holi Leela", img: "leela-holi.jpg", alt: "Clouds of coloured powder during Lathmar Holi in Braj", text: "The colours of Barsana and Nandgaon — Radha and Krishna’s joyous festival of spring." },
];

export default function LeelaCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLElement[]>([]);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  const padLeft = () => parseFloat(getComputedStyle(trackRef.current!).scrollPaddingLeft) || 0;

  /** Index of the card closest to the track's left snap edge. */
  const nearest = () => {
    const x = trackRef.current!.scrollLeft + padLeft();
    let best = 0, bestDist = Infinity;
    cardRefs.current.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - x);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  };

  const goTo = useCallback((i: number) => {
    const track = trackRef.current!;
    const cards = cardRefs.current;
    i = Math.max(0, Math.min(cards.length - 1, i));
    track.scrollTo({ left: cards[i].offsetLeft - padLeft(), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    // at the far end, the last card can't align left — treat it as active
    setActive(end ? cardRefs.current.length - 1 : nearest());
    setAtStart(track.scrollLeft <= 4);
    setAtEnd(end);
  }, []);

  useEffect(() => {
    const track = trackRef.current!;
    const onScroll = () => requestAnimationFrame(sync);
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync);
    sync();

    // Mouse drag to scroll (touch uses native swipe)
    let down = false, moved = false, startX = 0, startScroll = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        track.classList.add("is-dragging"); // applied immediately so snapping stops before React re-renders
        setDragging(true);
      }
      if (moved) track.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove("is-dragging");
        setDragging(false);
        goTo(nearest());
      }
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();

    track.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    track.addEventListener("dragstart", onDragStart);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
      track.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      track.removeEventListener("dragstart", onDragStart);
    };
  }, [goTo, sync]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
  };

  return (
    <section className="section leela" id="leela">
      <div className="leela__glow" aria-hidden="true"></div>
      <div className="container leela__head">
        <header className="section-head section-head--left reveal">
          <p className="eyebrow">Featured Leela</p>
          <h2 className="h2">The Divine <em>Leela</em></h2>
          <p className="lead">Sacred stories told through performance, music and devotion — each one a doorway into the eternal.</p>
        </header>
        <div className="carousel__controls reveal">
          <button className="carousel__btn" data-dir="-1" aria-label="Previous Leela" disabled={atStart} onClick={() => goTo(active - 1)}>
            <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button className="carousel__btn" data-dir="1" aria-label="Next Leela" disabled={atEnd} onClick={() => goTo(active + 1)}>
            <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="carousel reveal" id="leelaCarousel">
        <div
          ref={trackRef}
          className={`carousel__track${dragging ? " is-dragging" : ""}`}
          tabIndex={0}
          aria-label="Leela stories carousel"
          onKeyDown={onKeyDown}
        >
          {LEELAS.map((l, i) => (
            <article
              key={l.title}
              ref={(el) => { if (el) cardRefs.current[i] = el; }}
              className={`l-card${i === active ? " is-active" : ""}`}
            >
              <img src={`/assets/img/${l.img}`} alt={l.alt} loading="lazy" />
              <div className="l-card__body">
                <span className="l-card__num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{l.title}</h3>
                <p>{l.text}</p>
                <a href="#events" className="l-card__link">Explore Leela <span className="arrow">→</span></a>
              </div>
            </article>
          ))}
        </div>
        <div className="carousel__dots" role="tablist" aria-label="Choose Leela">
          {LEELAS.map((l, i) => (
            <button key={l.title} type="button" role="tab" aria-label={l.title} aria-selected={i === active} onClick={() => goTo(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
