// app/(public)/promotions/[slug]/products/page.tsx
import type { Metadata } from "next";
import { PromotionProductsPageClient } from "./PromotionProductsPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function fetchPromotionForMetadata(slug: string) {
  try {
    const res = await fetch(`${BASE_URL}/promotions/slug/${slug}`, {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    if (!json.status) return null;
    return json.data as { name: string };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await fetchPromotionForMetadata(slug);

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
