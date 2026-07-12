// app/(public)/categories/[slug]/page.tsx
import type { Metadata } from "next";
import { CategoryPageClient } from "../CategoryPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Fetch minimal, dédié au SEO uniquement — ne peut pas réutiliser apiClient
// (basé sur js-cookie, qui accède à `document`, indisponible en server
// component). Route publique, aucune auth nécessaire.
async function fetchCategoryForMetadata(slug: string) {
  try {
    const res = await fetch(`${BASE_URL}/categories/slug/${slug}`, {
      next: { revalidate: 300 }, // aligné sur cache.default_ttl_seconds (5 min par défaut)
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
