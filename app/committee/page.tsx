import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import Heritage from "@/components/Heritage";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Committee - ${BRAND.name}`,
  description: `The heritage and committee of the ${BRAND.name}.`,
  alternates: { canonical: "/committee" },
};

export default function CommitteePage() {
  return (
    <SubPage
      label="॥ समिति ॥"
      title="Our"
      accent="Committee"
      text="The people and the heritage that carry this parampara forward."
      image="/assets/img/g-aarti.jpg"
    >
      <Heritage />
    </SubPage>
  );
}
