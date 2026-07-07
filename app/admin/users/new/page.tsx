// app/admin/users/new/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { User, UserFormInput, Role } from "@/lib/types";

const ROLE_OPTIONS: Role[] = ["USER", "ADMIN", "MANAGER", "SUPPORT"];

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState<UserFormInput>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    role: "USER",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof UserFormInput>(
    key: K,
    value: UserFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        // <input type="date"> renvoie "YYYY-MM-DD" — le backend attend un
        // ISO datetime complet.
        dateOfBirth: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : undefined,
      };
      const created = await apiClient.post<User>("/user", payload);
      router.push(`/admin/users/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        const details = err.details as
          | { fieldErrors?: Record<string, string[]> }
          | undefined;
        if (details?.fieldErrors) setFieldErrors(details.fieldErrors);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux utilisateurs
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouvel utilisateur</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={inputClass}
            />
            {fieldError("firstName") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("firstName")}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={inputClass}
            />
            {fieldError("lastName") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("lastName")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nom d'utilisateur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              className={inputClass}
            />
            {fieldError("username") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("username")}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
            {fieldError("email") && (
              <p className="mt-1 text-xs text-red-600">{fieldError("email")}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className={inputClass}
            />
            {fieldError("password") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("password")}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Téléphone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Date de naissance
            </label>
            <input
              type="date"
              value={form.dateOfBirth ?? ""}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              className={inputClass}
            />
            {fieldError("dateOfBirth") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("dateOfBirth")}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Rôle</label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value as Role)}
              className={inputClass}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
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
          Créer l'utilisateur
        </button>
      </form>
    </div>
  );
}
