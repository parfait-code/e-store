// app/admin/categories/_components/CategoryAssetsUploader.tsx
"use client";

import { useRef, useState, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Category } from "@/lib/types";

interface CategoryAssetsUploaderProps {
  category: Category;
  onUpdated: (category: Category) => void;
}

export function CategoryAssetsUploader({
  category,
  onUpdated,
}: CategoryAssetsUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isDeletingIcon, setIsDeletingIcon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(field: "image" | "icon", file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append(field, file);
      const updated = await apiClient.post<Category>(
        `/categories/${category.id}/assets`,
        formData,
        { isFormData: true },
      );
      onUpdated(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Échec de l'envoi du fichier",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function onFileSelected(
    field: "image" | "icon",
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (file) handleUpload(field, file);
    e.target.value = "";
  }

  async function handleDeleteImage() {
    if (!confirm("Supprimer l'image de la catégorie ?")) return;
    setIsDeletingImage(true);
    try {
      const updated = await apiClient.delete<Category>(
        `/categories/${category.id}/image`,
      );
      onUpdated(updated);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setIsDeletingImage(false);
    }
  }

  async function handleDeleteIcon() {
    if (!confirm("Supprimer l'icône de la catégorie ?")) return;
    setIsDeletingIcon(true);
    try {
      const updated = await apiClient.delete<Category>(
        `/categories/${category.id}/icon`,
      );
      onUpdated(updated);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setIsDeletingIcon(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-3 text-sm font-medium">Image et icône</h2>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-6">
        {/* Image */}
        <div>
          <p className="mb-2 text-xs font-medium text-gray-600">Image</p>
          {category.imageUrl ? (
            <div className="group relative h-24 w-24 overflow-hidden rounded-md border border-gray-200">
              <Image
                src={category.imageUrl}
                alt=""
                fill
                className="object-cover"
              />
              <button
                onClick={handleDeleteImage}
                disabled={isDeletingImage}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50"
              >
                {isDeletingImage ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <X size={12} className="text-red-600" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => imageInputRef.current?.click()}
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
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => onFileSelected("image", e)}
          />
        </div>

        {/* Icône */}
        <div>
          <p className="mb-2 text-xs font-medium text-gray-600">Icône</p>
          {category.iconUrl ? (
            <div className="group relative h-24 w-24 overflow-hidden rounded-md border border-gray-200">
              <Image
                src={category.iconUrl}
                alt=""
                fill
                className="object-contain p-2"
              />
              <button
                onClick={handleDeleteIcon}
                disabled={isDeletingIcon}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50"
              >
                {isDeletingIcon ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <X size={12} className="text-red-600" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => iconInputRef.current?.click()}
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
          )}
          <input
            ref={iconInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => onFileSelected("icon", e)}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        JPEG, PNG, WEBP ou GIF · 5 Mo max · un fichier par champ
      </p>
    </div>
  );
}
