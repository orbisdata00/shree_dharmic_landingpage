"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "./ui";

/**
 * Page-wide scroll behaviour: fades in `.reveal` elements as they enter the
 * viewport and drifts `[data-parallax]` layers. Renders nothing.
 */
export default function ScrollEffects() {
  useEffect(() => {
    const reduceMotion = prefersReducedMotion();

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window && !reduceMotion) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io!.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => io!.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* ---------- Parallax ---------- */
    if (reduceMotion) return () => io?.disconnect();
    const parallaxEls = document.querySelectorAll<HTMLElement>("[data-parallax]");
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const host = el.parentElement!.getBoundingClientRect();
        if (host.bottom < -100 || host.top > vh + 100) return;
        const speed = parseFloat(el.dataset.parallax!) || 0.1;
        const offset = (host.top + host.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return null;
}
