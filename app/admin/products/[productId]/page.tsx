// app/admin/products/[productId]/page.tsx
"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Upload, Star, X, TagIcon } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Product, Tag, AttributeDefinition } from "@/lib/types";
import { ProductForm } from "../_components/ProductForm";

function ProductTagsEditor({ productId }: { productId: number }) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [tags, productTags] = await Promise.all([
          apiClient.get<Tag[]>("/tags"),
          apiClient.get<{ tag: Tag }[]>(`/product/${productId}/tags`),
        ]);
        setAllTags(tags);
        setSelectedIds(productTags.map((pt) => pt.tag.id));
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Erreur de chargement des tags",
        );
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [productId]);

  function toggle(tagId: string) {
    setSelectedIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  async function handleSave() {
    if (selectedIds.length === 0) {
      setError("Sélectionnez au moins un tag.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.put(`/product/${productId}/tags`, {
        tagIds: selectedIds,
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'enregistrement",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading)
    return <Loader2 size={16} className="animate-spin text-gray-400" />;

  return (
    <div className="max-w-2xl">
      <h2 className="mb-3 text-sm font-medium">Tags</h2>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="mb-3 flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const active = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSaving ? "Enregistrement..." : "Enregistrer les tags"}
      </button>
    </div>
  );
}

// Gère les attributs PRODUIT (isVariant:false) via PUT /product/:id/attributes.
// Distinct des attributs de VARIANTE (gérés dans /admin/products/:id/variants).
// Cette route remplace TOUTES les valeurs à chaque appel (pas de merge partiel),
// donc on soumet systématiquement l'ensemble des champs renseignés.
function ProductAttributesEditor({
  product,
  onUpdated,
}: {
  product: Product;
  onUpdated: (product: Product) => void;
}) {
  const [definitions, setDefinitions] = useState<AttributeDefinition[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<AttributeDefinition[]>(
        `/categories/${product.categoryId}/attributes`,
      )
      .then((defs) => {
        const productDefs = defs.filter((d) => !d.isVariant);
        setDefinitions(productDefs);
        const initial: Record<string, string> = {};
        product.attributeValues.forEach((av) => {
          initial[av.attributeDefinition.id] = av.value;
        });
        setValues(initial);
      })
      .catch(() =>
        setError("Erreur lors du chargement des attributs de la catégorie"),
      )
      .finally(() => setIsLoading(false));
    // On ne relance que si la catégorie ou les valeurs déjà en base changent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.categoryId, product.attributeValues]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const attributes = definitions
        .filter((def) => values[def.id]?.trim())
        .map((def) => ({
          attributeDefinitionId: def.id,
          value: values[def.id],
        }));

      const updated = await apiClient.put<Product>(
        `/product/${product.id}/attributes`,
        { attributes },
      );
      onUpdated(updated);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'enregistrement des attributs",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  if (isLoading)
    return <Loader2 size={16} className="animate-spin text-gray-400" />;

  if (definitions.length === 0) {
    return (
      <div className="max-w-2xl">
        <h2 className="mb-2 text-sm font-medium">Caractéristiques produit</h2>
        <p className="text-sm text-gray-400">
          Aucun attribut produit (hors variante) défini pour cette catégorie.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 text-sm font-medium">Caractéristiques produit</h2>
      <p className="mb-3 text-xs text-gray-400">
        Ces valeurs remplacent l'intégralité des caractéristiques du produit à
        chaque enregistrement. Les attributs marqués{" "}
        <span className="text-red-500">*</span> sont requis pour activer le
        produit.
      </p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        {definitions.map((def) => (
          <div key={def.id}>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {def.name}{" "}
              {def.isRequired && <span className="text-red-500">*</span>}
              {def.unit && <span className="text-gray-400"> ({def.unit})</span>}
            </label>
            {def.type === "SELECT" || def.type === "COLOR" ? (
              <select
                value={values[def.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [def.id]: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">Sélectionner...</option>
                {def.options.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.value}
                  </option>
                ))}
              </select>
            ) : def.type === "BOOLEAN" ? (
              <select
                value={values[def.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [def.id]: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">Sélectionner...</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            ) : (
              <input
                type={def.type === "NUMBER" ? "number" : "text"}
                value={values[def.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [def.id]: e.target.value }))
                }
                className={inputClass}
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-3 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSaving ? "Enregistrement..." : "Enregistrer les caractéristiques"}
      </button>
    </div>
  );
}

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

      <div className="mb-8">
        <ProductTagsEditor productId={product.id} />
      </div>

      {/* Caractéristiques produit (attributs isVariant:false) — doit être
          renseigné pour pouvoir activer le produit (voir ProductForm) */}
      <div className="mb-8">
        <ProductAttributesEditor product={product} onUpdated={setProduct} />
      </div>

      {/* Formulaire infos produit */}
      <ProductForm
        initialProduct={product}
        onSuccess={(updated) => {
          setProduct(updated);
          router.refresh();
        }}
      />

      {/* Combinaisons */}
      <div className="mt-10 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Combinaisons</h2>
          <Link
            href={`/admin/products/${product.id}/variants`}
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Gérer les combinaisons →
          </Link>
        </div>
      </div>
    </div>
  );
}
