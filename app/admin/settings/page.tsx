// app/admin/settings/page.tsx
"use client";

import { useState } from "react";
import { Loader2, Save, Check, SlidersHorizontal } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type { Setting } from "@/lib/types";
import {
  useAdminSettings,
  useUpdateSetting,
} from "@/lib/queries/admin/useSettings";

const CATEGORY_LABELS: Record<string, string> = {
  store: "Boutique",
  payments: "Paiements",
  inventory: "Inventaire",
  loyalty: "Fidélité",
  security: "Sécurité",
  orders: "Commandes",
  uploads: "Fichiers",
  pagination: "Pagination",
  cache: "Cache",
};

function parseForEdit(setting: Setting): string {
  if (setting.type === "JSON") {
    try {
      return JSON.stringify(JSON.parse(setting.value), null, 2);
    } catch {
      return setting.value;
    }
  }
  return setting.value;
}

function serializeForSave(setting: Setting, raw: string): unknown {
  switch (setting.type) {
    case "NUMBER":
      return Number(raw);
    case "BOOLEAN":
      return raw === "true";
    case "JSON":
      return JSON.parse(raw); // laissé volontairement non try/catch — erreur affichée à l'utilisateur
    default:
      return raw;
  }
}

function SettingRow({ setting }: { setting: Setting }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => parseForEdit(setting));
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateSetting, isPending } = useUpdateSetting();

  function startEdit() {
    setDraft(parseForEdit(setting));
    setError(null);
    setIsEditing(true);
  }

  function handleSave() {
    setError(null);
    let value: unknown;
    try {
      value = serializeForSave(setting, draft);
    } catch {
      setError("JSON invalide.");
      return;
    }
    updateSetting(
      { key: setting.key, value },
      {
        onSuccess: () => setIsEditing(false),
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de l'enregistrement",
          ),
      },
    );
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs font-medium text-gray-800">
            {setting.key}
            {setting.isPublic && (
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                Public
              </span>
            )}
          </p>
          {setting.description && (
            <p className="mt-0.5 text-xs text-gray-500">
              {setting.description}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
          {setting.type}
        </span>
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {isEditing ? (
        <div className="mt-2 space-y-2">
          {setting.type === "BOOLEAN" ? (
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={inputClass}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : setting.type === "JSON" ? (
            <textarea
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={`${inputClass} font-mono text-xs`}
            />
          ) : (
            <input
              type={setting.type === "NUMBER" ? "number" : "text"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={inputClass}
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Enregistrer
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isPending}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <code className="max-w-md truncate text-xs text-gray-600">
            {setting.value}
          </code>
          <button
            onClick={startEdit}
            className="shrink-0 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Save size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings = [], isLoading, isError } = useAdminSettings();

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <SlidersHorizontal size={20} /> Paramètres
        </h1>
        <p className="text-sm text-gray-500">
          Configuration à chaud de l'API — les changements sont appliqués
          immédiatement.
        </p>
      </div>

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      )}

      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-3 text-sm font-medium text-gray-700">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="space-y-2">
                {items.map((setting) => (
                  <SettingRow key={setting.id} setting={setting} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
