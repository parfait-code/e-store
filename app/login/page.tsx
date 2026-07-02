// app/login/page.tsx
"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth, ApiError } from "@/lib/auth/auth-context";

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? undefined;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password, redirect);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Une erreur est survenue. Réessayez.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Connexion</h1>
          <p className="mt-1 text-sm text-gray-500">Accédez à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium"
            >
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              placeholder="votre_username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link
            href="/signup"
            className="font-medium text-gray-900 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
