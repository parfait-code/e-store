// app/admin/tags/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X, TagIcon } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Tag, TagFormInput } from "@/lib/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NewTagForm({ onCreated }: { onCreated: (tag: Tag) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await apiClient.post<Tag>("/tags", { name, slug });
      onCreated(created);
      setName("");
      setSlug("");
      setSlugTouched(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-wrap items-end gap-3"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nom
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={inputClass}
          placeholder="Ex: Nouveauté"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Slug
        </label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={inputClass}
          placeholder="nouveaute"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Plus size={16} />
        )}
        Créer
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

function TagRow({
  tag,
  onUpdated,
  onDeleted,
}: {
  tag: Tag;
  onUpdated: (tag: Tag) => void;
  onDeleted: (tagId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [slug, setSlug] = useState(tag.slug);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await apiClient.patch<Tag>(`/tags/${tag.id}`, {
        name,
        slug,
      });
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer le tag « ${tag.name} » ?`)) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/tags/${tag.id}`);
      onDeleted(tag.id);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
      setIsDeleting(false);
    }
  }

  const inputClass =
    "rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-900";

  if (isEditing) {
    return (
      <tr className="border-b border-gray-100 last:border-0">
        <td className="px-4 py-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </td>
        <td className="px-4 py-2">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={inputClass}
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </td>
        <td className="px-4 py-2">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md p-1.5 text-green-600 hover:bg-green-50"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setName(tag.name);
                setSlug(tag.slug);
                setError(null);
              }}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <TagIcon size={14} className="text-gray-400" />
          <span className="font-medium">{tag.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-500">{tag.slug}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Tag[]>("/tags")
      .then(setTags)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Tags</h1>
        <p className="text-sm text-gray-500">{tags.length} tag(s)</p>
      </div>

      <NewTagForm onCreated={(tag) => setTags((prev) => [...prev, tag])} />

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun tag.
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <TagRow
                  key={tag.id}
                  tag={tag}
                  onUpdated={(updated) =>
                    setTags((prev) =>
                      prev.map((t) => (t.id === updated.id ? updated : t)),
                    )
                  }
                  onDeleted={(id) =>
                    setTags((prev) => prev.filter((t) => t.id !== id))
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
