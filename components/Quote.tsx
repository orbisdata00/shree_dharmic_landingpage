import { Mandala } from "./ui";

export default function Quote() {
  return (
    <section className="quote">
      <Mandala className="quote__mandala" />
      <div className="container quote__inner reveal">
        <span className="quote__mark" aria-hidden="true">“</span>
        <blockquote>
          <p>When tradition becomes an experience,<br />every story becomes a journey within.</p>
          <footer>— Shree Dharmic Leela</footer>
        </blockquote>
      </div>
    </section>
  );
}
