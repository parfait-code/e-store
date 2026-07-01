// components/ProductGallery.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);

  // Si la liste d'images change (ex: changement de variante), on revient à la première
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100">
        <ImageOff size={48} className="text-gray-300" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={active.url}
          alt={active.altText ?? ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                i === activeIndex ? "border-gray-900" : "border-transparent"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
