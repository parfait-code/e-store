// app/(public)/promotions/PromotionsListingClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Tag } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";
import { formatDate } from "@/lib/format";
import { useActivePromotions } from "@/lib/queries/shop/usePromotions";
import type { PromotionPublic } from "@/lib/types";

function PromotionListCard({ promo }: { promo: PromotionPublic }) {
  const images = Array.isArray(promo.images) ? promo.images : [];

  return (
    <Link
      href={`/promotions/${promo.slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-3/1 w-full overflow-hidden bg-gray-100">
        {images[0] ? (
          <Image
            src={images[0]}
            alt={promo.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 bg-gray-900 px-4 text-center">
            <Tag size={20} className="text-white/70" />
            <span className="text-base font-semibold text-white">
              {promo.name}
            </span>
          </div>
        )}
      </div>
      {images.length > 0 && (
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900">{promo.name}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Jusqu'au {formatDate(promo.endDate)}
          </p>
        </div>
      )}
    </Link>
  );
}

export function PromotionsListingClient() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useActivePromotions({
    page,
    limit: 12,
  });
  const promotions = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <Breadcrumb items={[{ label: "Promotions" }]} />
      <h1 className="mb-6 text-xl font-semibold">Promotions</h1>

      {isError ? (
        <p className="text-sm text-red-600">
          Impossible de charger les promotions pour le moment.
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : promotions.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune promotion en cours pour le moment.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {promotions.map((promo) => (
              <PromotionListCard key={promo.id} promo={promo} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
