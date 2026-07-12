// app/(public)/promotions/[slug]/page.tsx
import type { Metadata } from "next";
import { fetchPublic } from "@/lib/api-server";
import { PromotionPageClient } from "./PromotionPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await fetchPublic<{
    name: string;
    description: string | null;
  }>(`/promotions/slug/${slug}`);

  if (!promotion) return { title: "Promotion — E-Store" };

  return {
    title: `${promotion.name} — E-Store`,
    description:
      promotion.description ?? `Découvrez la promotion ${promotion.name}.`,
  };
}

export default async function PromotionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PromotionPageClient slug={slug} />;
}
