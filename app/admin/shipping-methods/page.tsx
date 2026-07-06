// app/admin/shipping-methods/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, Check, X, Route } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatXAF } from "@/lib/format";
import type { ShippingMethod, ShippingMethodFormInput } from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

function ShippingMethodForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: ShippingMethod;
  onSubmit: (input: ShippingMethodFormInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ShippingMethodFormInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    estimatedDays: initial?.estimatedDays ?? 3,
    basePrice: initial?.basePrice ?? 0,
    pricePerKg: initial?.pricePerKg ?? 0,
    isActive: initial?.isActive ?? true,
    zones: initial?.zones ?? [],
  });
  const [zonesInput, setZonesInput] = useState(initial?.zones.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const zones = zonesInput
      .split(",")
      .map((z) => z.trim().toUpperCase())
      .filter(Boolean);
    if (zones.length === 0) {
      setError("Renseignez au moins une zone (code pays 2 lettres).");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ ...form, zones });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'enregistrement",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
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
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Délai estimé (jours)
          </label>
          <input
            type="number"
            required
            min={0}
            value={form.estimatedDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, estimatedDays: Number(e.target.value) }))
            }
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Description
        </label>
        <input
          type="text"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Prix de base (XAF)
          </label>
          <input
            type="number"
            required
            min={0}
            value={form.basePrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Prix / kg (XAF)
          </label>
          <input
            type="number"
            min={0}
            value={form.pricePerKg}
            onChange={(e) =>
              setForm((f) => ({ ...f, pricePerKg: Number(e.target.value) }))
            }
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Zones desservies (codes pays 2 lettres, séparés par virgule)
        </label>
        <input
          type="text"
          required
          placeholder="CM, GA, CI"
          value={zonesInput}
          onChange={(e) => setZonesInput(e.target.value)}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) =>
            setForm((f) => ({ ...f, isActive: e.target.checked }))
          }
        />
        Méthode active
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function ShippingMethodsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ShippingMethod[]>("/shipping-methods")
      .then(setMethods)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function handleUpdate(id: string, input: ShippingMethodFormInput) {
    const updated = await apiClient.patch<ShippingMethod>(
      `/shipping-methods/${id}`,
      input,
    );
    setMethods((prev) => prev.map((m) => (m.id === id ? updated : m)));
    setEditingId(null);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await apiClient.delete(`/shipping-methods/${confirmDeleteId}`);
      setMethods((prev) => prev.filter((m) => m.id !== confirmDeleteId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Méthodes de livraison</h1>
          <p className="text-sm text-gray-500">{methods.length} méthode(s)</p>
        </div>
        <Link
          href="/admin/shipping-methods/new"
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={16} />
          Nouvelle méthode
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : methods.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune méthode de livraison.</p>
      ) : (
        <div className="space-y-3">
          {methods.map((method) =>
            editingId === method.id ? (
              <ShippingMethodForm
                key={method.id}
                initial={method}
                onSubmit={(input) => handleUpdate(method.id, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <Route size={16} className="mt-0.5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          method.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {method.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {method.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatXAF(method.basePrice)} de base +{" "}
                      {formatXAF(method.pricePerKg)}/kg · {method.estimatedDays}{" "}
                      jour(s) · Zones : {method.zones.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(method.id)}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(method.id)}
                    disabled={deletingId === method.id}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === method.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Supprimer la méthode de livraison"
        message="Cette action est irréversible. Voulez-vous vraiment continuer ?"
        confirmLabel="Supprimer"
        isLoading={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
