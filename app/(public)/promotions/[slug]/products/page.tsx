// app/(public)/promotions/[slug]/products/page.tsx
import type { Metadata } from "next";
import { fetchPublic } from "@/lib/api-server";
import { PromotionProductsPageClient } from "./PromotionProductsPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await fetchPublic<{ name: string }>(
    `/promotions/slug/${slug}`,
  );

  return {
    title: promotion
      ? `Produits — ${promotion.name} — E-Store`
      : "Produits en promotion — E-Store",
  };
}

export default async function PromotionProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PromotionProductsPageClient slug={slug} />;
}
