// lib/queries/shop/useCheckout.ts
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { shopCheckoutApi } from "@/lib/api/shop/checkout";
import { queryKeys } from "@/lib/queries/keys";
import type {
  AddressFormInput,
  ShippingMethod,
  OrderCreateInput,
} from "@/lib/types";

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.shop.addresses,
    queryFn: shopCheckoutApi.listAddresses,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressFormInput) =>
      shopCheckoutApi.createAddress(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.shop.addresses }),
  });
}

export function useUpdateAddress(addressId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressFormInput) =>
      shopCheckoutApi.updateAddress(addressId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.shop.addresses }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) => shopCheckoutApi.deleteAddress(addressId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.shop.addresses }),
  });
}

export function useValidateAddress() {
  // Purement informatif (le formulaire ne bloque jamais dessus) → mutation
  // simple, pas de cache à invalider.
  return useMutation({ mutationFn: shopCheckoutApi.validateAddress });
}

export function useShippingMethods() {
  return useQuery({
    queryKey: queryKeys.shop.shippingMethods,
    queryFn: shopCheckoutApi.listShippingMethods,
    staleTime: 5 * 60 * 1000, // change rarement
  });
}

// Une requête par méthode de livraison, en parallèle, chacune avec son
// propre cache — équivalent typé du Promise.allSettled manuel d'origine,
// mais avec dédoublonnage/cache automatique par (methodId, weight).
export function useShippingCosts(
  methods: ShippingMethod[],
  weight: number,
  country: string, // NOUVEAU paramètre requis
) {
  const results = useQueries({
    queries: methods.map((m) => ({
      queryKey: queryKeys.shop.shippingCost(m.id, weight, country),
      queryFn: () =>
        shopCheckoutApi.calculateShippingCost(m.id, weight, country),
      enabled: methods.length > 0 && Boolean(country),
      retry: 0,
    })),
  });

  const costsByMethodId: Record<string, number | null> = {};
  methods.forEach((m, i) => {
    const r = results[i];
    costsByMethodId[m.id] =
      r.isSuccess && typeof r.data?.cost === "number" ? r.data.cost : null;
  });

  return { costsByMethodId, isLoading: results.some((r) => r.isLoading) };
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.shop.paymentMethods,
    queryFn: shopCheckoutApi.listPaymentMethods,
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (code: string) => shopCheckoutApi.validateCoupon(code),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderCreateInput) =>
      shopCheckoutApi.createOrder(payload),
    onSuccess: () => {
      // La nouvelle commande doit apparaître dans "Mes commandes"
      qc.invalidateQueries({ queryKey: ["shop", "orders"] });
    },
  });
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: (payload: { order_id: string; method: string }) =>
      shopCheckoutApi.createPayment(payload),
  });
}
