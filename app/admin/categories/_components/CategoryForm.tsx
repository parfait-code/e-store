// app/admin/categories/_components/CategoryForm.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Category, CategoryFormInput } from "@/lib/types";

interface CategoryFormProps {
  initialCategory?: Category;
  onSuccess: (category: Category) => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategoryForm({
  initialCategory,
  onSuccess,
}: CategoryFormProps) {
  const isEditing = Boolean(initialCategory);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [form, setForm] = useState<CategoryFormInput>({
    name: initialCategory?.name ?? "",
    slug: initialCategory?.slug ?? "",
    description: initialCategory?.description ?? "",
    imageUrl: initialCategory?.imageUrl ?? "",
    iconUrl: initialCategory?.iconUrl ?? "",
    metaTitle: initialCategory?.metaTitle ?? "",
    metaDescription: initialCategory?.metaDescription ?? "",
    isActive: initialCategory?.isActive ?? true,
    parentId: initialCategory?.parentId ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient
      .get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  function update<K extends keyof CategoryFormInput>(
    key: K,
    value: CategoryFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(value: string) {
    update("name", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = { ...form, parentId: form.parentId || undefined };
      const result = isEditing
        ? await apiClient.put<Category>(
            `/categories/${initialCategory!.id}`,
            payload,
          )
        : await apiClient.post<Category>("/categories", payload);
      onSuccess(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        const details = err.details as
          | { fieldErrors?: Record<string, string[]> }
          | undefined;
        if (details?.fieldErrors) setFieldErrors(details.fieldErrors);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  // Empêche de choisir la catégorie elle-même ou un de ses descendants comme parent
  const availableParents = categories.filter(
    (c) => c.id !== initialCategory?.id,
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nom</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputClass}
          />
          {fieldError("name") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
            className={inputClass}
          />
          {fieldError("slug") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("slug")}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Catégorie parente
        </label>
        <select
          value={form.parentId}
          onChange={(e) => update("parentId", e.target.value)}
          className={inputClass}
        >
          <option value="">Aucune (catégorie racine)</option>
          {availableParents.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">URL image</label>
          <input
            type="text"
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">URL icône</label>
          <input
            type="text"
            value={form.iconUrl}
            onChange={(e) => update("iconUrl", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Meta titre (SEO)
          </label>
          <input
            type="text"
            value={form.metaTitle}
            onChange={(e) => update("metaTitle", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Meta description (SEO)
          </label>
          <input
            type="text"
            value={form.metaDescription}
            onChange={(e) => update("metaDescription", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        Catégorie active
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {isEditing ? "Enregistrer les modifications" : "Créer la catégorie"}
      </button>
    </form>
  );
}
