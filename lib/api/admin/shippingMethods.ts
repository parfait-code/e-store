// lib/api/admin/shippingMethods.ts
import { apiClient } from "@/lib/api-client";
import type { ShippingMethod, ShippingMethodFormInput } from "@/lib/types";

export const adminShippingMethodsApi = {
  list: () =>
    apiClient.get<ShippingMethod[]>("/shipping-methods?includeInactive=true"),

  create: (payload: ShippingMethodFormInput) =>
    apiClient.post<ShippingMethod>("/shipping-methods", payload),

  update: (methodId: string, payload: ShippingMethodFormInput) =>
    apiClient.patch<ShippingMethod>(`/shipping-methods/${methodId}`, payload),

  remove: (methodId: string) =>
    apiClient.delete(`/shipping-methods/${methodId}`),
};
