// app/admin/promotions/_components/PromotionImages.tsx
"use client";

import { useRef, useState, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Promotion } from "@/lib/types";

export function PromotionImages({
  promotion,
  onUpdated,
}: {
  promotion: Promotion;
  onUpdated: (p: Promotion) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    setIsUploading(true);
    try {
      const updated = await apiClient.post<Promotion>(
        `/promotions/${promotion.id}/images`,
        formData,
        { isFormData: true },
      );
      onUpdated(updated);
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Échec de l'envoi des images",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(imageUrl: string) {
    if (!confirm("Supprimer cette image ?")) return;
    setDeletingUrl(imageUrl);
    try {
      const updated = await apiClient.delete<Promotion>(
        `/promotions/${promotion.id}/images`,
        { imageUrl },
      );
      onUpdated(updated);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Échec de la suppression");
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-3 text-sm font-medium">Images</h2>
      <div className="flex flex-wrap gap-3">
        {promotion.images.map((url) => (
          <div
            key={url}
            className="group relative h-24 w-24 overflow-hidden rounded-md border border-gray-200"
          >
            <Image src={url} alt="" fill className="object-cover" />
            <button
              onClick={() => handleDelete(url)}
              disabled={deletingUrl === url}
              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50"
            >
              {deletingUrl === url ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <X size={12} className="text-red-600" />
              )}
            </button>
          </div>
        ))}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Upload size={18} />
          )}
          <span className="text-xs">Ajouter</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={handleUpload}
        />
      </div>
    </div>
  );
}
