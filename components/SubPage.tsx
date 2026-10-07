import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollEffects from "./ScrollEffects";

/** Shell for the standalone menu pages (/about, /leela, …): banner hero, the section, footer. */
export default function SubPage({
  label,
  title,
  accent,
  text,
  image,
  children,
}: {
  label: string;
  title: string;
  accent: string;
  text: string;
  image: string;
  children: ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar solid />
      <main id="main">
        <section className="page-hero">
          <img className="page-hero__img" src={image} alt="" />
          <div className="page-hero__overlay" />
          <div className="container">
            <p className="hero__label">{label}</p>
            <h1>{title} <span>{accent}</span></h1>
            <p>{text}</p>
          </div>
        </section>
        {children}
      </main>
      <Footer />
      <ScrollEffects />
    </>
  );
}
