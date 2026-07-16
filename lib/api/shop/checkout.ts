// lib/api/shop/checkout.ts
import { apiClient } from "@/lib/api-client";
import type {
  Address,
  AddressFormInput,
  AddressValidateInput,
  AddressValidateResponse,
  ShippingMethod,
  ShippingCostResponse,
  PaymentMethodOption,
  CouponValidateResponse,
  Order,
  OrderCreateInput,
} from "@/lib/types";

export const shopCheckoutApi = {
  listAddresses: () => apiClient.get<Address[]>("/addresses"),

  createAddress: (payload: AddressFormInput) =>
    apiClient.post<Address>("/addresses", payload),

  updateAddress: (addressId: string, payload: AddressFormInput) =>
    apiClient.patch<Address>(`/addresses/${addressId}`, payload),

  deleteAddress: (addressId: string) =>
    apiClient.delete(`/addresses/${addressId}`),

  validateAddress: (payload: AddressValidateInput) =>
    apiClient.post<AddressValidateResponse>("/address/validate", payload, {
      auth: false,
    }),

  listShippingMethods: () =>
    apiClient.get<ShippingMethod[]>("/shipping-methods?active=true"),

  calculateShippingCost: (
    shippingMethodId: string,
    weight: number,
    country: string,
  ) =>
    apiClient.post<ShippingCostResponse>(
      "/shipping-methods/calculate",
      { shippingMethodId, weight, country },
      { auth: false },
    ),

  listPaymentMethods: () =>
    apiClient.get<PaymentMethodOption[]>("/payment-methods"),

  validateCoupon: (
    code: string,
    items: { id: string; combinationId?: string; quantity: number }[],
  ) =>
    apiClient.post<CouponValidateResponse>("/coupons/validate", {
      code,
      items,
    }),

  createOrder: (payload: OrderCreateInput) =>
    apiClient.post<Order>("/orders", payload),

  createPayment: (payload: { order_id: string; method: string }) =>
    apiClient.post("/payments", payload),
};
