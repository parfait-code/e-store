// app/admin/tags/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X, TagIcon } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type { Tag } from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/lib/queries/admin/useTags";
import { useAlertDialog } from "@/components/admin/ModalProvider";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NewTagForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: createTag, isPending } = useCreateTag();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    createTag(
      { name, slug: slugify(name) },
      {
        onSuccess: () => setName(""),
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la création",
          ),
      },
    );
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
        disabled={isPending}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? (
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

function EditTagModal({ tag, onClose }: { tag: Tag; onClose: () => void }) {
  const [name, setName] = useState(tag.name);
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateTag, isPending } = useUpdateTag(tag.id);

  function handleSave() {
    setError(null);
    updateTag(
      { name, slug: slugify(name) },
      {
        onSuccess: onClose,
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la mise à jour",
          ),
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold">Modifier le tag</h2>
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="mb-5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TagCard({
  tag,
  onEditRequested,
  onDeleteRequested,
}: {
  tag: Tag;
  onEditRequested: (tag: Tag) => void;
  onDeleteRequested: (tag: Tag) => void;
}) {
  return (
    <div className="group flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <TagIcon size={14} className="shrink-0 text-gray-400" />
        <span className="truncate text-sm font-medium">{tag.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onEditRequested(tag)}
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
  const { data: tags = [], isLoading, isError } = useAdminTags();
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag();
  const alertDialog = useAlertDialog();

  function confirmDelete() {
    if (!tagToDelete) return;
    deleteTag(tagToDelete.id, {
      onError: (err) =>
        alertDialog(
          err instanceof ApiError ? err.message : "Suppression impossible",
        ),
      onSettled: () => setTagToDelete(null),
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Tags</h1>
        <p className="text-sm text-gray-500">{tags.length} tag(s)</p>
      </div>

      <NewTagForm />

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
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
              onEditRequested={setTagToEdit}
              onDeleteRequested={setTagToDelete}
            />
          ))}
        </div>
      )}

      {tagToEdit && (
        <EditTagModal tag={tagToEdit} onClose={() => setTagToEdit(null)} />
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
