// app/admin/promotions/[promotionId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Promotion } from "@/lib/types";
import { PromotionWizard } from "../_components/PromotionWizard";

export default function EditPromotionPage() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Promotion>(`/promotions/${promotionId}`)
      .then(setPromotion)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [promotionId]);

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (error || !promotion) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Promotion introuvable."}
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/promotions"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux promotions
      </Link>
      <h1 className="mb-6 text-xl font-semibold">
        Modifier « {promotion.name} »
      </h1>
      <PromotionWizard initialPromotion={promotion} />
    </div>
  );
}
