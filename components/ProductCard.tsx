// components/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const images = Array.isArray(product.images) ? product.images : [];
  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff size={32} className="text-gray-300" />
          </div>
        )}
        {product.pricing?.hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
            -{product.pricing.discountPercentage}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category?.name && (
          <span className="text-xs text-gray-400">{product.category.name}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          <PriceDisplay
            price={product.price}
            pricing={product.pricing}
            size="sm"
          />
        </div>
      </div>
    </Link>
  );
}
