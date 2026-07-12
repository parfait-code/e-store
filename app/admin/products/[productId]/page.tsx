// app/admin/products/[productId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAdminProduct } from "@/lib/queries/admin/useCatalog";
import { ProductWizard } from "../_components/ProductWizard";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, isError } = useAdminProduct(productId);

  if (isLoading) {
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  }

  if (isError || !product) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Produit introuvable.
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux produits
      </Link>
      <h1 className="mb-6 text-xl font-semibold">
        Modifier « {product.name} »
      </h1>

      <ProductWizard initialProduct={product} />
    </div>
  );
}
