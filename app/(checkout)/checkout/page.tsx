// app/(checkout)/checkout/page.tsx
"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, Truck, Tag, Check } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { formatXAF } from "@/lib/format";
import type {
  PaymentMethodType,
  OrderCreateInput,
  OrderAddressInput,
} from "@/lib/types";
import {
  useAddresses,
  useCreateAddress,
  useShippingMethods,
  useShippingCosts,
  usePaymentMethods,
  useValidateCoupon,
  useCreateOrder,
  useCreatePayment,
  useValidateAddress,
} from "@/lib/queries/shop/useCheckout";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { CountrySelect } from "@/components/CountrySelect";

function AddressSectionSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-14 rounded-md border border-gray-100 bg-gray-50" />
      <div className="h-14 rounded-md border border-gray-100 bg-gray-50" />
    </div>
  );
}

function ShippingSectionSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-12 rounded-md border border-gray-100 bg-gray-50" />
      <div className="h-12 rounded-md border border-gray-100 bg-gray-50" />
    </div>
  );
}

function PaymentSectionSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-12 rounded-md border border-gray-100 bg-gray-50" />
      <div className="h-12 rounded-md border border-gray-100 bg-gray-50" />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>();

  const { mutate: validateCoupon, isPending: isValidatingCoupon } =
    useValidateCoupon();
  const { mutateAsync: createOrder, isPending: isCreatingOrder } =
    useCreateOrder();
  const { mutateAsync: createPayment } = useCreatePayment();
  const { mutateAsync: createAddress } = useCreateAddress();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainCtaRef = useRef<HTMLButtonElement>(null);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(true);

  useEffect(() => {
    const el = mainCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsMainCtaVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalWeight = items.reduce(
    (sum, i) => sum + (i.weight ?? 0) * i.quantity,
    0,
  );
  const shippingCountry = useNewAddress
    ? newAddress.country
    : (addresses.find((a) => a.id === selectedAddressId)?.country ?? "");
  const hasShippingAddressInfo = Boolean(shippingCountry.trim());

  const {
    costsByMethodId: shippingCosts,
    estimatedDaysByMethodId,
    isLoading: isLoadingCosts,
  } = useShippingCosts(shippingMethods, totalWeight, shippingCountry);

  const selectedShippingCost = shippingMethodId
    ? (shippingCosts[shippingMethodId] ?? 0)
    : 0;
  const grandTotal = totalAmount + selectedShippingCost;

  const isCouponVerified = couponResult?.valid === true;

  const { mutate: validateAddress, isPending: isValidatingAddress } =
    useValidateAddress();
  const [addressValidation, setAddressValidation] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (addresses.length === 0) {
      setUseNewAddress(true);
      return;
    }
    if (!selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      const mostRecent = [...addresses].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
      setSelectedAddressId((defaultAddress ?? mostRecent).id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (isLoaded && items.length === 0 && !isSubmitting) {
      router.push("/cart");
    }
  }, [isLoaded, items.length, isSubmitting, router]);

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  function buildShippingAddress(): OrderAddressInput {
    if (useNewAddress) {
      return {
        recipientName: newAddress.recipientName,
        phone: newAddress.phone || undefined,
        street: newAddress.street,
        addressLine2: newAddress.addressLine2 || undefined,
        city: newAddress.city,
        state: newAddress.state || undefined,
        country: newAddress.country,
        postalCode: newAddress.postalCode || undefined,
      };
    }

    const a = addresses.find((x) => x.id === selectedAddressId);
    if (!a) {
      throw new Error("Adresse sélectionnée introuvable.");
    }

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
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setAuthModalMessage("Connectez-vous pour finaliser votre commande.");
      setShowAuthModal(true);
      return;
    }

    if (!useNewAddress && !selectedAddressId) {
      setError("Sélectionnez une adresse de livraison.");
      return;
    }
    if (useNewAddress && !hasShippingAddressInfo) {
      setError("Renseignez votre adresse de livraison.");
      return;
    }
    if (!shippingMethodId) {
      setError("Sélectionnez une méthode de livraison.");
      return;
    }
    if (!paymentMethod) {
      setError("Sélectionnez un moyen de paiement.");
      return;
    }

    setIsSubmitting(true);
    try {
      const shippingAddress = buildShippingAddress();
      let newlyCreatedAddressId: string | undefined;

      if (useNewAddress) {
        try {
          const saved = await createAddress({
            recipientName: shippingAddress.recipientName,
            phone: shippingAddress.phone,
            street: shippingAddress.street,
            addressLine2: shippingAddress.addressLine2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            country: shippingAddress.country,
            postalCode: shippingAddress.postalCode,
            isDefault: addresses.length === 0,
          });
          newlyCreatedAddressId = saved.id;
        } catch {
          // La commande peut tout de même être créée même si l'adresse n'a
          // pas pu être sauvegardée pour un usage futur.
        }
      }

      const payload: OrderCreateInput = {
        items: items.map((i) => ({
          id: String(i.productId),
          combinationId: i.combinationId ?? undefined,
          quantity: i.quantity,
        })),
        shippingAddressId: useNewAddress
          ? newlyCreatedAddressId
          : selectedAddressId,
        shippingAddress,
        shippingMethodId,
        paymentMethodId: paymentMethod,
        couponCode: isCouponVerified ? couponCode : undefined,
      };
      const order = await createOrder(payload);

      try {
        await createPayment({ order_id: order.id, method: paymentMethod });
      } catch {
        // La commande existe déjà même si le paiement échoue
      }

      clearCart();
      router.push(`/account/orders/${order.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthModalMessage(
          "Votre session a expiré. Reconnectez-vous pour finaliser votre commande.",
        );
        setShowAuthModal(true);
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erreur lors de la création de la commande",
        );
      }
      setIsSubmitting(false);
    }
  }

  function handleValidateCoupon() {
    if (!couponCode.trim()) return;

    if (!user) {
      setAuthModalMessage("Connectez-vous pour vérifier un code promo.");
      setShowAuthModal(true);
      return;
    }

    setCouponResult(null);
    validateCoupon(
      {
        code: couponCode.trim(),
        items: items.map((i) => ({
          id: String(i.productId),
          combinationId: i.combinationId ?? undefined,
          quantity: i.quantity,
        })),
      },
      {
        onSuccess: (res) => {
          const meetsMinimum = res.preview?.meetsMinimum ?? true;
          setCouponResult({
            valid: meetsMinimum,
            message: meetsMinimum
              ? `Code valide — remise « ${res.promotion.name} » appliquée à la confirmation.`
              : `Ce code nécessite un montant minimum de ${
                  res.preview?.minOrderAmount != null
                    ? formatXAF(res.preview.minOrderAmount)
                    : "—"
                } pour être appliqué.`,
          });
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 401) {
            setAuthModalMessage(
              "Votre session a expiré. Reconnectez-vous pour vérifier ce code promo.",
            );
            setShowAuthModal(true);
            return;
          }
          setCouponResult({
            valid: false,
            message:
              err instanceof ApiError
                ? err.message
                : "Code invalide ou expiré.",
          });
        },
      },
    );
  }

  return (
    <div className="pb-40 lg:pb-0">
      <h1 className="mb-6 text-xl font-semibold">Finaliser la commande</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3"
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
            {isLoadingAddresses ? (
              <AddressSectionSkeleton />
            ) : (
              <>
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
                          {a.isDefault && (
                            <span className="ml-2 text-xs text-gray-400">
                              (par défaut)
                            </span>
                          )}
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
                      placeholder="Nom du destinataire"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) =>
                        setNewAddress((f) => ({
                          ...f,
                          recipientName: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                    <input
                      placeholder="Rue"
                      required
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress((f) => ({
                          ...f,
                          street: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Ville"
                        required
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress((f) => ({
                            ...f,
                            city: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                      <input
                        placeholder="État / région"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress((f) => ({
                            ...f,
                            state: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <CountrySelect
                        value={newAddress.country}
                        onChange={(v) => {
                          setNewAddress((f) => ({ ...f, country: v }));
                          setAddressValidation(null);
                        }}
                        required
                        className={inputClass}
                      />
                      <input
                        placeholder="Code postal (optionnel)"
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
                    {useNewAddress && hasShippingAddressInfo && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAddressValidation(null);
                            validateAddress(
                              {
                                recipientName: newAddress.recipientName,
                                phone: newAddress.phone || undefined,
                                street: newAddress.street,
                                addressLine2:
                                  newAddress.addressLine2 || undefined,
                                city: newAddress.city,
                                state: newAddress.state || undefined,
                                country: newAddress.country,
                                postalCode: newAddress.postalCode || undefined,
                              },
                              {
                                onSuccess: (res) =>
                                  setAddressValidation({
                                    valid: res.valid,
                                    message: res.valid
                                      ? "Adresse reconnue."
                                      : "Adresse non reconnue — vous pouvez tout de même continuer.",
                                  }),
                              },
                            );
                          }}
                          disabled={isValidatingAddress}
                          className="text-xs font-medium text-gray-900 hover:underline disabled:opacity-50"
                        >
                          {isValidatingAddress
                            ? "Vérification..."
                            : "Vérifier l'adresse"}
                        </button>
                        {addressValidation && (
                          <p
                            className={`mt-1 text-xs ${addressValidation.valid ? "text-green-600" : "text-amber-600"}`}
                          >
                            {addressValidation.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Truck size={16} /> Méthode de livraison
            </h2>
            {isLoadingMethods ? (
              <ShippingSectionSkeleton />
            ) : (
              <>
                {!hasShippingAddressInfo && (
                  <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Renseignez votre adresse de livraison ci-dessus pour voir le
                    tarif de chaque méthode.
                  </p>
                )}
                <div className="space-y-2">
                  {shippingMethods.map((m) => {
                    const cost = shippingCosts[m.id];
                    const estimatedDays =
                      estimatedDaysByMethodId[m.id] ?? m.estimatedDays;
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm ${
                          !hasShippingAddressInfo ? "opacity-50" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            disabled={!hasShippingAddressInfo}
                            checked={shippingMethodId === m.id}
                            onChange={() => setShippingMethodId(m.id)}
                          />
                          {m.name} — {estimatedDays} jour(s)
                        </span>
                        {!hasShippingAddressInfo ? (
                          <span className="text-xs text-gray-400">
                            Adresse requise
                          </span>
                        ) : isLoadingCosts ? (
                          <span className="inline-block h-3 w-16 animate-pulse rounded bg-gray-200" />
                        ) : cost === 0 ? (
                          <span className="text-xs font-medium text-green-600">
                            Livraison gratuite
                          </span>
                        ) : cost != null ? (
                          <span className="text-gray-500">
                            {formatXAF(cost)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <CreditCard size={16} /> Moyen de paiement
            </h2>
            {isLoadingPayments ? (
              <PaymentSectionSkeleton />
            ) : (
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
            )}
          </section>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
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
                {isValidatingCoupon ? "..." : "Vérifier"}
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
                {!hasShippingAddressInfo
                  ? "—"
                  : shippingMethodId
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
            ref={mainCtaRef}
            type="submit"
            disabled={isSubmitting || isCreatingOrder}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting || isCreatingOrder ? "..." : <Check size={16} />}
            Confirmer la commande
          </button>
        </div>

        <div
          className={`fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-transform duration-200 lg:hidden ${
            isMainCtaVisible
              ? "pointer-events-none translate-y-full"
              : "translate-y-0"
          }`}
        >
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponResult(null);
              }}
              placeholder="Code promo"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={handleValidateCoupon}
              disabled={isValidatingCoupon || !couponCode.trim()}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {isValidatingCoupon ? "..." : "Vérifier"}
            </button>
          </div>
          {couponResult && (
            <p
              className={`mb-2 text-xs ${couponResult.valid ? "text-green-600" : "text-red-600"}`}
            >
              {couponResult.message}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-base font-semibold">{formatXAF(grandTotal)}</p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || isCreatingOrder}
              className="flex items-center justify-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting || isCreatingOrder ? "..." : <Check size={16} />}
              Confirmer
            </button>
          </div>
        </div>
      </form>

      <AuthRequiredModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authModalMessage}
      />
    </div>
  );
}
