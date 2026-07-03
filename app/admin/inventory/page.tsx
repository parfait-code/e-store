// app/admin/inventory/page.tsx
"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  XCircle,
  ArrowLeftRight,
  Pencil,
  X,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  InventoryItem,
  Warehouse,
  Paginated,
  InventoryTransferInput,
} from "@/lib/types";

type Tab = "all" | "low-stock" | "out-of-stock";

function QuantityEditor({
  item,
  onUpdated,
  onCancel,
}: {
  item: InventoryItem;
  onUpdated: (item: InventoryItem) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await apiClient.put<InventoryItem>(
        `/inventory/${item.id}`,
        { quantity },
      );
      onUpdated(updated);
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-900"
      />
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-md p-1 text-green-600 hover:bg-green-50"
      >
        {isSaving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Save size={14} />
        )}
      </button>
      <button
        onClick={onCancel}
        className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function TransferModal({
  item,
  warehouses,
  onClose,
  onTransferred,
}: {
  item: InventoryItem;
  warehouses: Warehouse[];
  onClose: () => void;
  onTransferred: () => void;
}) {
  const [toWarehouse, setToWarehouse] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!toWarehouse) {
      setError("Sélectionnez un entrepôt de destination.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: InventoryTransferInput = {
        item_id: item.id,
        from_warehouse: item.warehouseId,
        to_warehouse: toWarehouse,
        quantity,
      };
      await apiClient.post("/inventory/transfer", payload);
      onTransferred();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors du transfert",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Transférer un stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          {item.product.name} · {item.quantity} unité(s) disponible(s) à{" "}
          {item.warehouse.name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Vers l'entrepôt
            </label>
            <select
              value={toWarehouse}
              onChange={(e) => setToWarehouse(e.target.value)}
              className={inputClass}
            >
              <option value="">Sélectionner...</option>
              {warehouses
                .filter((w) => w.id !== item.warehouseId)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Quantité
            </label>
            <input
              type="number"
              min={1}
              max={item.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowLeftRight size={16} />
            )}
            Transférer
          </button>
        </form>
      </div>
    </div>
  );
}

function NewInventoryItemForm({
  warehouses,
  onCreated,
  onCancel,
}: {
  warehouses: Warehouse[];
  onCreated: (item: InventoryItem) => void;
  onCancel: () => void;
}) {
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [combinationId, setCombinationId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!productId || !warehouseId) {
      setError("Renseignez le produit et l'entrepôt.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await apiClient.post<InventoryItem>("/inventory", {
        product_id: Number(productId),
        warehouse_id: warehouseId,
        combination_id: combinationId || undefined,
        quantity,
      });
      onCreated(created);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de la création (doublon produit/entrepôt/combination ?)",
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
      className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            ID produit
          </label>
          <input
            type="number"
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Entrepôt
          </label>
          <select
            required
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className={inputClass}
          >
            <option value="">Sélectionner...</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            ID combinaison (optionnel)
          </label>
          <input
            type="text"
            value={combinationId}
            onChange={(e) => setCombinationId(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Quantité initiale
          </label>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer l'article"}
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

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Warehouse[]>("/warehouses")
      .then(setWarehouses)
      .catch(() => {});
  }, []);

  const fetchItems = useCallback(() => {
    setIsLoading(true);
    setError(null);

    let request: Promise<InventoryItem[] | Paginated<InventoryItem>>;

    if (keyword) {
      request = apiClient.get<InventoryItem[]>(
        `/inventory/search?keyword=${encodeURIComponent(keyword)}`,
      );
    } else if (tab === "low-stock") {
      request = apiClient.get<InventoryItem[]>("/inventory/low-stock");
    } else if (tab === "out-of-stock") {
      request = apiClient.get<InventoryItem[]>("/inventory/out-of-stock");
    } else {
      request = apiClient.get<Paginated<InventoryItem>>(
        `/inventory?page=${page}&limit=20`,
      );
    }

    request
      .then((res) => {
        if (Array.isArray(res)) {
          setItems(res);
          setTotalPages(1);
          setTotal(res.length);
        } else {
          setItems(res.items);
          setTotalPages(res.totalPages);
          setTotal(res.total);
        }
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [tab, page, keyword]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setKeyword(keywordInput.trim());
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Supprimer cet article d'inventaire ?")) return;
    setDeletingId(itemId);
    try {
      await apiClient.delete(`/inventory/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setTotal((t) => t - 1);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  function switchTab(newTab: Tab) {
    setTab(newTab);
    setPage(1);
    setKeyword("");
    setKeywordInput("");
  }

  const tabClass = (t: Tab) =>
    `flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${
      tab === t ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inventaire</h1>
          <p className="text-sm text-gray-500">{total} article(s)</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/warehouses"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Gérer les entrepôts →
          </Link>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus size={16} />
              Nouvel article
            </button>
          )}
        </div>
      </div>

      {showCreateForm && (
        <NewInventoryItemForm
          warehouses={warehouses}
          onCreated={(item) => {
            setItems((prev) => [item, ...prev]);
            setTotal((t) => t + 1);
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => switchTab("all")} className={tabClass("all")}>
            Tous
          </button>
          <button
            onClick={() => switchTab("low-stock")}
            className={tabClass("low-stock")}
          >
            <AlertTriangle size={14} /> Stock faible
          </button>
          <button
            onClick={() => switchTab("out-of-stock")}
            className={tabClass("out-of-stock")}
          >
            <XCircle size={14} /> Rupture
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="w-64 rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Entrepôt</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun article trouvé.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{item.product.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.product.sku}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.warehouse.name}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === item.id ? (
                      <QuantityEditor
                        item={item}
                        onUpdated={(updated) => {
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === updated.id ? updated : i,
                            ),
                          );
                          setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <span
                        className={`font-medium ${
                          item.quantity === 0
                            ? "text-red-600"
                            : item.quantity <= 10
                              ? "text-amber-600"
                              : ""
                        }`}
                      >
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId !== item.id && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          title="Modifier la quantité"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setTransferItem(item)}
                          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          title="Transférer"
                        >
                          <ArrowLeftRight size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === item.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {tab === "all" && !keyword && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {transferItem && (
        <TransferModal
          item={transferItem}
          warehouses={warehouses}
          onClose={() => setTransferItem(null)}
          onTransferred={fetchItems}
        />
      )}
    </div>
  );
}
