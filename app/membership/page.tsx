import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MembershipPortal from "@/components/membership/MembershipPortal";
import "./membership.css";

export const metadata: Metadata = {
  title: "Apply for Membership — Shree Dharmic Leela",
  description:
    "Become a member of Shree Dharmic Leela: register, verify your mobile number, pay the membership fee securely and receive your membership ID, receipt and membership letter.",
};

export default function MembershipPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar solid />
      <main id="main" className="mship">
        <section className="mship-hero">
          <img className="mship-hero__img" src="/assets/img/g-diyas.jpg" alt="" />
          <div className="mship-hero__overlay" />
          <div className="container mship-hero__content">
            <p className="hero__label">॥ सदस्यता ॥</p>
            <h1>Become a <span>Member</span></h1>
            <p>Join the Shree Dharmic Leela family and help keep our traditions, stories and celebrations alive for generations to come.</p>
          </div>
        </section>

        <section className="mship-body">
          <div className="container">
            <MembershipPortal />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
