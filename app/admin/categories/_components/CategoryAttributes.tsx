// app/admin/categories/_components/CategoryAttributes.tsx
"use client";

import { useState, FormEvent } from "react";
import { Plus, Trash2, Tag, Check, Pencil, X, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type {
  AttributeDefinition,
  AttributeDefinitionFormInput,
  AttributeOption,
} from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminCategoryAttributes,
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttribute,
  useCreateAttributeOption,
  useUpdateAttributeOption,
  useDeleteAttributeOption,
} from "@/lib/queries/admin/useCategories";
import { useAlertDialog } from "@/components/admin/ModalProvider";

const TYPE_LABELS: Record<AttributeDefinition["type"], string> = {
  TEXT: "Texte",
  NUMBER: "Nombre",
  COLOR: "Couleur",
  BOOLEAN: "Oui/Non",
  SELECT: "Liste (options)",
};

function AttributeOptionRow({
  option,
  categoryId,
  definitionId,
  definitionType,
  onDeleteRequested,
}: {
  option: AttributeOption;
  categoryId: string;
  definitionId: string;
  definitionType: AttributeDefinition["type"];
  onDeleteRequested: (option: AttributeOption) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(option.value);
  const [colorHex, setColorHex] = useState(option.colorHex ?? "#000000");
  const [position, setPosition] = useState(option.position);
  const { mutate: updateOption, isPending: isSaving } =
    useUpdateAttributeOption(categoryId, definitionId);
  const alertDialog = useAlertDialog();

  function handleSave() {
    updateOption(
      {
        optionId: option.id,
        payload: {
          value: value.trim(),
          colorHex: definitionType === "COLOR" ? colorHex : undefined,
          position,
        },
      },
      {
        onSuccess: () => setIsEditing(false),
        onError: (err) =>
          alertDialog(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la mise à jour",
          ),
      },
    );
  }

  if (isEditing) {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-2 pr-1 text-xs">
        {definitionType === "COLOR" && (
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="h-4 w-4 rounded border-0"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 rounded border border-gray-300 px-1 py-0.5 text-xs outline-none focus:border-gray-900"
          autoFocus
        />
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          title="Position d'affichage"
          className="w-12 rounded border border-gray-300 px-1 py-0.5 text-xs outline-none focus:border-gray-900"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full p-0.5 text-green-600 hover:bg-green-50"
        >
          {isSaving ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Check size={11} />
          )}
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setValue(option.value);
            setColorHex(option.colorHex ?? "#000000");
            setPosition(option.position);
          }}
          className="rounded-full p-0.5 hover:bg-gray-200"
        >
          <X size={11} />
        </button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-2 pr-1 text-xs">
      {option.colorHex && (
        <span
          className="h-3 w-3 rounded-full border border-gray-300"
          style={{ backgroundColor: option.colorHex }}
        />
      )}
      {option.value}
      <span className="text-gray-400">#{option.position}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="rounded-full p-0.5 hover:bg-gray-200"
      >
        <Pencil size={11} />
      </button>
      <button
        onClick={() => onDeleteRequested(option)}
        className="rounded-full p-0.5 hover:bg-gray-200"
      >
        <Trash2 size={11} />
      </button>
    </span>
  );
}

