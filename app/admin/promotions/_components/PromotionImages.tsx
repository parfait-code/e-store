// app/admin/promotions/_components/PromotionImages.tsx
"use client";

import { apiClient } from "@/lib/api-client";
import type { Promotion } from "@/lib/types";
import { StagedImagesManager } from "@/components/admin/StagedImagesManager";

export function PromotionImages({
  promotion,
  onUpdated,
}: {
  promotion: Promotion;
  onUpdated: (p: Promotion) => void;
}) {
  async function uploadOne(file: File) {
    const formData = new FormData();
    formData.append("images", file);
    const updated = await apiClient.post<Promotion>(
      `/promotions/${promotion.id}/images`,
      formData,
      { isFormData: true },
    );
    onUpdated(updated);
  }

  async function deleteOne(imageUrl: string) {
    const updated = await apiClient.delete<Promotion>(
      `/promotions/${promotion.id}/images`,
      { imageUrl },
    );
    onUpdated(updated);
  }

  const existingImages = promotion.images.map((url) => ({
    key: url,
    url,
  }));

  return (
    <div className="max-w-2xl">
      <h2 className="mb-3 text-sm font-medium">Images</h2>
      <StagedImagesManager
        existingImages={existingImages}
        deleteOne={deleteOne}
        uploadOne={uploadOne}
        helpText="5 fichiers maximum par envoi. Vous pouvez répéter l'opération pour en ajouter davantage — aucune limite totale n'est actuellement imposée par l'API pour une promotion."
      />
    </div>
  );
}
