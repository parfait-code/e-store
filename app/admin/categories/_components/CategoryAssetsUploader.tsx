// app/admin/categories/_components/CategoryAssetsUploader.tsx
"use client";

import type { Category } from "@/lib/types";
import { StagedImagesManager } from "@/components/admin/StagedImagesManager";
import {
  useUploadCategoryImage,
  useDeleteCategoryImage,
  useUploadCategoryIcon,
  useDeleteCategoryIcon,
} from "@/lib/queries/admin/useCategories";

interface CategoryAssetsUploaderProps {
  category: Category;
}

export function CategoryAssetsUploader({
  category,
}: CategoryAssetsUploaderProps) {
  const { mutateAsync: uploadImage } = useUploadCategoryImage(category.id);
  const { mutateAsync: deleteImage } = useDeleteCategoryImage(category.id);
  const { mutateAsync: uploadIcon } = useUploadCategoryIcon(category.id);
  const { mutateAsync: deleteIcon } = useDeleteCategoryIcon(category.id);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="mb-3 text-sm font-medium">Image</h2>
        <StagedImagesManager
          existingImages={
            category.imageUrl ? [{ key: "image", url: category.imageUrl }] : []
          }
          deleteOne={async () => {
            await deleteImage();
          }}
          uploadOne={async (file) => {
            await uploadImage(file);
          }}
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
          deleteOne={async () => {
            await deleteIcon();
          }}
          uploadOne={async (file) => {
            await uploadIcon(file);
          }}
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
