"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND, MEMBERSHIP_OPEN } from "@/lib/brand";

// Every menu item opens its own page.
const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/leela", label: "Leela" },
  { href: "/events", label: "Events" },
  { href: "/bhumi-poojan", label: "Bhumi Poojan" },
  { href: "/committee", label: "Committee" },
  { href: "/updates", label: "Updates" },
  { href: "/blog", label: "Blog" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/contact", label: "Contact" },
];

/** `solid`: always use the light, scrolled style (for pages without a dark hero). */
export default function Navbar({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
    const mq = window.matchMedia("(min-width: 1361px)");
    const onMq = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const close = () => setOpen(false);
  const cls = ["nav", (scrolled || solid) && "is-scrolled", open && "is-open"].filter(Boolean).join(" ");

  return (
    <header className={cls} id="nav">
      <div className="nav__inner container">
        <Link href="/" className="brand" aria-label={`${BRAND.name} - home`}>
          <img className="brand__logo" src={BRAND.logo} alt="" width={52} height={52} />
          <span className="brand__text">{BRAND.short}<small>Committee</small></span>
        </Link>

        <nav className="nav__links" id="navLinks" aria-label="Primary">
          {LINKS.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={isActive ? "is-active" : undefined} aria-current={isActive ? "page" : undefined} onClick={close}>
                {label}
              </Link>
            );
          })}
          {MEMBERSHIP_OPEN && (
            <Link href="/membership" className="btn btn--primary nav__cta-mobile" onClick={close}>Apply Membership</Link>
          )}
        </nav>

        {MEMBERSHIP_OPEN && <Link href="/membership" className="btn btn--primary btn--sm nav__cta">Apply Membership</Link>}

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
