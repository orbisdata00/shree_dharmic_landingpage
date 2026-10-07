import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import DonateForm from "@/components/DonateForm";
import { BRAND } from "@/lib/brand";
import "../membership/membership.css";
import "./donate.css";

export const metadata: Metadata = {
  title: `Donate - ${BRAND.name}`,
  description: `Support the ${BRAND.name} with a contribution by UPI, net banking or card, processed securely by Razorpay.`,
  alternates: { canonical: "/donate" },
};

const SUPPORTS = [
  { title: "The Leela", text: "Stage, costumes, lights and sound for the annual Leela." },
  { title: "Festivals & Seva", text: "Aarti, bhandara and celebrations open to all." },
  { title: "Parampara", text: "Carrying a century-old tradition to the next generation." },
];

export default function DonatePage() {
  return (
    <SubPage
      label="॥ दान ॥"
      title="Support the"
      accent="Parampara"
      text="Every contribution, big or small, helps keep the sacred tradition of Leela alive for generations to come."
      image="/assets/img/event-leela.jpg"
    >
      <section className="donate">
        <div className="container donate__grid">
          <DonateForm />

          <aside className="donate-side">
            <p className="donate-eyebrow donate-eyebrow--light">Your seva supports</p>
            <h2>Where your contribution goes</h2>
            <ul>
              {SUPPORTS.map((s) => (
                <li key={s.title}><strong>{s.title}</strong><span>{s.text}</span></li>
              ))}
            </ul>
            <p className="donate-side__line">“{BRAND.line}”</p>
            <p className="donate-side__trust">Secure · Simple · Digital</p>
          </aside>
        </div>
      </section>
    </SubPage>
  );
}
