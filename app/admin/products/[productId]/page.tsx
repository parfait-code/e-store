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

  if (isLoading && !product) {
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  }

  if (!product) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Produit introuvable.
      </div>
    );
  }

  return (
    <div>
      {isError && (
        <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Impossible de rafraîchir les données du produit — les informations
          affichées peuvent être légèrement obsolètes. Vos dernières actions
          (ex : images) ont bien été enregistrées.
        </div>
      )}
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