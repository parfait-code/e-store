// app/(public)/products/[productId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { ProductGallery } from "@/components/ProductGallery";
import { VariantSelector } from "@/components/VariantSelector";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { PriceDisplay } from "@/components/PriceDisplay";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ReviewsSection } from "@/components/ReviewsSection";
import type { Product, ProductCombination } from "@/lib/types";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [combinations, setCombinations] = useState<ProductCombination[]>([]);
  const [selectedCombination, setSelectedCombination] =
    useState<ProductCombination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCombination(null);
    Promise.all([
      apiClient.get<Product>(`/product/${productId}`),
      apiClient
        .get<ProductCombination[]>(`/product/${productId}/combinations`)
        .then((res) => (Array.isArray(res) ? res : []))
        .catch(() => []), // pas grave si absent (produit sans variantes)
    ])
      .then(([p, combos]) => {
        setProduct(p);
        const active = combos.filter((c) => c.isActive);
        setCombinations(combos);
        if (active.length === 1) setSelectedCombination(active[0]);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Produit introuvable."}
      </div>
    );
  }

  const activeCombinations = combinations.filter((c) => c.isActive);
  const requiresCombination = activeCombinations.length > 0;
  const displayPrice = selectedCombination?.price ?? product.price;
  // Le backend peut, en théorie, omettre `attributeValues` — on ne suppose
  // jamais sa présence avant d'appeler .length / .map dessus.
  const attributeValues = Array.isArray(product.attributeValues)
    ? product.attributeValues
    : [];

  return (
    <div>
      <Breadcrumb
        items={[
          ...(product.category
            ? [
                {
                  label: product.category.name,
                  href: `/categories/${product.category.slug}`,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Les combinaisons n'ont pas d'images propres — toujours celles du produit */}
        <ProductGallery images={product.images} />

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {product.name}
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            SKU : {selectedCombination?.sku ?? product.sku}
          </p>

          <div className="mt-4">
            <PriceDisplay
              price={displayPrice}
              pricing={selectedCombination ? undefined : product.pricing}
              size="lg"
            />
          </div>

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          )}

          {requiresCombination && (
            <div className="mt-6">
              <VariantSelector
                combinations={activeCombinations}
                selectedCombination={selectedCombination}
                onSelect={setSelectedCombination}
              />
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1">
              <AddToCartButton
                product={product}
                selectedCombination={selectedCombination}
                requiresCombination={requiresCombination}
              />
            </div>
            <WishlistButton
              productId={product.id}
              combinationId={selectedCombination?.id ?? null}
            />
          </div>

          {attributeValues.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="mb-3 text-sm font-medium">Caractéristiques</h2>
              <dl className="space-y-1.5 text-sm">
                {attributeValues.map((av) => (
                  <div key={av.id} className="flex justify-between">
                    <dt className="text-gray-500">
                      {av.attributeDefinition.name}
                    </dt>
                    <dd className="font-medium text-gray-800">
                      {av.value}
                      {av.attributeDefinition.unit
                        ? ` ${av.attributeDefinition.unit}`
                        : ""}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 border-t border-gray-100 pt-10">
        <h2 className="mb-6 text-xl font-semibold">Avis clients</h2>
        <ReviewsSection productId={product.id} />
      </div>
    </div>
  );
}
