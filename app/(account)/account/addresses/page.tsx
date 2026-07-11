// app/(account)/account/addresses/page.tsx
"use client";

import { useState, FormEvent } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  Check,
  Star,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type {
  Address,
  AddressFormInput,
  AddressValidateResponse,
} from "@/lib/types";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useValidateAddress,
} from "@/lib/queries/shop/useCheckout";

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
  const [error, setError] = useState<string | null>(null);
  const { mutate: validateAddress, isPending: isValidating } =
    useValidateAddress();
  const [validation, setValidation] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
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
              : "Adresse non reconnue par le service de validation — vous pouvez tout de même l'enregistrer.",
          });
        },
        onError: () => setValidation(null),
      },
    );

    onSubmit(form);
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {validation && (
        <p
          className={`rounded-md px-3 py-2 text-xs ${validation.valid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
        >
          {validation.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nom du destinataire
          </label>
          <input
            type="text"
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
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Téléphone (optionnel)
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Rue
        </label>
        <input
          type="text"
          required
          value={form.street}
          onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Complément d'adresse (optionnel)
        </label>
        <input
          type="text"
          value={form.addressLine2}
          onChange={(e) =>
            setForm((f) => ({ ...f, addressLine2: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Ville
          </label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            État / région (optionnel)
          </label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Pays
          </label>
          <input
            type="text"
            required
            placeholder="CM, FR, US, GB, SN, CI, NG, GH"
            value={form.country}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Code postal (optionnel)
          </label>
          <input
            type="text"
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

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || isValidating}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting || isValidating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const { data: addresses = [], isLoading, isError } = useAddresses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();

  function handleCreate(input: import("@/lib/types").AddressFormInput) {
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
    deleteAddress(id, {
      onError: (err) =>
        alert(err instanceof ApiError ? err.message : "Suppression impossible"),
      onSettled: () => setConfirmDeleteId(null),
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mes adresses</h1>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} /> Nouvelle adresse
          </button>
        )}
      </div>

      {(isError || mutationError) && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
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
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune adresse enregistrée.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) =>
            editingId === addr.id ? (
              <EditAddressRow
                key={addr.id}
                address={addr}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={addr.id}
                className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {addr.recipientName}
                      </span>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                          <Star
                            size={10}
                            className="fill-amber-500 text-amber-500"
                          />{" "}
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {addr.street}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    </p>
                    <p className="text-xs text-gray-400">
                      {addr.postalCode ? `${addr.postalCode} ` : ""}
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ""} · {addr.country}
                      {addr.phone ? ` · ${addr.phone}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(addr.id)}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDeleteId(addr.id);
                      handleDelete(addr.id);
                    }}
                    disabled={isDeleting}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {isDeleting && confirmDeleteId === addr.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
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
