// app/admin/inventory/page.tsx
"use client";

import React, { useState, FormEvent, useEffect } from "react";
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
  Check,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  InventoryItem,
  Warehouse,
  InventoryTransferInput,
  Product,
  ProductCombination,
  Paginated,
  InventoryGroupedProduct,
} from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminInventorySearch,
  useAdminWarehouses,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useTransferInventory,
  useAdminInventoryGrouped,
  useAdminInventoryGroupedDetail,
  useCreateInventoryItem,
} from "@/lib/queries/admin/useInventory";
import { useBulkInventoryHelpers } from "@/lib/queries/admin/useBulkInventory";

type Tab = "all" | "low-stock" | "out-of-stock";

function QuantityEditor({
  item,
  onCancel,
}: {
  item: InventoryItem;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const { mutate: updateItem, isPending } = useUpdateInventoryItem();

  function handleSave() {
    updateItem(
      { itemId: item.id, quantity },
      {
        onSuccess: onCancel,
        onError: (err) =>
          alert(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la mise à jour",
          ),
      },
    );
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
        disabled={isPending}
        className="rounded-md p-1 text-green-600 hover:bg-green-50"
      >
        {isPending ? (
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
}: {
  item: InventoryItem;
  warehouses: Warehouse[];
  onClose: () => void;
}) {
  const [toWarehouse, setToWarehouse] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { mutate: transfer, isPending } = useTransferInventory();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!toWarehouse) {
      setError("Sélectionnez un entrepôt de destination.");
      return;
    }
    const payload: InventoryTransferInput = {
      item_id: item.id,
      from_warehouse: item.warehouseId,
      to_warehouse: toWarehouse,
      quantity,
    };
    transfer(payload, {
      onSuccess: onClose,
      onError: (err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur lors du transfert",
        ),
    });
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
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? (
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

function ProductSearchPicker({
  selected,
  onSelect,
}: {
  selected: { id: string; name: string; sku: string } | null;
  onSelect: (product: { id: string; name: string; sku: string } | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setIsSearching(true);
      apiClient
        .get<Paginated<Product>>(
          `/product?search=${encodeURIComponent(query.trim())}&limit=8`,
        )
        .then((res) => setResults(res.items ?? []))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm">
        <div>
          <span className="font-medium">{selected.name}</span>
          <span className="ml-2 text-xs text-gray-400">SKU {selected.sku}</span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Rechercher un produit (nom, SKU)..."
          className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </div>
      {isOpen && query.trim() && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {isSearching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={14} className="animate-spin text-gray-400" />
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">
              Aucun produit trouvé.
            </p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => {
                  onSelect({ id: p.id, name: p.name, sku: p.sku });
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span>{p.name}</span>
                <span className="text-xs text-gray-400">{p.sku}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function NewInventoryItemForm({
  warehouses,
  onCreated,
  onCancel,
}: {
  warehouses: Warehouse[];
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    sku: string;
  } | null>(null);
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { mutate: create, isPending: isCreating } = useCreateInventoryItem();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedProduct || !warehouseId) {
      setError("Sélectionnez un produit et un entrepôt.");
      return;
    }
    create(
      { product_id: selectedProduct.id, warehouse_id: warehouseId, quantity },
      {
        onSuccess: onCreated,
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la création (doublon produit/entrepôt ?)",
          ),
      },
    );
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Produit
          </label>
          <ProductSearchPicker
            selected={selectedProduct}
            onSelect={setSelectedProduct}
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
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Quantité initiale
        </label>
        <input
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={`${inputClass} max-w-50`}
        />
        <p className="mt-1 text-xs text-gray-400">
          Pour un produit avec des combinaisons, utilisez l'onglet «
          Combinaisons du produit » ci-dessus.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isCreating}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isCreating ? "Création..." : "Créer l'article"}
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

// ---------- Mode bulk : la boucle reste locale, l'invalidation est centralisée ----------
function BulkCombinationForm({
  warehouses,
  onCreated,
  onCancel,
}: {
  warehouses: Warehouse[];
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    sku: string;
  } | null>(null);
  const [combinations, setCombinations] = useState<ProductCombination[]>([]);
  const [isLoadingCombos, setIsLoadingCombos] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [existingByCombo, setExistingByCombo] = useState<
    Record<string, { itemId: string; quantity: number }>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [results, setResults] = useState<Record<string, "ok" | "error">>({});
  const { upsertOne, invalidateAfterBulk } = useBulkInventoryHelpers();

  useEffect(() => {
    setCombinations([]);
    setQuantities({});
    setExistingByCombo({});
    setResults({});
    if (!selectedProduct) return;
    setIsLoadingCombos(true);
    apiClient
      .get<ProductCombination[]>(`/product/${selectedProduct.id}/combinations`)
      .then((combos) => {
        setCombinations(combos ?? []);
        const initial: Record<string, number> = {};
        (combos ?? []).forEach((c) => {
          initial[c.id] = 0;
        });
        setQuantities(initial);
      })
      .catch(() =>
        setError("Impossible de charger les combinaisons pour ce produit."),
      )
      .finally(() => setIsLoadingCombos(false));
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedProduct || !warehouseId || combinations.length === 0) return;
    let cancelled = false;
    apiClient
      .get<InventoryItem[]>(
        `/inventory/search?keyword=${encodeURIComponent(selectedProduct.sku)}`,
      )
      .then((items) => {
        if (cancelled) return;
        const map: Record<string, { itemId: string; quantity: number }> = {};
        const initialQuantities: Record<string, number> = {};
        combinations.forEach((c) => {
          initialQuantities[c.id] = 0;
        });
        (items ?? []).forEach((item) => {
          if (item.warehouseId !== warehouseId) return;
          if (!item.combinationId) return;
          if (!combinations.some((c) => c.id === item.combinationId)) return;
          map[item.combinationId] = {
            itemId: item.id,
            quantity: item.quantity,
          };
          initialQuantities[item.combinationId] = item.quantity;
        });
        setExistingByCombo(map);
        setQuantities(initialQuantities);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedProduct, warehouseId, combinations]);

  function labelFor(combo: ProductCombination) {
    const attrs = combo.values
      .map((v) => `${v.attributeDefinition.name}: ${v.attributeOption.value}`)
      .join(" · ");
    return combo.sku ? `${attrs} — ${combo.sku}` : attrs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedProduct || !warehouseId) {
      setError("Sélectionnez un produit et un entrepôt.");
      return;
    }
    const targets = combinations.filter((c) => {
      const existing = existingByCombo[c.id];
      const current = quantities[c.id] ?? 0;
      return existing ? current !== existing.quantity : current > 0;
    });
    if (targets.length === 0) {
      setError("Modifiez la quantité d'au moins une combinaison.");
      return;
    }

    setIsSubmitting(true);
    setProgress({ done: 0, total: targets.length });
    setResults({});
    let successCount = 0;

    for (const combo of targets) {
      const existing = existingByCombo[combo.id];
      try {
        await upsertOne({
          existingItemId: existing?.itemId,
          productId: selectedProduct.id,
          warehouseId,
          combinationId: combo.id,
          quantity: quantities[combo.id],
        });
        successCount += 1;
        setResults((prev) => ({ ...prev, [combo.id]: "ok" }));
      } catch {
        setResults((prev) => ({ ...prev, [combo.id]: "error" }));
      }
      setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
    }

    setIsSubmitting(false);
    if (successCount > 0) {
      invalidateAfterBulk();
      onCreated();
    }

    const failedCount = targets.length - successCount;
    if (failedCount > 0) {
      setError(
        `${successCount}/${targets.length} article(s) mis à jour. ${failedCount} échec(s).`,
      );
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";
  const percent = progress
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-gray-500">
        Crée ou met à jour l'article d'inventaire de chaque combinaison active
        du produit, dans le même entrepôt, en une seule opération.
      </p>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Produit
          </label>
          <ProductSearchPicker
            selected={selectedProduct}
            onSelect={setSelectedProduct}
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
            disabled={isSubmitting}
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

      {isLoadingCombos ? (
        <Loader2 size={16} className="animate-spin text-gray-400" />
      ) : !selectedProduct ? (
        <p className="rounded-md border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400">
          Sélectionnez d'abord un produit.
        </p>
      ) : combinations.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400">
          Ce produit n'a pas de combinaisons actives — utilisez le mode «
          Article simple ».
        </p>
      ) : (
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-gray-200 p-2">
          {combinations.map((c) => {
            const existing = existingByCombo[c.id];
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded px-2 py-1.5 text-xs"
              >
                <span className="flex-1 truncate text-gray-700">
                  {labelFor(c)}
                  {existing && (
                    <span className="ml-2 text-gray-400">
                      (déjà {existing.quantity} en stock)
                    </span>
                  )}
                </span>
                <input
                  type="number"
                  min={0}
                  value={quantities[c.id] ?? 0}
                  onChange={(e) =>
                    setQuantities((prev) => ({
                      ...prev,
                      [c.id]: Number(e.target.value),
                    }))
                  }
                  disabled={isSubmitting}
                  className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-gray-900 disabled:opacity-50"
                />
                {results[c.id] === "ok" && (
                  <Check size={14} className="shrink-0 text-green-600" />
                )}
                {results[c.id] === "error" && (
                  <X size={14} className="shrink-0 text-red-600" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {progress && (
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>Enregistrement en cours...</span>
            <span>
              {percent}% ({progress.done}/{progress.total})
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gray-900 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || combinations.length === 0}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Enregistrer les quantités
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function CreateItemModal({
  warehouses,
  onClose,
  onCreated,
}: {
  warehouses: Warehouse[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mode, setMode] = useState<"single" | "combinations">("single");

  const tabBtn = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-medium ${active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-200"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Nouvel article d'inventaire</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-2 rounded-md bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={tabBtn(mode === "single")}
          >
            Article simple
          </button>
          <button
            type="button"
            onClick={() => setMode("combinations")}
            className={tabBtn(mode === "combinations")}
          >
            Combinaisons du produit
          </button>
        </div>

        {mode === "single" ? (
          <NewInventoryItemForm
            warehouses={warehouses}
            onCreated={onCreated}
            onCancel={onClose}
          />
        ) : (
          <BulkCombinationForm
            warehouses={warehouses}
            onCreated={onCreated}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
}

// Détail par entrepôt/combinaison d'un produit du tableau groupé. Reçoit les
// entrepôts depuis le parent (plus de tableau vide en dur passé au transfert).
function ExpandedProductRows({
  productId,
  warehouses,
}: {
  productId: string;
  warehouses: Warehouse[];
}) {
  const { data, isLoading } = useAdminInventoryGroupedDetail(productId, 1);
  const items = data?.items ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);

  if (isLoading) {
    return (
      <tr>
        <td colSpan={5} className="px-8 py-3">
          <Loader2 size={14} className="animate-spin text-gray-400" />
        </td>
      </tr>
    );
  }

  return (
    <>
      {items.map((item) => (
        <tr
          key={item.id}
          className="border-b border-gray-100 bg-white last:border-0"
        >
          <td className="px-4 py-2.5 pl-10 text-gray-600">
            {item.combination ? item.combination.sku : "Produit simple"}
          </td>
          <td className="px-4 py-2.5 text-gray-500">
            {item.combination?.sku ?? "—"}
          </td>
          <td className="px-4 py-2.5 text-gray-500">{item.warehouse.name}</td>
          <td className="px-4 py-2.5">
            {editingId === item.id ? (
              <QuantityEditor item={item} onCancel={() => setEditingId(null)} />
            ) : (
              <span
                className={`font-medium ${item.quantity === 0 ? "text-red-600" : item.quantity <= 10 ? "text-amber-600" : ""}`}
              >
                {item.quantity}
              </span>
            )}
          </td>
          <td className="px-4 py-2.5">
            {editingId !== item.id && (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setTransferItem(item)}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  <ArrowLeftRight size={16} />
                </button>
              </div>
            )}
          </td>
        </tr>
      ))}
      {transferItem && (
        <tr>
          <td colSpan={5} className="p-0">
            <TransferModal
              item={transferItem}
              warehouses={warehouses}
              onClose={() => setTransferItem(null)}
            />
          </td>
        </tr>
      )}
    </>
  );
}

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set(),
  );

  const { data: warehouses = [] } = useAdminWarehouses();

  const listQuery = useAdminInventoryGrouped({
    page,
    lowStock: tab === "low-stock",
    outOfStock: tab === "out-of-stock",
  });
  const searchQuery = useAdminInventorySearch(keyword);

  const { mutate: deleteItem, isPending: isDeleting } =
    useDeleteInventoryItem();

  const isSearchMode = Boolean(keyword);

  const flatSearchItems: InventoryItem[] = isSearchMode
    ? (searchQuery.data ?? [])
    : [];
  const groupedProducts: InventoryGroupedProduct[] = isSearchMode
    ? []
    : (listQuery.data?.items ?? []);

  const total = isSearchMode
    ? flatSearchItems.length
    : (listQuery.data?.total ?? 0);
  const totalPages = isSearchMode ? 1 : (listQuery.data?.totalPages ?? 1);
  const isLoading = isSearchMode ? searchQuery.isLoading : listQuery.isLoading;
  const isError = isSearchMode ? searchQuery.isError : listQuery.isError;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setKeyword(keywordInput.trim());
  }

  function confirmDelete() {
    if (!confirmDeleteId) return;
    deleteItem(confirmDeleteId, {
      onError: (err) =>
        alert(err instanceof ApiError ? err.message : "Suppression impossible"),
      onSettled: () => setConfirmDeleteId(null),
    });
  }

  function switchTab(newTab: Tab) {
    setTab(newTab);
    setPage(1);
    setKeyword("");
    setKeywordInput("");
  }

  function toggleExpand(productId: string) {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} /> Nouvel article
          </button>
        </div>
      </div>

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

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
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
            ) : isSearchMode ? (
              flatSearchItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Aucun article trouvé.
                  </td>
                </tr>
              ) : (
                flatSearchItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {item.product.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.combination?.sku ?? item.product.sku}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.warehouse.name}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <QuantityEditor
                          item={item}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <span
                          className={`font-medium ${item.quantity === 0 ? "text-red-600" : item.quantity <= 10 ? "text-amber-600" : ""}`}
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
                            onClick={() => setConfirmDeleteId(item.id)}
                            disabled={isDeleting}
                            className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )
            ) : groupedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun article trouvé.
                </td>
              </tr>
            ) : (
              groupedProducts.map((group) => {
                const isExpanded = expandedProductIds.has(group.productId);
                return (
                  <React.Fragment key={group.productId}>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <td colSpan={5} className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(group.productId)}
                          className="flex w-full items-center gap-2 text-left"
                        >
                          <ChevronRight
                            size={14}
                            className={`shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                          <span className="font-medium">
                            {group.productName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {group.productSku}
                          </span>
                          {group.isOutOfStock && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                              Rupture
                            </span>
                          )}
                          {!group.isOutOfStock && group.isLowStock && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                              Stock faible
                            </span>
                          )}
                          <span className="ml-auto whitespace-nowrap text-xs text-gray-500">
                            {group.lineCount} ligne(s) ·{" "}
                            <span
                              className={
                                group.totalQuantity === 0 ? "text-red-600" : ""
                              }
                            >
                              {group.totalQuantity} unité(s)
                            </span>{" "}
                            au total
                          </span>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <ExpandedProductRows
                        productId={group.productId}
                        warehouses={warehouses}
                      />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {tab === "all" && !isSearchMode && totalPages > 1 && (
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
        />
      )}

      {showCreateModal && (
        <CreateItemModal
          warehouses={warehouses}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Supprimer l'article d'inventaire"
        message="Cette action est irréversible. Voulez-vous vraiment continuer ?"
        confirmLabel="Supprimer"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
