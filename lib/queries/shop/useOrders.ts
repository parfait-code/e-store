// lib/queries/shop/useOrders.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopOrdersApi } from "@/lib/api/shop/orders";
import { queryKeys } from "@/lib/queries/keys";
import type {
  ReturnCreateInput,
  ReviewCreateInput,
  OrderStatus,
} from "@/lib/types";

export function useMyOrders(
  params: { page?: number; status?: OrderStatus | "" } = {},
) {
  return useQuery({
    queryKey: queryKeys.shop.orders(params),
    queryFn: () => shopOrdersApi.list({ ...params, limit: 10 }),
    placeholderData: (prev) => prev,
  });
}

export function useMyOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.shop.order(orderId),
    queryFn: () => shopOrdersApi.byId(orderId),
    enabled: Boolean(orderId),
  });
}

export function useOrderReturns(orderId: string) {
  return useQuery({
    queryKey: queryKeys.shop.orderReturns(orderId),
    queryFn: () => shopOrdersApi.returnsForOrder(orderId),
    enabled: Boolean(orderId),
  });
}

export function useCancelOrder(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shopOrdersApi.cancel(orderId),
    onSuccess: () => {
      // La commande annulée peut avoir libéré du stock — le catalogue shop
      // n'a pas besoin d'être invalidé ici (pas montré dans la vue produit),
      // mais l'order lui-même et la liste doivent être rafraîchis.
      qc.invalidateQueries({ queryKey: queryKeys.shop.order(orderId) });
      qc.invalidateQueries({ queryKey: ["shop", "orders"] });
    },
  });
}

export function useCreateReturn(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReturnCreateInput) =>
      shopOrdersApi.createReturn(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shop.orderReturns(orderId) });
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewCreateInput) =>
      shopOrdersApi.createReview(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop", "orders"] });
    },
  });
}

export function useUpdateReview() {
  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: { rating: number; comment?: string };
    }) => shopOrdersApi.updateReview(reviewId, payload),
  });
}

export function useDeleteReview() {
  return useMutation({
    mutationFn: (reviewId: string) => shopOrdersApi.deleteReview(reviewId),
  });
}
