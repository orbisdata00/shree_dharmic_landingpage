"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "./ui";

/** Floating golden light particles. Generated after mount so the random values don't cause a hydration mismatch. */
export default function HeroParticles() {
  const [particles, setParticles] = useState<CSSProperties[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const count = window.innerWidth < 680 ? 16 : 30;
    setParticles(
      Array.from({ length: count }, () => {
        const size = 3 + Math.random() * 9;
        return {
          left: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${14 + Math.random() * 16}s`,
          animationDelay: `${-Math.random() * 25}s`,
          "--dx": `${(Math.random() - 0.5) * 160}px`,
          "--o": `${0.35 + Math.random() * 0.55}`,
        } as CSSProperties;
      })
    );
  }, []);

  return (
    <div className="hero__particles" aria-hidden="true">
      {particles.map((style, i) => (
        <span key={i} className="particle" style={style} />
      ))}
    </div>
  );
}
