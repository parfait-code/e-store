// components/ProductGrid.tsx
import { Loader2, PackageX } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = "Aucun produit trouvé.",
}: ProductGridProps) {
  // Défense en profondeur : composant partagé par plusieurs pages, on ne
  // suppose jamais que `products` est bien un tableau.
  const safeProducts = Array.isArray(products) ? products : [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
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
