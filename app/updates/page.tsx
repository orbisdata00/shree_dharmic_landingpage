import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import Streaming from "@/components/Streaming";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Updates - ${BRAND.name}`,
  description: `Live streams and latest updates from the ${BRAND.name}.`,
  alternates: { canonical: "/updates" },
};

export default function UpdatesPage() {
  return (
    <SubPage
      label="॥ समाचार ॥"
      title="Latest"
      accent="Updates"
      text="Live streams, announcements and news from the committee."
      image="/assets/img/g-diyas.jpg"
    >
      <Streaming />
    </SubPage>
  );
}
