// app/(public)/categories/[slug]/page.tsx
import type { Metadata } from "next";
import { CategoryPageClient } from "../CategoryPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function fetchCategoryForMetadata(slug: string) {
  try {
    const res = await fetch(`${BASE_URL}/categories/slug/${slug}`, {
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
  const category = await fetchCategoryForMetadata(slug);

  if (!category) {
    return { title: "Catégorie — E-Store" };
  }

  return {
    title: `${category.name} — E-Store`,
    description:
      category.description ?? `Découvrez nos produits dans ${category.name}.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryPageClient slug={slug} />;
}
