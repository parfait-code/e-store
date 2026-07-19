// app/admin/settings/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Search,
  SlidersHorizontal,
  Pencil,
  Check,
  X,
  Globe2,
  Store,
  CreditCard,
  Warehouse,
  Coins,
  ShieldCheck,
  ShoppingCart,
  Upload,
  LayoutGrid,
  Database,
  Settings2,
  Save
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type { Setting, SettingType } from "@/lib/types";
import {
  useAdminSettings,
  useUpdateSetting,
  useUpdateSettingsBulk,
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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  store: Store,
  payments: CreditCard,
  inventory: Warehouse,
  loyalty: Coins,
  security: ShieldCheck,
  orders: ShoppingCart,
  uploads: Upload,
  pagination: LayoutGrid,
  cache: Database,
};

const TYPE_STYLES: Record<SettingType, string> = {
  STRING: "bg-gray-100 text-gray-600",
  NUMBER: "bg-blue-50 text-blue-600",
  BOOLEAN: "bg-purple-50 text-purple-600",
  JSON: "bg-amber-50 text-amber-700",
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

// Aperçu lisible de la valeur courante, adapté par type (pas de JSON brut
// à rallonge affiché en une ligne, pas de "true"/"false" façon code pour un
// humain qui lit vite).
function displayValue(setting: Setting): string {
  if (setting.type === "BOOLEAN")
    return setting.value === "true" ? "Oui" : "Non";
  if (setting.type === "JSON") {
    try {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed)) return parsed.join(", ");
      return JSON.stringify(parsed);
    } catch {
      return setting.value;
    }
  }
  return setting.value;
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-gray-900" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SettingCard({ setting }: { setting: Setting }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => parseForEdit(setting));
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateSetting, isPending } = useUpdateSetting();

  function startEdit() {
    setDraft(parseForEdit(setting));
    setError(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setError(null);
    setIsEditing(false);
  }

  function handleSave() {
    setError(null);
    let value: unknown;
    try {
      value = serializeForSave(setting, draft);
    } catch {
      setError("JSON invalide — vérifiez la syntaxe.");
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
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <code className="text-sm font-medium text-gray-900">
              {setting.key}
            </code>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_STYLES[setting.type]}`}
            >
              {setting.type}
            </span>
            {setting.isPublic && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                <Globe2 size={10} /> Public
              </span>
            )}
          </div>
          {setting.description && (
            <p className="mt-1 text-xs text-gray-500">{setting.description}</p>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={startEdit}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          >
            <Pencil size={12} /> Modifier
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {isEditing ? (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {setting.type === "BOOLEAN" ? (
            <div className="flex items-center gap-3">
              <ToggleSwitch
                checked={draft === "true"}
                onChange={(v) => setDraft(v ? "true" : "false")}
              />
              <span className="text-sm text-gray-700">
                {draft === "true" ? "Activé" : "Désactivé"}
              </span>
            </div>
          ) : setting.type === "JSON" ? (
            <textarea
              rows={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              className={`${inputClass} font-mono text-xs leading-relaxed`}
            />
          ) : (
            <input
              type={setting.type === "NUMBER" ? "number" : "text"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className={inputClass}
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Enregistrer
            </button>
            <button
              onClick={cancelEdit}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <X size={12} /> Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <code className="block truncate text-xs text-gray-600">
            {displayValue(setting)}
          </code>
        </div>
      )}
    </div>
  );
}

function SaveCategoryButton({
  settings,
  drafts,
}: {
  settings: Setting[];
  drafts: Record<string, string>;
}) {
  const { mutate: saveBulk, isPending } = useUpdateSettingsBulk();
  const [error, setError] = useState<string | null>(null);

  const changed = settings.filter(
    (s) => drafts[s.key] !== undefined && drafts[s.key] !== s.value,
  );

  if (changed.length === 0) return null;

  function handleSave() {
    setError(null);
    try {
      const payload = changed.map((s) => ({
        key: s.key,
        value: serializeForSave(s, drafts[s.key]),
      }));
      saveBulk(payload, {
        onError: () => setError("Erreur lors de l'enregistrement groupé."),
      });
    } catch {
      setError("Une des valeurs JSON est invalide.");
    }
  }

  return (
    <div className="mb-3 flex items-center gap-2">
      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Save size={12} />
        )}
        Enregistrer {changed.length} modification(s) de cette catégorie
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings = [], isLoading, isError } = useAdminSettings();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    return settings.reduce<Record<string, Setting[]>>((acc, s) => {
      (acc[s.category] ??= []).push(s);
      return acc;
    }, {});
  }, [settings]);

  const categories = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return settings.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false;
      if (!q) return true;
      return (
        s.key.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [settings, activeCategory, search]);

  const filteredGrouped = useMemo(() => {
    return filtered.reduce<Record<string, Setting[]>>((acc, s) => {
      (acc[s.category] ??= []).push(s);
      return acc;
    }, {});
  }, [filtered]);

  const visibleCategories = search.trim()
    ? Object.keys(filteredGrouped).sort()
    : activeCategory
      ? [activeCategory]
      : categories;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-md bg-gray-900 p-2 text-white">
          <SlidersHorizontal size={18} />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Paramètres</h1>
          <p className="text-sm text-gray-500">
            Configuration à chaud de l'API — les changements sont appliqués
            immédiatement.
          </p>
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      )}

      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher un réglage..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <nav className="space-y-1 rounded-lg border border-gray-200 bg-white p-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                  activeCategory === null
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Settings2 size={15} /> Tous
                </span>
                <span
                  className={
                    activeCategory === null ? "text-gray-300" : "text-gray-400"
                  }
                >
                  {settings.length}
                </span>
              </button>
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] ?? Settings2;
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={15} />
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                    <span
                      className={active ? "text-gray-300" : "text-gray-400"}
                    >
                      {grouped[cat].length}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-8 lg:col-span-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
                <p className="text-sm text-gray-400">
                  Aucun réglage ne correspond à votre recherche.
                </p>
              </div>
            ) : (
              visibleCategories.map((cat) => (
                <div key={cat}>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                    {CATEGORY_LABELS[cat] ?? cat}
                    <span className="text-xs font-normal text-gray-400">
                      ({filteredGrouped[cat]?.length ?? 0})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(filteredGrouped[cat] ?? []).map((setting) => (
                      <SettingCard key={setting.id} setting={setting} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
