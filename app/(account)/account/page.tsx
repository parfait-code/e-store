// app/(account)/account/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { Loader2, Save, LogOut } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const updated = await apiClient.patch<User>("/user", form);
      updateUser(updated);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mon profil</h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"
      >
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Profil mis à jour.
          </p>
        )}

        <p className="text-xs text-gray-400">
          @{user.username} · rôle {user.role}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Prénom</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nom</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Téléphone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Enregistrer
        </button>
      </form>
    </div>
  );
}
