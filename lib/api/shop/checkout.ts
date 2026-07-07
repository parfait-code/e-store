// lib/api/shop/checkout.ts
import { apiClient } from "@/lib/api-client";
import type {
  Address,
  AddressFormInput,
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

  validateAddress: (payload: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postal_code: string;
  }) => apiClient.post<AddressValidateResponse>("/address/validate", payload),

  listShippingMethods: () =>
    apiClient.get<ShippingMethod[]>("/shipping-methods?active=true"),

  calculateShippingCost: (shippingMethodId: string, weight: number) =>
    apiClient.post<ShippingCostResponse>("/shipping-methods/calculate", {
      shippingMethodId,
      weight,
    }),

  listPaymentMethods: () =>
    apiClient.get<PaymentMethodOption[]>("/payment-methods"),

  // POST /coupons/validate exige un basketId — get-or-create via /user/basket
  // (workaround documenté : les routes /basket réelles ne sont plus utilisées
  // pour l'achat, seulement pour satisfaire ce endpoint).
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
