// lib/queries/admin/useShippingMethods.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminShippingMethodsApi } from "@/lib/api/admin/shippingMethods";
import { queryKeys } from "@/lib/queries/keys";
import type { ShippingMethodFormInput } from "@/lib/types";

export function useAdminShippingMethods() {
  return useQuery({
    queryKey: queryKeys.admin.shippingMethods,
    queryFn: adminShippingMethodsApi.list,
  });
}

export function useCreateShippingMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShippingMethodFormInput) =>
      adminShippingMethodsApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.shippingMethods }),
  });
}

export function useUpdateShippingMethod(methodId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShippingMethodFormInput) =>
      adminShippingMethodsApi.update(methodId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.shippingMethods }),
  });
}

export function useDeleteShippingMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (methodId: string) => adminShippingMethodsApi.remove(methodId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.shippingMethods }),
  });
}
