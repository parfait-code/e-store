// components/ProductGrid.tsx
import { PackageX } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-square w-full animate-pulse bg-gray-100" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-8 animate-pulse rounded-md bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = "Aucun produit trouvé.",
  skeletonCount = 8,
}: ProductGridProps) {
  const safeProducts = Array.isArray(products) ? products : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-gray-400">
        <PackageX size={32} />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {safeProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
