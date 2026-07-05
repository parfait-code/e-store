// app/admin/products/new/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductWizard } from "../_components/ProductWizard";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux produits
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouveau produit</h1>

      <ProductWizard />
    </div>
  );
}
