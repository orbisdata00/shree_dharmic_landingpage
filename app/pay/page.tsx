import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import PayLink from "@/components/PayLink";
import { BRAND } from "@/lib/brand";
import "../membership/membership.css";
import "../donate/donate.css";
import "./pay.css";

export const metadata: Metadata = {
  title: `Pay - ${BRAND.name}`,
  description: `Pay the ${BRAND.name} securely through Razorpay.`,
  // Each link is private to the person it was sent to.
  robots: { index: false, follow: false },
};

export default function PayPage() {
  return (
    <SubPage
      label="॥ भुगतान ॥"
      title="Secure"
      accent="Payment"
      text="Complete your payment to the committee by UPI, net banking or card, processed securely by Razorpay."
      image="/assets/img/event-leela.jpg"
    >
      <section className="donate pay">
        <div className="container pay__wrap">
          <PayLink />
        </div>
      </section>
    </SubPage>
  );
}
