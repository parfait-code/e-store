// app/admin/products/[productId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Product } from "@/lib/types";
import { ProductWizard } from "../_components/ProductWizard";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Product>(`/product/${productId}`)
      .then(setProduct)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) {
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  }

  if (error || !product) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Produit introuvable."}
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
