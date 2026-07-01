// app/(public)/signup/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useCart } from "@/lib/cart/cart-context";
import type { AuthResponse, SignupFormInput } from "@/lib/types";
import Cookies from "js-cookie";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupFormInput>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { syncToServer } = useCart();

  function update<K extends keyof SignupFormInput>(
    key: K,
    value: SignupFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const data = await apiClient.post<AuthResponse>("/signup", form, {
        auth: false,
      });
      Cookies.set("token", data.token, { expires: 7, sameSite: "lax" });
      Cookies.set("user", JSON.stringify(data.user), {
        expires: 7,
        sameSite: "lax",
      });
      await syncToServer(); // ← nouveau
      window.location.href = "/";
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
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Créer un compte</h1>
          <p className="mt-1 text-sm text-gray-500">
            Rejoignez E-Store en quelques secondes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Prénom</label>
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
              <label className="mb-1 block text-sm font-medium">Nom</label>
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

          <div>
            <label className="mb-1 block text-sm font-medium">
              Nom d'utilisateur
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
            <label className="mb-1 block text-sm font-medium">Email</label>
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

          <div>
            <label className="mb-1 block text-sm font-medium">
              Mot de passe
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
            <label className="mb-1 block text-sm font-medium">
              Téléphone (optionnel)
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            Créer mon compte
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-gray-900 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
