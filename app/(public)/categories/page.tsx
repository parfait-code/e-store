// app/(public)/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, FolderTree } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Category } from "@/lib/types";

export default function CategoriesIndexPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<Category[]>("/categories")
      .then((data) => setCategories(data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Catégories racines uniquement — les sous-catégories apparaissent en
  // sous-titre de leur parent, et restent accessibles depuis la page
  // détail de la catégorie parente.
  const topLevel = categories.filter((c) => c.parentId === null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Catégories" }]} />

      <div className="mb-6">
        <h1 className="text-xl font-semibold">Toutes les catégories</h1>
        <p className="mt-1 text-sm text-gray-500">
          {topLevel.length} catégorie(s) principale(s)
        </p>
      </div>

      {topLevel.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune catégorie disponible.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topLevel.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FolderTree size={32} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-medium text-gray-900">{category.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {category._count.products} produit(s)
                </p>
                {category.children.length > 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    {category.children.map((c) => c.name).join(" · ")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
