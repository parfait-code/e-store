// app/admin/categories/[categoryId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAdminCategory } from "@/lib/queries/admin/useCategories";
import { CategoryWizard } from "../_components/CategoryWizard";

export default function EditCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { data: category, isLoading, isError } = useAdminCategory(categoryId);

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (isError || !category) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Catégorie introuvable.
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/categories"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux catégories
      </Link>
      <h1 className="mb-6 text-xl font-semibold">
        Modifier « {category.name} »
      </h1>
      <CategoryWizard initialCategory={category} />
    </div>
  );
}
