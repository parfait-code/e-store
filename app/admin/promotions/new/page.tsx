// app/admin/promotions/new/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PromotionWizard } from "../_components/PromotionWizard";

export default function NewPromotionPage() {
  return (
    <div>
      <Link
        href="/admin/promotions"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux promotions
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouvelle promotion</h1>
      <PromotionWizard />
    </div>
  );
}
