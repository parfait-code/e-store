// app/admin/warehouses/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  Plus,
  Loader2,
  Trash2,
  Pencil,
  X,
  Save,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type { WarehouseFormInput } from "@/lib/types";
import {
  useAdminWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
} from "@/lib/queries/admin/useInventory";
import {
  useConfirmDialog,
  useAlertDialog,
} from "@/components/admin/ModalProvider";

function NewWarehouseForm() {
  const [form, setForm] = useState<WarehouseFormInput>({
    name: "",
    location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { mutate: createWarehouse, isPending } = useCreateWarehouse();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    createWarehouse(form, {
      onSuccess: () => setForm({ name: "", location: "" }),
      onError: (err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur lors de la création",
        ),
    });
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
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
          placeholder="Entrepôt Douala"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Localisation
        </label>
        <input
          type="text"
          required
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          className={inputClass}
          placeholder="Douala, Cameroun"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Capacité (optionnel)
        </label>
        <input
          type="number"
          min={0}
          value={form.capacity ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              capacity: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
          className={inputClass}
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

function EditWarehouseForm({
  warehouse,
  onCancel,
}: {
  warehouse: {
    id: string;
    name: string;
    location: string;
    capacity: number | null;
  };
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: warehouse.name,
    location: warehouse.location,
    capacity: warehouse.capacity,
  });
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateWarehouse, isPending } = useUpdateWarehouse(
    warehouse.id,
  );

  function handleSave() {
    setError(null);
    updateWarehouse(
      {
        name: form.name,
        location: form.location,
        capacity: form.capacity ?? undefined,
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
    "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-900";

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className={inputClass}
        placeholder="Nom"
      />
      <input
        value={form.location}
        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        className={inputClass}
        placeholder="Localisation"
      />
      <input
        type="number"
        min={0}
        value={form.capacity ?? ""}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            capacity: e.target.value ? Number(e.target.value) : null,
          }))
        }
        className={inputClass}
        placeholder="Capacité (optionnel)"
      />
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Save size={12} />
          )}
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
        >
          <X size={12} /> Annuler
        </button>
      </div>
    </div>
  );
}

export default function WarehousesPage() {
  const { data: warehouses = [], isLoading, isError } = useAdminWarehouses();
  const {
    mutate: deleteWarehouse,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteWarehouse();
  const confirm = useConfirmDialog();
  const alertDialog = useAlertDialog();
  const [editingId, setEditingId] = useState<string | null>(null);
  async function handleDelete(warehouseId: string) {
    const ok = await confirm({
      title: "Supprimer l'entrepôt",
      message: "Supprimer cet entrepôt ?",
    });
    if (!ok) return;
    deleteWarehouse(warehouseId, {
      onError: (err) =>
        alertDialog(
          err instanceof ApiError ? err.message : "Suppression impossible",
        ),
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Entrepôts</h1>
        <p className="text-sm text-gray-500">{warehouses.length} entrepôt(s)</p>
      </div>

      <NewWarehouseForm />

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w) =>
            editingId === w.id ? (
              <EditWarehouseForm
                key={w.id}
                warehouse={w}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={w.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <WarehouseIcon size={16} className="text-gray-400" />
                    <span className="font-medium">{w.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingId(w.id)}
                      className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      disabled={isDeleting && deletingId === w.id}
                      className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {isDeleting && deletingId === w.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{w.location}</p>
                {w.capacity !== null && (
                  <p className="mt-1 text-xs text-gray-400">
                    Capacité : {w.capacity}
                  </p>
                )}
                <Link
                  href={`/admin/warehouses/${w.id}`}
                  className="mt-3 inline-block text-xs font-medium text-gray-900 hover:underline"
                >
                  Voir l'inventaire →
                </Link>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
