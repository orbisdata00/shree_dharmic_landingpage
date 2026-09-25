"use client";

import { useEffect, useState } from "react";
import { DiyaMark } from "./ui";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "leela", label: "Leela" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  // Solid background once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open; close on Escape or when resized to desktop
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 981px)");
    const onMq = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  // Active link highlighting
  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
    return () => spy.disconnect();
  }, []);

  const close = () => setOpen(false);
  const cls = ["nav", scrolled && "is-scrolled", open && "is-open"].filter(Boolean).join(" ");

  return (
    <header className={cls} id="nav">
      <div className="nav__inner container">
        <a href="#home" className="brand" aria-label="Shree Dharmic Leela — home">
          <DiyaMark className="brand__mark" />
          <span className="brand__text">Shree <em>Dharmic</em> Leela</span>
        </a>

        <nav className="nav__links" id="navLinks" aria-label="Primary">
          {LINKS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className={active === id ? "is-active" : undefined} onClick={close}>
              {label}
            </a>
          ))}
          <a href="#community" className="btn btn--primary nav__cta-mobile" onClick={close}>Join Us</a>
        </nav>

        <a href="#community" className="btn btn--primary btn--sm nav__cta">Join Us</a>

        <button
          className="nav__toggle"
          id="navToggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="navLinks"
          onClick={() => setOpen((o) => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
