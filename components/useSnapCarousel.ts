"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { prefersReducedMotion } from "./ui";

/**
 * Scroll-snap carousel behaviour shared by the Leela and Streaming carousels:
 * active-card tracking, prev/next state, keyboard arrows and mouse drag
 * (touch devices use native swipe).
 */
export function useSnapCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLElement[]>([]);
  const dragged = useRef(false);
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
      down = true; moved = false; dragged.current = false; startX = e.clientX; startScroll = track.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        dragged.current = true;
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

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
  };

  /** Ref callback for card `i`. */
  const cardRef = (i: number) => (el: HTMLElement | null) => { if (el) cardRefs.current[i] = el; };

  /** True if the gesture that just ended was a drag, so a card shouldn't treat it as a click. */
  const wasDragged = () => dragged.current;

  return { trackRef, cardRef, active, atStart, atEnd, dragging, goTo, onKeyDown, wasDragged };
}
