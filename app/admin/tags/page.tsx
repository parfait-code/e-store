// app/admin/tags/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X, TagIcon } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Tag } from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await apiClient.post<Tag>("/tags", {
        name,
        slug: slugify(name),
      });
      onCreated(created);
      setName("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex items-end gap-3">
      <div className="flex-1 max-w-xs">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nom du tag
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          placeholder="Ex: Nouveauté"
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

function TagCard({
  tag,
  onUpdated,
  onDeleteRequested,
}: {
  tag: Tag;
  onUpdated: (tag: Tag) => void;
  onDeleteRequested: (tag: Tag) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await apiClient.patch<Tag>(`/tags/${tag.id}`, {
        name,
        slug: slugify(name),
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

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-900"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1 rounded-md bg-gray-900 px-2 py-1 text-xs text-white disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            Enregistrer
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setName(tag.name);
              setError(null);
            }}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <TagIcon size={14} className="shrink-0 text-gray-400" />
        <span className="truncate text-sm font-medium">{tag.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDeleteRequested(tag)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function confirmDelete() {
    if (!tagToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/tags/${tagToDelete.id}`);
      setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setIsDeleting(false);
      setTagToDelete(null);
    }
  }

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

      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : tags.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun tag.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onUpdated={(updated) =>
                setTags((prev) =>
                  prev.map((t) => (t.id === updated.id ? updated : t)),
                )
              }
              onDeleteRequested={setTagToDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={tagToDelete !== null}
        title="Supprimer le tag"
        message={`Voulez-vous vraiment supprimer le tag « ${tagToDelete?.name} » ?`}
        confirmLabel="Supprimer"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setTagToDelete(null)}
      />
    </div>
  );
}