function AttributeOptionsEditor({
  definition,
  categoryId,
  onDeleteRequested,
}: {
  definition: AttributeDefinition;
  categoryId: string;
  onDeleteRequested: (definitionId: string, option: AttributeOption) => void;
}) {
  const [value, setValue] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [position, setPosition] = useState(definition.options.length);
  const { mutate: createOption, isPending: isAdding } =
    useCreateAttributeOption(categoryId, definition.id);
  const alertDialog = useAlertDialog();

  function addOption() {
    if (!value.trim()) return;
    createOption(
      {
        value: value.trim(),
        colorHex: definition.type === "COLOR" ? colorHex : undefined,
        position,
      },
      {
        onSuccess: () => {
          setValue("");
          setPosition((p) => p + 1);
        },
        onError: (err) =>
          alertDialog(
            err instanceof ApiError ? err.message : "Erreur lors de l'ajout",
          ),
      },
    );
  }

  if (definition.type !== "SELECT" && definition.type !== "COLOR") return null;

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="mb-2 flex flex-wrap gap-2">
        {definition.options.map((opt) => (
          <AttributeOptionRow
            key={opt.id}
            option={opt}
            categoryId={categoryId}
            definitionId={definition.id}
            definitionType={definition.type}
            onDeleteRequested={(option) =>
              onDeleteRequested(definition.id, option)
            }
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Nouvelle option"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-gray-900"
        />
        {definition.type === "COLOR" && (
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="h-7 w-7 rounded border border-gray-300"
          />
        )}
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          title="Position d'affichage"
          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-gray-900"
        />
        <button
          onClick={addOption}
          disabled={isAdding}
          className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white disabled:opacity-50"
        >
          {isAdding ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            "Ajouter"
          )}
        </button>
      </div>
    </div>
  );
}

function AttributeDefinitionEditor({
  categoryId,
  definition,
  onCancel,
}: {
  categoryId: string;
  definition: AttributeDefinition;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: definition.name,
    slug: definition.slug,
    unit: definition.unit ?? "",
    position: definition.position,
    isVariant: definition.isVariant,
    isFilterable: definition.isFilterable,
    isRequired: definition.isRequired,
  });
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateAttribute, isPending: isSaving } = useUpdateAttribute(
    categoryId,
    definition.id,
  );

  function handleSave() {
    setError(null);
    updateAttribute(
      {
        name: form.name,
        slug: form.slug,
        unit: form.unit || undefined,
        position: form.position,
        isVariant: form.isVariant,
        isFilterable: form.isFilterable,
        isRequired: form.isRequired,
      },
      {
        onSuccess: onCancel,
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la mise à jour",
          ),
      },
    );
  }

  const inputClass =
    "rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-900";

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
          placeholder="Nom"
        />
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className={inputClass}
          placeholder="Slug"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={form.unit}
          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          className={inputClass}
          placeholder="Unité (optionnel, ex: cm, kg)"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Position d'affichage
          </label>
          <input
            type="number"
            value={form.position}
            onChange={(e) =>
              setForm((f) => ({ ...f, position: Number(e.target.value) }))
            }
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={form.isVariant}
            onChange={(e) =>
              setForm((f) => ({ ...f, isVariant: e.target.checked }))
            }
          />
          Utilisé pour les variantes
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={form.isFilterable}
            onChange={(e) =>
              setForm((f) => ({ ...f, isFilterable: e.target.checked }))
            }
          />
          Filtrable
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={form.isRequired}
            onChange={(e) =>
              setForm((f) => ({ ...f, isRequired: e.target.checked }))
            }
          />
          Obligatoire
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export function CategoryAttributes({ categoryId }: { categoryId: string }) {
  const { data: attributes = [], isLoading } =
    useAdminCategoryAttributes(categoryId);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AttributeDefinitionFormInput>({
    name: "",
    slug: "",
    type: "TEXT",
    unit: "",
    isVariant: false,
    isFilterable: false,
    isRequired: false,
    position: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const alertDialog = useAlertDialog();

  const { mutate: createAttribute, isPending: isSubmitting } =
    useCreateAttribute(categoryId);
  const { mutate: deleteAttribute, isPending: isDeletingAttribute } =
    useDeleteAttribute(categoryId);

  const [attrToDelete, setAttrToDelete] = useState<AttributeDefinition | null>(
    null,
  );
  const [optionToDelete, setOptionToDelete] = useState<{
    definitionId: string;
    option: AttributeOption;
  } | null>(null);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    createAttribute(
      { ...form, unit: form.unit || undefined },
      {
        onSuccess: () => {
          setForm({
            name: "",
            slug: "",
            type: "TEXT",
            unit: "",
            isVariant: false,
            isFilterable: false,
            isRequired: false,
            position: attributes.length + 1,
          });
          setShowForm(false);
        },
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la création",
          ),
      },
    );
  }

  function confirmDeleteAttribute() {
    if (!attrToDelete) return;
    deleteAttribute(attrToDelete.id, {
      onError: (err) =>
        alertDialog(
          err instanceof ApiError ? err.message : "Suppression impossible",
        ),
      onSettled: () => setAttrToDelete(null),
    });
  }

  const inputClass =
    "rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-900";

  return (
    <div className="max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Attributs de la catégorie</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <Plus size={14} /> Nouvel attribut
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-4 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4"
        >
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Nom (ex: Couleur) *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              required
              placeholder="Slug (ex: couleur) *"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as AttributeDefinitionFormInput["type"],
                }))
              }
              className={inputClass}
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Unité (optionnel, ex: cm, kg)"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Position d'affichage
            </label>
            <input
              type="number"
              value={form.position}
              onChange={(e) =>
                setForm((f) => ({ ...f, position: Number(e.target.value) }))
              }
              className={`${inputClass} w-24`}
            />
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.isVariant}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isVariant: e.target.checked }))
                }
              />
              Utilisé pour les variantes
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.isFilterable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isFilterable: e.target.checked }))
                }
              />
              Filtrable
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.isRequired}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isRequired: e.target.checked }))
                }
              />
              Obligatoire
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? "Création..." : "Créer l'attribut"}
          </button>
        </form>
      )}

      {isLoading ? (
        <Loader2 size={16} className="animate-spin text-gray-400" />
      ) : attributes.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucun attribut défini pour cette catégorie.
        </p>
      ) : (
        <div className="space-y-2">
          {attributes.map((attr) =>
            editingId === attr.id ? (
              <AttributeDefinitionEditor
                key={attr.id}
                categoryId={categoryId}
                definition={attr}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={attr.id}
                className="rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-gray-400" />
                    <span className="text-sm font-medium">{attr.name}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      {TYPE_LABELS[attr.type]}
                    </span>
                    {attr.unit && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                        {attr.unit}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      pos. {attr.position}
                    </span>
                    {attr.isVariant && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                        Variante
                      </span>
                    )}
                    {attr.isRequired && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-600">
                        Requis
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingId(attr.id)}
                      className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setAttrToDelete(attr)}
                      className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <AttributeOptionsEditor
                  definition={attr}
                  categoryId={categoryId}
                  onDeleteRequested={(definitionId, option) =>
                    setOptionToDelete({ definitionId, option })
                  }
                />
              </div>
            ),
          )}
        </div>
      )}

      <ConfirmDialog
        open={attrToDelete !== null}
        title="Supprimer l'attribut"
        message={`Voulez-vous vraiment supprimer l'attribut « ${attrToDelete?.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        isLoading={isDeletingAttribute}
        onConfirm={confirmDeleteAttribute}
        onCancel={() => setAttrToDelete(null)}
      />

      {optionToDelete && (
        <DeleteOptionConfirm
          categoryId={categoryId}
          definitionId={optionToDelete.definitionId}
          option={optionToDelete.option}
          onClose={() => setOptionToDelete(null)}
        />
      )}
    </div>
  );
}

function DeleteOptionConfirm({
  categoryId,
  definitionId,
  option,
  onClose,
}: {
  categoryId: string;
  definitionId: string;
  option: AttributeOption;
  onClose: () => void;
}) {
  const { mutate: deleteOption, isPending } = useDeleteAttributeOption(
    categoryId,
    definitionId,
  );
  const alertDialog = useAlertDialog();

  function confirmDelete() {
    deleteOption(option.id, {
      onError: (err) =>
        alertDialog(
          err instanceof ApiError ? err.message : "Suppression impossible",
        ),
      onSettled: onClose,
    });
  }

  return (
    <ConfirmDialog
      open
      title="Supprimer l'option"
      message={`Voulez-vous vraiment supprimer l'option « ${option.value} » ?`}
      confirmLabel="Supprimer"
      isLoading={isPending}
      onConfirm={confirmDelete}
      onCancel={onClose}
    />
  );
}
