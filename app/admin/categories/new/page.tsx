// app/admin/categories/new/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryWizard } from "../_components/CategoryWizard";

export default function NewCategoryPage() {
  return (
    <div>
      <Link
        href="/admin/categories"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux catégories
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouvelle catégorie</h1>
      <CategoryWizard />
    </div>
  );
}
