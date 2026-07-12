// lib/queries/admin/useOrders.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrdersApi } from "@/lib/api/admin/orders";
import { queryKeys } from "@/lib/queries/keys";
import type { Order, OrderStatus, OrderStatusUpdateInput } from "@/lib/types";

export function useAdminOrders(params: {
  page: number;
  status?: OrderStatus | "";
  customer?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.orders(params),
    queryFn: () => adminOrdersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.admin.order(orderId),
    queryFn: () => adminOrdersApi.byId(orderId),
    enabled: Boolean(orderId),
  });
}

export function useExpireStaleOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminOrdersApi.expireStale(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

// Le point d'attention métier (STATUS_MANAGEMENT.md §2) : le statut de
// l'expédition liée n'est PAS automatiquement synchronisé avec la commande
// dans l'autre sens — mais niveau frontend, changer le statut d'une commande
// peut faire apparaître/disparaître les contraintes affichées sur
// l'expédition (ex: "créez une expédition d'abord"). On invalide donc les
// DEUX côtés à chaque mutation qui touche l'un ou l'autre.
export function useAdminOrderShipment(orderId: string) {
  return useQuery({
    queryKey: queryKeys.admin.orderShipment(orderId),
    queryFn: () => adminOrdersApi.shipmentForOrder(orderId),
    enabled: Boolean(orderId),
  });
}

export function useUpdateOrderStatus(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderStatusUpdateInput) =>
      adminOrdersApi.updateStatus(orderId, payload),
    onSuccess: (updated: Order) => {
      qc.setQueryData(queryKeys.admin.order(orderId), updated);
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      // Une transition SHIPPED/DELIVERED peut avoir été bloquée/débloquée par
      // l'état de l'expédition — on revalide le panneau "Expédition liée"
      // pour refléter tout effet de bord côté backend (event bus).
      qc.invalidateQueries({
        queryKey: queryKeys.admin.orderShipment(orderId),
      });
    },
  });
}
