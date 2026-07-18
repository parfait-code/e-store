// app/(account)/account/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  Save,
  LogOut,
  Pencil,
  Check,
  Plus,
  Trash2,
  MapPin,
  Star,
  Coins,
  Mail,
  Phone,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import type { User, Address, AddressFormInput } from "@/lib/types";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useValidateAddress,
} from "@/lib/queries/shop/useCheckout";
import { useMyLoyaltyBalance } from "@/lib/queries/shop/useLoyalty";

function initials(user: User) {
  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
}

function ProfileHero({
  user,
  onLogout,
  balance,
  isLoadingBalance,
}: {
  user: User;
  onLogout: () => void;
  balance: number | undefined;
  isLoadingBalance: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-gray-900 via-gray-900 to-gray-700 p-6 text-white sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl font-semibold ring-2 ring-white/20">
            {initials(user)}
          </div>
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-white/70">@{user.username}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/account/loyalty"
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20"
          >
            <Coins size={16} className="text-amber-300" />
            {isLoadingBalance ? (
              <span className="h-4 w-10 animate-pulse rounded bg-white/20" />
            ) : (
              <span className="text-sm font-semibold">{balance ?? 0} pts</span>
            )}
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileInfoCard({
  user,
  onUpdated,
}: {
  user: User;
  onUpdated: (u: User) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function startEdit() {
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    });
    setError(null);
    setIsEditing(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await apiClient.patch<User>("/user", form);
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:bg-white focus:ring-1 focus:ring-gray-900";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Informations personnelles
        </h2>
        {!isEditing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          >
            <Pencil size={12} /> Modifier
          </button>
        )}
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Prénom
              </label>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Nom
              </label>
              <input
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Téléphone
            </label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              <Save size={14} />
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <dl className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Mail size={15} className="shrink-0 text-gray-400" />
            <span className="text-gray-700">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={15} className="shrink-0 text-gray-400" />
            <span className="text-gray-700">
              {user.phone ?? "Non renseigné"}
            </span>
          </div>
        </dl>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initial?: Address;
  onSubmit: (input: AddressFormInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<AddressFormInput>({
    recipientName: initial?.recipientName ?? "",
    phone: initial?.phone ?? "",
    street: initial?.street ?? "",
    addressLine2: initial?.addressLine2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    country: initial?.country ?? "",
    postalCode: initial?.postalCode ?? "",
    isDefault: initial?.isDefault ?? false,
  });
  const { mutate: validateAddress, isPending: isValidating } =
    useValidateAddress();
  const [validation, setValidation] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidation(null);

    validateAddress(
      {
        recipientName: form.recipientName,
        phone: form.phone || undefined,
        street: form.street,
        addressLine2: form.addressLine2 || undefined,
        city: form.city,
        state: form.state || undefined,
        country: form.country,
        postalCode: form.postalCode || undefined,
      },
      {
        onSuccess: (res) => {
          setValidation({
            valid: res.valid,
            message: res.valid
              ? "Adresse valide."
              : "Adresse non reconnue — vous pouvez tout de même l'enregistrer.",
          });
        },
        onError: () => setValidation(null),
      },
    );

    onSubmit(form);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:bg-white focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-4"
    >
      {validation && (
        <p
          className={`rounded-lg px-3 py-2 text-xs ${
            validation.valid
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {validation.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Destinataire
          </label>
          <input
            required
            minLength={2}
            value={form.recipientName}
            onChange={(e) =>
              setForm((f) => ({ ...f, recipientName: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Téléphone
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Rue
        </label>
        <input
          required
          value={form.street}
          onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Complément (optionnel)
        </label>
        <input
          value={form.addressLine2}
          onChange={(e) =>
            setForm((f) => ({ ...f, addressLine2: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Ville
          </label>
          <input
            required
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            État / région
          </label>
          <input
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Pays
          </label>
          <input
            required
            placeholder="CM, FR, US..."
            value={form.country}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Code postal
          </label>
          <input
            value={form.postalCode ? form.postalCode : ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, postalCode: e.target.value }))
            }
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) =>
            setForm((f) => ({ ...f, isDefault: e.target.checked }))
          }
        />
        Adresse par défaut
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting || isValidating}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          <Check size={14} />
          {isSubmitting || isValidating ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function AddressCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 p-4">
      <div className="h-4 w-2/5 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-4/5 rounded bg-gray-100" />
      <div className="mt-2 h-3 w-3/5 rounded bg-gray-100" />
    </div>
  );
}

function AddressesCard() {
  const { data: addresses = [], isLoading, isError } = useAddresses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate(input: AddressFormInput) {
    createAddress(input, {
      onSuccess: () => setShowCreateForm(false),
      onError: (err) =>
        setMutationError(
          err instanceof ApiError
            ? err.message
            : "Erreur lors de l'enregistrement",
        ),
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette adresse ?")) return;
    setDeletingId(id);
    deleteAddress(id, {
      onError: (err) =>
        alert(err instanceof ApiError ? err.message : "Suppression impossible"),
      onSettled: () => setDeletingId(null),
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <MapPin size={15} className="text-gray-500" />
          Mes adresses
        </h2>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            <Plus size={12} /> Ajouter
          </button>
        )}
      </div>

      {(isError || mutationError) && (
        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {mutationError ?? "Erreur de chargement"}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-4">
          <AddressForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isCreating}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AddressCardSkeleton />
          <AddressCardSkeleton />
        </div>
      ) : addresses.length === 0 && !showCreateForm ? (
        <p className="text-sm text-gray-400">Aucune adresse enregistrée.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((addr) =>
            editingId === addr.id ? (
              <div key={addr.id} className="sm:col-span-2">
                <EditAddressRow
                  address={addr}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div
                key={addr.id}
                className="group relative rounded-xl border border-gray-200 p-4 transition hover:border-gray-300"
              >
                {addr.isDefault && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                    <Star size={9} className="fill-amber-500 text-amber-500" />
                    Défaut
                  </span>
                )}
                <p className="pr-16 text-sm font-medium text-gray-900">
                  {addr.recipientName}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {addr.street}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                </p>
                <p className="text-xs text-gray-400">
                  {addr.postalCode ? `${addr.postalCode} ` : ""}
                  {addr.city}
                  {addr.state ? `, ${addr.state}` : ""} · {addr.country}
                </p>
                <div className="mt-3 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => setEditingId(addr.id)}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={isDeleting && deletingId === addr.id}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function EditAddressRow({
  address,
  onCancel,
}: {
  address: Address;
  onCancel: () => void;
}) {
  const { mutate: updateAddress, isPending } = useUpdateAddress(address.id);
  return (
    <AddressForm
      initial={address}
      isSubmitting={isPending}
      onCancel={onCancel}
      onSubmit={(input) => updateAddress(input, { onSuccess: onCancel })}
    />
  );
}

export default function AccountPage() {
  const { user, logout, updateUser } = useAuth();
  const { data: balanceRes, isLoading: isLoadingBalance } = useMyLoyaltyBalance(
    user?.id ?? null,
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      <ProfileHero
        user={user}
        onLogout={logout}
        balance={balanceRes?.balance}
        isLoadingBalance={isLoadingBalance}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileInfoCard user={user} onUpdated={updateUser} />
        </div>
        <div className="lg:col-span-2">
          <AddressesCard />
        </div>
      </div>
    </div>
  );
}
