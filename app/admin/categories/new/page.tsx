// app/admin/categories/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "../_components/CategoryForm";

export default function NewCategoryPage() {
  const router = useRouter();

  return (
    <div>
      <Link
        href="/admin/categories"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux catégories
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouvelle catégorie</h1>
      <CategoryForm
        onSuccess={(category) =>
          router.push(`/admin/categories/${category.id}`)
        }
      />
    </div>
  );
}
