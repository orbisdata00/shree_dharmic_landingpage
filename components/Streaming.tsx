"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSnapCarousel } from "./useSnapCarousel";
import { prefersReducedMotion } from "./ui";

/**
 * YouTube videos shown in the carousel. `id` is the part after `watch?v=` in a
 * YouTube URL. Every video must allow embedding (check with
 * https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>).
 */
const VIDEOS = [
  { id: "pobGhdQc09Y", tag: "Aarti", title: "Ganga Aarti at Dashashwamedh Ghat, Varanasi", channel: "Harish Bali Travels" },
  { id: "5-Xoh7jKVo8", tag: "Bhajan", title: "Achyutam Keshavam — Krishna Bhajan by Alka Yagnik", channel: "Zee Music Devotional" },
  { id: "-SPi601NQpk", tag: "Leela", title: "Ramlila — the traditional theatrical retelling of the Ramayana", channel: "Sangeet Natak Akademi" },
  { id: "S980-z1qx3g", tag: "Stotram", title: "Shiv Tandav Stotram — Shankar Mahadevan", channel: "Times Music Spiritual" },
  { id: "AETFvQonfV8", tag: "Chalisa", title: "Shree Hanuman Chalisa — Hariharan", channel: "T-Series Bhakti Sagar" },
  { id: "_4WmgIyg6rY", tag: "Classical Art", title: "Eye Dancing and India’s Ancient Art of Kathakali", channel: "Great Big Story" },
  { id: "v6vhzmhKfM4", tag: "Aarti", title: "Har Har Gange — Ganga Aarti at Assi Ghat", channel: "Root Stories" },
];
type Video = (typeof VIDEOS)[number];

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

export default function Streaming() {
  const { trackRef, cardRef, active, atStart, atEnd, dragging, goTo, onKeyDown, wasDragged } = useSnapCarousel();
  const [playing, setPlaying] = useState<Video | null>(null);

  const play = (v: Video) => { if (!wasDragged()) setPlaying(v); };

  return (
    <section className="section stream" id="streaming">
      <div className="stream__glow" aria-hidden="true"></div>
      <div className="container stream__head">
        <header className="section-head section-head--left reveal">
          <p className="eyebrow"><span className="stream__dot" aria-hidden="true"></span>Watch · Listen · Experience</p>
          <h2 className="h2">Streaming <em>Now</em></h2>
          <p className="lead">Aarti, bhajans, Leela and classical arts — sacred moments from across Bharat, ready to watch whenever your heart calls.</p>
        </header>
        <div className="carousel__controls reveal">
          <button className="carousel__btn" aria-label="Previous video" disabled={atStart} onClick={() => goTo(active - 1)}>
            <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button className="carousel__btn" aria-label="Next video" disabled={atEnd} onClick={() => goTo(active + 1)}>
            <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="carousel reveal">
        <div
          ref={trackRef}
          className={`carousel__track${dragging ? " is-dragging" : ""}`}
          tabIndex={0}
          aria-label="Videos carousel"
          onKeyDown={onKeyDown}
        >
          {VIDEOS.map((v, i) => (
            <article key={v.id} ref={cardRef(i)} className={`v-card${i === active ? " is-active" : ""}`}>
              <div className="v-card__thumb">
                <img src={thumb(v.id)} alt="" loading="lazy" />
                <span className="v-card__tag">{v.tag}</span>
                <span className="v-card__play" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>
                </span>
              </div>
              <div className="v-card__body">
                <h3>
                  {/* The button's ::after stretches over the whole card, so the full card is clickable */}
                  <button type="button" className="v-card__open" onClick={() => play(v)}>{v.title}</button>
                </h3>
                <p className="v-card__channel">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9l5 3-5 3z" className="fill" /></svg>
                  {v.channel}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="carousel__dots" role="tablist" aria-label="Choose video">
          {VIDEOS.map((v, i) => (
            <button key={v.id} type="button" role="tab" aria-label={v.title} aria-selected={i === active} onClick={() => goTo(i)} />
          ))}
        </div>
      </div>

      <VideoPlayer video={playing} onClose={() => setPlaying(null)} />
    </section>
  );
}

/** Popup YouTube player. The iframe only loads once a video is chosen. */
function VideoPlayer({ video, onClose }: { video: Video | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState<Video | null>(null); // kept during the fade-out
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Open / close with the same fade as the gallery lightbox
  useEffect(() => {
    if (video) {
      lastFocus.current = document.activeElement as HTMLElement;
      setShown(video);
      document.body.style.overflow = "hidden";
      const raf = requestAnimationFrame(() => setIsOpen(true));
      return () => cancelAnimationFrame(raf);
    }
    setIsOpen(false);
    document.body.style.overflow = "";
    lastFocus.current?.focus();
    const t = window.setTimeout(() => setShown(null), prefersReducedMotion() ? 0 : 400);
    return () => window.clearTimeout(t);
  }, [video]);

  useEffect(() => { if (shown) closeRef.current?.focus(); }, [shown]);

  // Escape to close, and keep keyboard focus inside the dialog
  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const f = [...dialogRef.current!.querySelectorAll<HTMLElement>("button, iframe")];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [video, onClose]);

  if (!mounted || !shown) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className={`player${isOpen ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={shown.title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button ref={closeRef} className="lightbox__close" aria-label="Close video" onClick={onClose}>&times;</button>
      <div className="player__inner">
        <div className="player__frame">
          {/* Removed as soon as the dialog starts closing, so playback stops immediately */}
          {video && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${shown.id}?autoplay=1&rel=0&modestbranding=1`}
              title={shown.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}
        </div>
        <div className="player__caption">
          <strong>{shown.title}</strong>
          <span>{shown.channel} · <a href={`https://www.youtube.com/watch?v=${shown.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></span>
        </div>
      </div>
    </div>,
    document.body
  );
}
