// app/(checkout)/checkout/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, MapPin, Truck, Tag, Check } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useCart } from "@/lib/cart/cart-context";
import { formatXAF } from "@/lib/format";
import type { PaymentMethodType, OrderCreateInput } from "@/lib/types";
import {
  useAddresses,
  useShippingMethods,
  useShippingCosts,
  usePaymentMethods,
  useValidateCoupon,
  useCreateOrder,
  useCreatePayment,
} from "@/lib/queries/shop/useCheckout";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart, isLoaded } = useCart();

  const { data: addresses = [], isLoading: isLoadingAddresses } =
    useAddresses();
  const { data: shippingMethods = [], isLoading: isLoadingMethods } =
    useShippingMethods();
  const { data: paymentMethods = [], isLoading: isLoadingPayments } =
    usePaymentMethods();

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState({
    recipientName: "",
    phone: "",
    street: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | "">(
    "",
  );
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate: validateCoupon, isPending: isValidatingCoupon } =
    useValidateCoupon();
  const { mutateAsync: createOrder, isPending: isCreatingOrder } =
    useCreateOrder();
  const { mutateAsync: createPayment } = useCreatePayment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalWeight = items.reduce(
    (sum, i) => sum + (i.weight ?? 0) * i.quantity,
    0,
  );
  const shippingCountry = useNewAddress
    ? newAddress.country
    : (addresses.find((a) => a.id === selectedAddressId)?.country ?? "");

  const { costsByMethodId: shippingCosts, isLoading: isLoadingCosts } =
    useShippingCosts(shippingMethods, totalWeight, shippingCountry);

  const selectedShippingCost = shippingMethodId
    ? (shippingCosts[shippingMethodId] ?? 0)
    : 0;
  const grandTotal = totalAmount + selectedShippingCost;

  const isLoading = isLoadingAddresses || isLoadingMethods || isLoadingPayments;

  // Pré-sélection de l'adresse par défaut une fois les adresses chargées
  useEffect(() => {
    if (addresses.length === 0) {
      setUseNewAddress(true);
      return;
    }
    if (!selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (isLoaded && items.length === 0 && !isSubmitting) {
      router.push("/cart");
    }
  }, [isLoaded, items.length, isSubmitting, router]);

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!useNewAddress && !selectedAddressId) {
      setError("Sélectionnez une adresse de livraison.");
      return;
    }
    if (!paymentMethod) {
      setError("Sélectionnez un moyen de paiement.");
      return;
    }

    const shippingAddress = useNewAddress
      ? {
          recipientName: newAddress.recipientName,
          phone: newAddress.phone || undefined,
          street: newAddress.street,
          addressLine2: newAddress.addressLine2 || undefined,
          city: newAddress.city,
          state: newAddress.state || undefined,
          country: newAddress.country,
          postalCode: newAddress.postalCode || undefined,
        }
      : (() => {
          const a = addresses.find((x) => x.id === selectedAddressId)!;
          return {
            recipientName: a.recipientName,
            phone: a.phone ?? undefined,
            street: a.street,
            addressLine2: a.addressLine2 ?? undefined,
            city: a.city,
            state: a.state ?? undefined,
            country: a.country,
            postalCode: a.postalCode ?? undefined,
          };
        })();

    setIsSubmitting(true);
    try {
      const payload: OrderCreateInput = {
        items: items.map((i) => ({
          id: String(i.productId),
          combinationId: i.combinationId ?? undefined,
          quantity: i.quantity,
        })),

        shippingAddressId: useNewAddress ? undefined : selectedAddressId,

        shippingAddress: useNewAddress
          ? {
              recipientName: shippingAddress.recipientName,
              phone: shippingAddress.phone ?? undefined,
              street: shippingAddress.street,
              addressLine2: shippingAddress.addressLine2 ?? undefined,
              city: shippingAddress.city,
              state: shippingAddress.state ?? undefined,
              country: shippingAddress.country,
              postalCode: shippingAddress.postalCode ?? undefined,
            }
          : undefined,

        shippingMethodId: shippingMethodId || undefined,
        paymentMethodId: paymentMethod,
        couponCode: couponCode || undefined,
      };
      const order = await createOrder(payload);

      try {
        await createPayment({ order_id: order.id, method: paymentMethod });
      } catch {
        // La commande existe déjà même si le paiement échoue (ex: méthode 503)
        // — on redirige quand même, cohérent avec le comportement d'origine.
      }

      clearCart();
      router.push(`/account/orders/${order.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de la création de la commande",
      );
      setIsSubmitting(false);
    }
  }

  function handleValidateCoupon() {
    if (!couponCode.trim()) return;
    setCouponResult(null);
    validateCoupon(couponCode.trim(), {
      onSuccess: (res) => {
        setCouponResult({
          valid: res.valid,
          message: res.valid
            ? "Code valide — il sera appliqué à la confirmation."
            : (res.message ?? "Code invalide."),
        });
      },
      onError: (err) => {
        setCouponResult({
          valid: false,
          message:
            err instanceof ApiError ? err.message : "Code invalide ou expiré.",
        });
      },
    });
  }

  if (isLoading)
    return <Loader2 size={24} className="animate-spin text-gray-400" />;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Finaliser la commande</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <MapPin size={16} /> Adresse de livraison
            </h2>
            {addresses.length > 0 && !useNewAddress && (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-start gap-2 rounded-md border border-gray-200 p-3 text-sm"
                  >
                    <input
                      type="radio"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id)}
                      className="mt-0.5"
                    />
                    <span>
                      {a.street}, {a.postalCode} {a.city}
                      {a.state ? `, ${a.state}` : ""} — {a.country}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setUseNewAddress((v) => !v)}
              className="mt-3 text-xs font-medium text-gray-900 hover:underline"
            >
              {useNewAddress
                ? "Utiliser une adresse existante"
                : "+ Utiliser une nouvelle adresse"}
            </button>

            {useNewAddress && (
              <div className="mt-3 space-y-3">
                <input
                  placeholder="Rue"
                  required
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress((f) => ({ ...f, street: e.target.value }))
                  }
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Ville"
                    required
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress((f) => ({ ...f, city: e.target.value }))
                    }
                    className={inputClass}
                  />
                  <input
                    placeholder="État / région"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress((f) => ({ ...f, state: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Pays"
                    required
                    value={newAddress.country}
                    onChange={(e) =>
                      setNewAddress((f) => ({ ...f, country: e.target.value }))
                    }
                    className={inputClass}
                  />
                  <input
                    placeholder="Code postal"
                    required
                    value={newAddress.postalCode}
                    onChange={(e) =>
                      setNewAddress((f) => ({
                        ...f,
                        postalCode: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Truck size={16} /> Méthode de livraison
            </h2>
            <div className="space-y-2">
              {shippingMethods.map((m) => {
                const cost = shippingCosts[m.id];
                return (
                  <label
                    key={m.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={shippingMethodId === m.id}
                        onChange={() => setShippingMethodId(m.id)}
                      />
                      {m.name} — {m.estimatedDays} jour(s)
                    </span>
                    {isLoadingCosts ? (
                      <Loader2
                        size={14}
                        className="animate-spin text-gray-400"
                      />
                    ) : cost != null ? (
                      <span className="text-gray-500">{formatXAF(cost)}</span>
                    ) : (
                      <span className="text-xs font-medium text-green-600">
                        Livraison gratuite
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <CreditCard size={16} /> Moyen de paiement
            </h2>
            <div className="space-y-2">
              {paymentMethods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between rounded-md border p-3 text-sm ${m.available ? "border-gray-200" : "border-gray-100 opacity-50"}`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      disabled={!m.available}
                      checked={paymentMethod === m.id}
                      onChange={() =>
                        setPaymentMethod(m.id as PaymentMethodType)
                      }
                    />
                    {m.name}
                  </span>
                  {!m.available && (
                    <span className="text-xs text-gray-400">
                      {m.message ?? "Indisponible"}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-medium">Résumé</h2>
          <div className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.combinationId ?? "base"}`}
                className="flex justify-between text-gray-600"
              >
                <span className="line-clamp-1">
                  {item.name} × {item.quantity}
                </span>
                <span>
                  {formatXAF(
                    (item.pricing?.hasDiscount
                      ? item.pricing.finalPrice
                      : item.price) * item.quantity,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <Tag size={12} /> Code promo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponResult(null);
                }}
                placeholder="CODE"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleValidateCoupon}
                disabled={isValidatingCoupon || !couponCode.trim()}
                className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {isValidatingCoupon ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Vérifier"
                )}
              </button>
            </div>
            {couponResult && (
              <p
                className={`mt-1 text-xs ${couponResult.valid ? "text-green-600" : "text-red-600"}`}
              >
                {couponResult.message}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{formatXAF(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>
                {shippingMethodId
                  ? selectedShippingCost > 0
                    ? formatXAF(selectedShippingCost)
                    : "Gratuite"
                  : "—"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-100 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatXAF(grandTotal)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Remise coupon appliquée à la confirmation.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || isCreatingOrder}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting || isCreatingOrder ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Confirmer la commande
          </button>
        </div>
      </form>
    </div>
  );
}
