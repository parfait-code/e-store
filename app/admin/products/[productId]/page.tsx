// app/admin/products/[productId]/page.tsx
"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Upload, Star, X } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Product } from "@/lib/types";
import { ProductForm } from "../_components/ProductForm";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Product>(`/product/${productId}`)
      .then(setProduct)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [productId]);

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length > 5) {
      alert("5 images maximum par envoi.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    setIsUploading(true);
    try {
      const updated = await apiClient.post<Product>(
        `/product/${productId}/images`,
        formData,
        { isFormData: true },
      );
      setProduct(updated);
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Échec de l'envoi des images",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm("Supprimer cette image ?")) return;
    setDeletingImageId(imageId);
    try {
      const updated = await apiClient.delete<Product>(
        `/product/${productId}/images`,
        {
          imageId,
        },
      );
      setProduct(updated);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Échec de la suppression");
    } finally {
      setDeletingImageId(null);
    }
  }

  if (isLoading) {
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  }

  if (error || !product) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Produit introuvable."}
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux produits
      </Link>
      <h1 className="mb-6 text-xl font-semibold">
        Modifier « {product.name} »
      </h1>

      {/* Images */}
      <div className="mb-8 max-w-2xl">
        <h2 className="mb-3 text-sm font-medium">Images</h2>
        <div className="flex flex-wrap gap-3">
          {product.images
            .sort((a, b) => a.position - b.position)
            .map((img) => (
              <div
                key={img.id}
                className="group relative h-24 w-24 overflow-hidden rounded-md border border-gray-200"
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? ""}
                  fill
                  className="object-cover"
                />
                {img.isPrimary && (
                  <span className="absolute left-1 top-1 rounded-full bg-white/90 p-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </span>
                )}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  disabled={deletingImageId === img.id}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50"
                >
                  {deletingImageId === img.id ? (
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
            onChange={handleImageUpload}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          JPEG, PNG, WEBP ou GIF · 5 Mo max · 5 fichiers max
        </p>
      </div>

      {/* Formulaire infos produit */}
      <ProductForm
        initialProduct={product}
        onSuccess={(updated) => {
          setProduct(updated);
          router.refresh();
        }}
      />

      {/* Variantes (aperçu, gestion détaillée à venir) */}
      {/* Variantes — remplace le bloc "aperçu" précédent */}
      <div className="mt-10 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">
            Variantes ({product.variants.length})
          </h2>
          <Link
            href={`/admin/products/${product.id}/variants`}
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Gérer les variantes →
          </Link>
        </div>
      </div>
    </div>
  );
}
