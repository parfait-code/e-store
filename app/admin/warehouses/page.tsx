// app/admin/warehouses/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import {
  Plus,
  Loader2,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Warehouse, WarehouseFormInput } from "@/lib/types";

function NewWarehouseForm({
  onCreated,
}: {
  onCreated: (w: Warehouse) => void;
}) {
  const [form, setForm] = useState<WarehouseFormInput>({
    name: "",
    location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await apiClient.post<Warehouse>("/warehouses", form);
      onCreated(created);
      setForm({ name: "", location: "" });
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

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Warehouse[]>("/warehouses")
      .then(setWarehouses)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(warehouseId: string) {
    if (!confirm("Supprimer cet entrepôt ?")) return;
    setDeletingId(warehouseId);
    try {
      await apiClient.delete(`/warehouses/${warehouseId}`);
      setWarehouses((prev) => prev.filter((w) => w.id !== warehouseId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Entrepôts</h1>
        <p className="text-sm text-gray-500">{warehouses.length} entrepôt(s)</p>
      </div>

      <NewWarehouseForm
        onCreated={(w) => setWarehouses((prev) => [...prev, w])}
      />

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w) => (
            <div
              key={w.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <WarehouseIcon size={16} className="text-gray-400" />
                  <span className="font-medium">{w.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(w.id)}
                  disabled={deletingId === w.id}
                  className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  {deletingId === w.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
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
          ))}
        </div>
      )}
    </div>
  );
}
