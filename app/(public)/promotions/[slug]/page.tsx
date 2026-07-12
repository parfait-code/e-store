// app/(public)/promotions/[slug]/page.tsx
import type { Metadata } from "next";
import { PromotionPageClient } from "./PromotionPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function fetchPromotionForMetadata(slug: string) {
  try {
    const res = await fetch(`${BASE_URL}/promotions/slug/${slug}`, {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    if (!json.status) return null;
    return json.data as { name: string; description: string | null };
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
