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
  Basket,
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

  // Body désormais en camelCase, recipientName requis, postalCode optionnel
  validateAddress: (payload: AddressValidateInput) =>
    apiClient.post<AddressValidateResponse>("/address/validate", payload, {
      auth: false, // route publique
    }),

  listShippingMethods: () =>
    apiClient.get<ShippingMethod[]>("/shipping-methods?active=true"),

  // Le calcul exige désormais `country` en plus de shippingMethodId/weight
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

  validateCoupon: async (code: string) => {
    const basket = await apiClient.get<Basket>("/user/basket");
    return apiClient.post<CouponValidateResponse>("/coupons/validate", {
      code,
      basketId: basket.id,
    });
  },

  createOrder: (payload: OrderCreateInput) =>
    apiClient.post<Order>("/orders", payload),

  createPayment: (payload: { order_id: string; method: string }) =>
    apiClient.post("/payments", payload),
};
