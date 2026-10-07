import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import Newsletter from "@/components/Newsletter";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Contact - ${BRAND.name}`,
  description: `Get in touch with the ${BRAND.name} and subscribe for updates.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <SubPage
      label="॥ संपर्क ॥"
      title="Contact"
      accent="Us"
      text="Stay connected with the committee and receive updates on upcoming Leelas."
      image="/assets/img/g-lamp.jpg"
    >
      <Newsletter />
    </SubPage>
  );
}
