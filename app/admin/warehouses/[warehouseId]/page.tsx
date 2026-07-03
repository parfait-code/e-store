// app/admin/warehouses/[warehouseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Warehouse, InventoryItem } from "@/lib/types";

export default function WarehouseDetailPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const [data, setData] = useState<{
    warehouse: Warehouse & { totalUnits: number };
    items: InventoryItem[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{
        warehouse: Warehouse & { totalUnits: number };
        items: InventoryItem[];
      }>(`/warehouses/${warehouseId}/inventory`)
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [warehouseId]);

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (error || !data) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Entrepôt introuvable."}
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/warehouses"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux entrepôts
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold">{data.warehouse.name}</h1>
        <p className="text-sm text-gray-500">
          {data.warehouse.location} · {data.warehouse.totalUnits} unité(s) en
          stock
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Combination</th>
              <th className="px-4 py-3">Quantité</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun article en stock ici.
                </td>
              </tr>
            ) : (
              data.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="font-medium">{item.product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.product.sku}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.combination?.sku ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${item.quantity <= 10 ? "text-amber-600" : ""}`}
                    >
                      {item.quantity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
