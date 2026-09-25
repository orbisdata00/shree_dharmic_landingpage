"use client";

import { useSnapCarousel } from "./useSnapCarousel";

const LEELAS = [
  { title: "Krishna Leela", img: "leela-krishna.jpg", alt: "Manipuri Rasa Lila dancers portraying Krishna and the gopis", text: "The playful, loving pastimes of Shri Krishna — from Vrindavan’s Raas to the wisdom of the Gita." },
  { title: "Ram Leela", img: "leela-ram.jpg", alt: "Ramlila performers in royal costume on a painted stage", text: "The journey of Maryada Purushottam Shri Ram — dharma, duty and devotion brought alive on stage." },
  { title: "Shiv Leela", img: "leela-shiv.jpg", alt: "Chola-era bronze sculpture of Shiva as Nataraja, the cosmic dancer", text: "The cosmic dance of Mahadev — creation, preservation and dissolution in a single divine rhythm." },
  { title: "Divine Stories", img: "leela-stories.jpg", alt: "Two Kathakali artists performing a dramatic epic scene", text: "Epics and Puranic tales retold through classical theatre, katha and expressive performance." },
  { title: "Bhakti & Celebration", img: "leela-bhakti.jpg", alt: "A golden, ornately decorated pandal with the idol of Maa Durga", text: "Festivals of light, colour and song where the whole community gathers in devotion." },
  { title: "Braj Holi Leela", img: "leela-holi.jpg", alt: "Clouds of coloured powder during Lathmar Holi in Braj", text: "The colours of Barsana and Nandgaon — Radha and Krishna’s joyous festival of spring." },
];

export default function LeelaCarousel() {
  const { trackRef, cardRef, active, atStart, atEnd, dragging, goTo, onKeyDown } = useSnapCarousel();

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
            <article key={l.title} ref={cardRef(i)} className={`l-card${i === active ? " is-active" : ""}`}>
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
