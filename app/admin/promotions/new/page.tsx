// app/admin/promotions/new/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Promotion, PromotionFormInput } from "@/lib/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewPromotionPage() {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<PromotionFormInput>({
    name: "",
    slug: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof PromotionFormInput>(
    key: K,
    value: PromotionFormInput[K],
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
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      const created = await apiClient.post<Promotion>("/promotions", payload);
      router.push(`/admin/promotions/${created.id}`);
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
        href="/admin/promotions"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux promotions
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouvelle promotion</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nom</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => {
                update("name", e.target.value);
                if (!slugTouched) update("slug", slugify(e.target.value));
              }}
              className={inputClass}
            />
            {fieldError("name") && (
              <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              className={inputClass}
            />
            {fieldError("slug") && (
              <p className="mt-1 text-xs text-red-600">{fieldError("slug")}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Date de début
            </label>
            <input
              type="datetime-local"
              required
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className={inputClass}
            />
            {fieldError("startDate") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("startDate")}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Date de fin
            </label>
            <input
              type="datetime-local"
              required
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className={inputClass}
            />
            {fieldError("endDate") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("endDate")}
              </p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Promotion active
        </label>

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
          Créer la promotion
        </button>
      </form>
    </div>
  );
}
