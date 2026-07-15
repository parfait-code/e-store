// app/(public)/promotions/page.tsx
import type { Metadata } from "next";
import { PromotionsListingClient } from "./PromotionsListingClient";

export const metadata: Metadata = {
  title: "Promotions — E-Store",
  description: "Découvrez toutes nos promotions en cours.",
};

export default function PromotionsListingPage() {
  return <PromotionsListingClient />;
}
