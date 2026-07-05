// app/admin/categories/_components/CategoryAttributes.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, Tag, Check, Pencil, X, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  AttributeDefinition,
  AttributeDefinitionFormInput,
  AttributeOption,
} from "@/lib/types";

const TYPE_LABELS: Record<AttributeDefinition["type"], string> = {
  TEXT: "Texte",
  NUMBER: "Nombre",
  COLOR: "Couleur",
  BOOLEAN: "Oui/Non",
  SELECT: "Liste (options)",
};

function AttributeOptionRow({
  option,
  definitionType,
  onUpdated,
  onDeleted,
}: {
  option: AttributeOption;
  definitionType: AttributeDefinition["type"];
  onUpdated: (option: AttributeOption) => void;
  onDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(option.value);
  const [colorHex, setColorHex] = useState(option.colorHex ?? "#000000");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await apiClient.patch<AttributeOption>(
        `/attributes/options/${option.id}`,
        {
          value: value.trim(),
          colorHex: definitionType === "COLOR" ? colorHex : undefined,
        },
      );
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer l'option « ${option.value} » ?`)) return;
    try {
      await apiClient.delete(`/attributes/options/${option.id}`);
      onDeleted();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    }
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
      <button
        onClick={() => setIsEditing(true)}
        className="rounded-full p-0.5 hover:bg-gray-200"
      >
        <Pencil size={11} />
      </button>
      <button
        onClick={handleDelete}
        className="rounded-full p-0.5 hover:bg-gray-200"
      >
        <Trash2 size={11} />
      </button>
    </span>
  );
}

function AttributeOptionsEditor({
  definition,
  onChange,
}: {
  definition: AttributeDefinition;
  onChange: (updated: AttributeDefinition) => void;
}) {
  const [value, setValue] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [isAdding, setIsAdding] = useState(false);

  async function addOption() {
    if (!value.trim()) return;
    setIsAdding(true);
    try {
      const created = await apiClient.post<AttributeOption>(
        `/attributes/${definition.id}/options`,
        {
          value: value.trim(),
          colorHex: definition.type === "COLOR" ? colorHex : undefined,
        },
      );
      onChange({ ...definition, options: [...definition.options, created] });
      setValue("");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur lors de l'ajout");
    } finally {
      setIsAdding(false);
    }
  }

  if (definition.type !== "SELECT" && definition.type !== "COLOR") return null;

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="mb-2 flex flex-wrap gap-2">
        {definition.options.map((opt) => (
          <AttributeOptionRow
            key={opt.id}
            option={opt}
            definitionType={definition.type}
            onUpdated={(updated) =>
              onChange({
                ...definition,
                options: definition.options.map((o) =>
                  o.id === updated.id ? updated : o,
                ),
              })
            }
            onDeleted={() =>
              onChange({
                ...definition,
                options: definition.options.filter((o) => o.id !== opt.id),
              })
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
  definition,
  onUpdated,
  onCancel,
}: {
  definition: AttributeDefinition;
  onUpdated: (updated: AttributeDefinition) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: definition.name,
    slug: definition.slug,
    unit: definition.unit ?? "",
    isVariant: definition.isVariant,
    isFilterable: definition.isFilterable,
    isRequired: definition.isRequired,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await apiClient.patch<AttributeDefinition>(
        `/attributes/${definition.id}`,
        {
          name: form.name,
          slug: form.slug,
          unit: form.unit || undefined,
          isVariant: form.isVariant,
          isFilterable: form.isFilterable,
          isRequired: form.isRequired,
        },
      );
      onUpdated({ ...updated, options: definition.options });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSaving(false);
    }
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
      <input
        type="text"
        value={form.unit}
        onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
        className={`${inputClass} w-full`}
        placeholder="Unité (optionnel, ex: cm, kg)"
      />
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
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AttributeDefinitionFormInput>({
    name: "",
    slug: "",
    type: "TEXT",
    isVariant: false,
    isFilterable: false,
    isRequired: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<AttributeDefinition[]>(`/categories/${categoryId}/attributes`)
      .then(setAttributes)
      .finally(() => setIsLoading(false));
  }, [categoryId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await apiClient.post<AttributeDefinition>(
        `/categories/${categoryId}/attributes`,
        form,
      );
      setAttributes((prev) => [...prev, created]);
      setForm({
        name: "",
        slug: "",
        type: "TEXT",
        isVariant: false,
        isFilterable: false,
        isRequired: false,
      });
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(definitionId: string) {
    if (!confirm("Supprimer cet attribut ?")) return;
    try {
      await apiClient.delete(`/attributes/${definitionId}`);
      setAttributes((prev) => prev.filter((a) => a.id !== definitionId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    }
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
              placeholder="Nom (ex: Couleur)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              required
              placeholder="Slug (ex: couleur)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className={inputClass}
            />
          </div>
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
                definition={attr}
                onUpdated={(updated) => {
                  setAttributes((prev) =>
                    prev.map((a) => (a.id === updated.id ? updated : a)),
                  );
                  setEditingId(null);
                }}
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
                      onClick={() => handleDelete(attr.id)}
                      className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <AttributeOptionsEditor
                  definition={attr}
                  onChange={(updated) =>
                    setAttributes((prev) =>
                      prev.map((a) => (a.id === updated.id ? updated : a)),
                    )
                  }
                />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
