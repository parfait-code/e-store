// app/(public)/products/[productId]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";
import { ProductGallery } from "@/components/ProductGallery";
import { VariantSelector } from "@/components/VariantSelector";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { QuantitySelector } from "@/components/QuantitySelector";
import { PriceDisplay } from "@/components/PriceDisplay";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ReviewsSection } from "@/components/ReviewsSection";
import type { Product, ProductCombination } from "@/lib/types";

function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-4 w-64 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square w-full rounded-lg bg-gray-100" />
        <div>
          <div className="h-7 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
          <div className="mt-4 h-8 w-32 rounded bg-gray-200" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-5/6 rounded bg-gray-100" />
            <div className="h-3 w-2/3 rounded bg-gray-100" />
          </div>
          <div className="mt-6 h-10 w-full max-w-xs rounded bg-gray-100" />
          <div className="mt-6 h-12 w-full rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [combinations, setCombinations] = useState<ProductCombination[]>([]);
  const [selectedCombination, setSelectedCombination] =
    useState<ProductCombination | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mainCtaRef = useRef<HTMLDivElement>(null);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(true);

  useEffect(() => {
    setSelectedCombination(null);
    setQuantity(1);
    Promise.all([
      apiClient.get<Product>(`/product/${productId}`),
      apiClient
        .get<ProductCombination[]>(`/product/${productId}/combinations`)
        .then((res) => (Array.isArray(res) ? res : []))
        .catch(() => []),
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

  useEffect(() => {
    const el = mainCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsMainCtaVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading, product?.id]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
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
  const attributeValues = Array.isArray(product.attributeValues)
    ? product.attributeValues
    : [];
  const showFloatingCta = !isLoading && !isMainCtaVisible;

  const stock = selectedCombination
    ? (Array.isArray(selectedCombination.inventory)
        ? selectedCombination.inventory
        : []
      ).reduce((sum, inv) => sum + inv.quantity, 0)
    : undefined;

  return (
    <div className="pb-24">
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

          <div ref={mainCtaRef} className="mt-6">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <QuantitySelector
                quantity={quantity}
                onChange={setQuantity}
                max={stock}
              />
              <WishlistButton
                productId={product.id}
                combinationId={selectedCombination?.id ?? null}
              />
            </div>

            <div className="mt-3 flex items-center gap-3 lg:mt-0">
              <div className="hidden lg:block">
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                  max={stock}
                />
              </div>
              <AddToCartButton
                product={product}
                selectedCombination={selectedCombination}
                requiresCombination={requiresCombination}
                quantity={quantity}
                onQuantityChange={setQuantity}
                hideQuantitySelector
              />
              <div className="hidden lg:block">
                <WishlistButton
                  productId={product.id}
                  combinationId={selectedCombination?.id ?? null}
                />
              </div>
            </div>
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

      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-transform duration-200 ${
          showFloatingCta
            ? "translate-y-0"
            : "pointer-events-none translate-y-full"
        }`}
      >
        <AddToCartButton
          product={product}
          selectedCombination={selectedCombination}
          requiresCombination={requiresCombination}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      </div>
    </div>
  );
}
