// app/admin/warehouses/[warehouseId]/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Pencil,
  ArrowLeftRight,
  Save,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type {
  InventoryItem,
  Warehouse,
  InventoryTransferInput,
} from "@/lib/types";
import {
  useAdminInventoryGrouped,
  useAdminInventoryGroupedDetail,
  useUpdateInventoryItem,
  useTransferInventory,
  useAdminWarehouses,
} from "@/lib/queries/admin/useInventory";
import { useAlertDialog } from "@/components/admin/ModalProvider";

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
  const alertDialog = useAlertDialog();

  function handleSave() {
    updateItem(
      { itemId: item.id, quantity },
      {
        onSuccess: onCancel,
        onError: (err) =>
          alertDialog(
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
          {item.product.name} · {item.quantity} unité(s) disponible(s)
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

function inventoryItemLabel(item: InventoryItem): string {
  if (!item.combination) return item.product.name;
  return `${item.product.name} — ${item.combination.sku ?? "variante"}`;
}

function ExpandedProductRows({
  productId,
  productName,
  productSku,
  hasVariants,
  lines,
  warehouseId,
  warehouses,
}: {
  productId: string;
  productName: string;
  productSku: string;
  hasVariants: boolean;
  lines?: {
    id: string;
    warehouseId: string;
    warehouse: { id: string; name: string };
    quantity: number;
  }[];
  warehouseId: string;
  warehouses: Warehouse[];
}) {
  const { data, isLoading } = useAdminInventoryGroupedDetail(
    hasVariants ? productId : null,
    1,
    warehouseId,
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);

  if (hasVariants && isLoading) {
    return (
      <tr>
        <td colSpan={4} className="px-8 py-3">
          <Loader2 size={14} className="animate-spin text-gray-400" />
        </td>
      </tr>
    );
  }

  const rows: InventoryItem[] = hasVariants
    ? (data?.items ?? [])
    : (lines ?? []).map((line) => ({
        id: line.id,
        productId,
        combinationId: null,
        warehouseId: line.warehouseId,
        quantity: line.quantity,
        product: {
          id: productId,
          name: productName,
          sku: productSku,
          images: [],
        },
        warehouse: {
          id: line.warehouse.id,
          name: line.warehouse.name,
          location: "",
          capacity: null,
        },
        combination: null,
      }));

  return (
    <>
      {rows.map((item) => (
        <tr
          key={item.id}
          className="border-b border-gray-100 bg-white last:border-0"
        >
          <td className="px-4 py-2.5 pl-10 text-gray-600">
            {inventoryItemLabel(item)}
          </td>
          <td className="px-4 py-2.5 text-gray-500">
            {item.combination?.sku ?? item.product.sku ?? "—"}
          </td>
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
        <TransferModal
          item={transferItem}
          warehouses={warehouses}
          onClose={() => setTransferItem(null)}
        />
      )}
    </>
  );
}

export default function WarehouseDetailPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set(),
  );

  const { data: warehouses = [] } = useAdminWarehouses();
  const currentWarehouse = warehouses.find((w) => w.id === warehouseId);

  const { data, isLoading, isError } = useAdminInventoryGrouped({
    page,
    warehouseId,
    lowStock: tab === "low-stock",
    outOfStock: tab === "out-of-stock",
  });

  const groupedProducts = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function switchTab(newTab: Tab) {
    setTab(newTab);
    setPage(1);
  }

  function toggleExpand(productId: string) {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  const tabClass = (t: Tab) =>
    `flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${
      tab === t ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div>
      <Link
        href="/admin/warehouses"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux entrepôts
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          {currentWarehouse?.name ?? "Entrepôt"}
        </h1>
        <p className="text-sm text-gray-500">
          {currentWarehouse?.location} · {total} produit(s) en stock
        </p>
      </div>

      <div className="mb-4 flex gap-2">
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
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : groupedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun article en stock ici.
                </td>
              </tr>
            ) : (
              groupedProducts.map((group) => {
                const isExpanded = expandedProductIds.has(group.product.id);
                const isOutOfStock = group.outOfStockLineCount > 0;
                const isLowStock = !isOutOfStock && group.lowStockLineCount > 0;
                return (
                  <React.Fragment key={group.product.id}>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <td colSpan={4} className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(group.product.id)}
                          className="flex w-full items-center gap-2 text-left"
                        >
                          <ChevronRight
                            size={14}
                            className={`shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                          <Package
                            size={14}
                            className="shrink-0 text-gray-400"
                          />
                          <span className="font-medium">
                            {group.product.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {group.product.sku}
                          </span>
                          {isOutOfStock && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                              Rupture
                            </span>
                          )}
                          {!isOutOfStock && isLowStock && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                              Stock faible
                            </span>
                          )}
                          <span className="ml-auto whitespace-nowrap text-xs text-gray-500">
                            {group.hasVariants &&
                              `${group.combinationsWithStockCount} combinaison(s) · `}
                            <span
                              className={
                                group.totalQuantity === 0 ? "text-red-600" : ""
                              }
                            >
                              {group.totalQuantity} unité(s)
                            </span>
                          </span>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <ExpandedProductRows
                        productId={group.product.id}
                        productName={group.product.name}
                        productSku={group.product.sku}
                        hasVariants={group.hasVariants}
                        lines={group.lines}
                        warehouseId={warehouseId}
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

      {totalPages > 1 && (
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
    </div>
  );
}
