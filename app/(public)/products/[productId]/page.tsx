// app/(public)/products/[productId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { ProductGallery } from "@/components/ProductGallery";
import { VariantSelector } from "@/components/VariantSelector";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PriceDisplay } from "@/components/PriceDisplay";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ReviewsSection } from "@/components/ReviewsSection";
import type { Product, Variant } from "@/lib/types";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedVariant(null);
    apiClient
      .get<Product>(`/product/${productId}`)
      .then((p) => {
        setProduct(p);
        // Si le produit n'a qu'une seule variante active, on la présélectionne
        const active = p.variants.filter((v) => v.isActive);
        if (active.length === 1) setSelectedVariant(active[0]);
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

  const activeVariants = product.variants.filter((v) => v.isActive);
  const requiresVariant = activeVariants.length > 0;
  const displayImages = selectedVariant?.images.length
    ? selectedVariant.images
    : product.images;
  const displayPrice = selectedVariant?.price ?? product.price;

  return (
    <div>
      <Breadcrumb
        items={[
          {
            label: product.category.name,
            href: `/categories/${product.category.slug}`,
          },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={displayImages} />

        <div>
          {product.brand && (
            <p className="mb-1 text-sm text-gray-400">{product.brand}</p>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">
            {product.name}
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            SKU : {selectedVariant?.sku ?? product.sku}
          </p>

          <div className="mt-4">
            <PriceDisplay
              price={displayPrice}
              pricing={selectedVariant ? undefined : product.pricing}
              size="lg"
            />
          </div>

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          )}

          {requiresVariant && (
            <div className="mt-6">
              <VariantSelector
                variants={activeVariants}
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
            </div>
          )}

          <div className="mt-6">
            <AddToCartButton
              product={product}
              selectedVariant={selectedVariant}
              requiresVariant={requiresVariant}
            />
          </div>

          {product.attributeValues.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="mb-3 text-sm font-medium">Caractéristiques</h2>
              <dl className="space-y-1.5 text-sm">
                {product.attributeValues.map((av) => (
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
