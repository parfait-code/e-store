// app/(public)/categories/[slug]/page.tsx
import type { Metadata } from "next";
import { fetchPublic } from "@/lib/api-server";
import { CategoryPageClient } from "./CategoryPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchPublic<{
    name: string;
    description: string | null;
  }>(`/categories/slug/${slug}`);

  if (!category) return { title: "Catégorie — E-Store" };

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
