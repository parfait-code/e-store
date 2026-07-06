// app/admin/categories/_components/CategoryAssetsUploader.tsx
"use client";

import { apiClient } from "@/lib/api-client";
import type { Category } from "@/lib/types";
import { StagedImagesManager } from "@/components/admin/StagedImagesManager";

interface CategoryAssetsUploaderProps {
  category: Category;
  onUpdated: (category: Category) => void;
}

export function CategoryAssetsUploader({
  category,
  onUpdated,
}: CategoryAssetsUploaderProps) {
  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const updated = await apiClient.post<Category>(
      `/categories/${category.id}/assets`,
      formData,
      { isFormData: true },
    );
    onUpdated(updated);
  }

  async function deleteImage() {
    const updated = await apiClient.delete<Category>(
      `/categories/${category.id}/image`,
    );
    onUpdated(updated);
  }

  async function uploadIcon(file: File) {
    const formData = new FormData();
    formData.append("icon", file);
    const updated = await apiClient.post<Category>(
      `/categories/${category.id}/assets`,
      formData,
      { isFormData: true },
    );
    onUpdated(updated);
  }

  async function deleteIcon() {
    const updated = await apiClient.delete<Category>(
      `/categories/${category.id}/icon`,
    );
    onUpdated(updated);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="mb-3 text-sm font-medium">Image</h2>
        <StagedImagesManager
          existingImages={
            category.imageUrl ? [{ key: "image", url: category.imageUrl }] : []
          }
          deleteOne={deleteImage}
          uploadOne={uploadImage}
          maxTotal={1}
          addLabel="Ajouter"
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium">Icône</h2>
        <StagedImagesManager
          existingImages={
            category.iconUrl ? [{ key: "icon", url: category.iconUrl }] : []
          }
          deleteOne={deleteIcon}
          uploadOne={uploadIcon}
          maxTotal={1}
          addLabel="Ajouter"
        />
      </div>

      <p className="text-xs text-gray-400">
        JPEG, PNG, WEBP ou GIF · 5 Mo max · un fichier par champ
      </p>
    </div>
  );
}
