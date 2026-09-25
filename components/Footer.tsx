import { DiyaMark } from "./ui";

const LINKS = ["Home", "About", "Leela", "Events", "Gallery", "Contact"];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__border" aria-hidden="true"></div>
      <div className="container footer__grid">
        <div className="footer__brand">
          <a href="#home" className="brand brand--light">
            <DiyaMark className="brand__mark" />
            <span className="brand__text">Shree <em>Dharmic</em> Leela</span>
          </a>
          <p>Celebrating Dharma, Culture &amp; Divine Stories.</p>
          <p className="footer__sanskrit">॥ धर्मो रक्षति रक्षितः ॥</p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <h4>Explore</h4>
          {LINKS.map((l) => <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>)}
        </nav>

       <div className="footer__social">
          <h4>Follow the Journey</h4>
          <div className="socials">
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" className="fill" /></svg></a>
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" /></svg></a>
            <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9l5 3-5 3z" className="fill" /></svg></a>
            <a href="#" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1.1-.5-2-1.4-2.4-2.4l.9-1-1-2z" className="fill" /></svg></a>
          </div>
          <p className="footer__note">Satsang every Sunday · All are welcome</p>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© 2026 Shree Dharmic Leela Committee. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
