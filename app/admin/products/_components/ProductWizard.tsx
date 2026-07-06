// app/admin/products/_components/ProductWizard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Boxes,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  Product,
  Tag,
  AttributeDefinition,
  ProductCombination,
} from "@/lib/types";
import { Stepper, type StepDefinition } from "@/components/admin/Stepper";
import { StagedImagesManager } from "@/components/admin/StagedImagesManager";
import { ProductForm } from "./ProductForm";

const STEPS: StepDefinition[] = [
  { id: "info", label: "Informations" },
  { id: "images", label: "Images" },
  { id: "attributes", label: "Caractéristiques" },
  { id: "tags", label: "Tags" },
  { id: "variants", label: "Variantes" },
];

// ---------- Étape Images ----------
function ImagesStep({
  product,
  onUpdated,
}: {
  product: Product;
  onUpdated: (p: Product) => void;
}) {
  async function uploadOne(file: File) {
    const formData = new FormData();
    formData.append("images", file);
    const updated = await apiClient.post<Product>(
      `/product/${product.id}/images`,
      formData,
      { isFormData: true },
    );
    onUpdated(updated);
  }

  async function deleteOne(imageId: string) {
    const updated = await apiClient.delete<Product>(
      `/product/${product.id}/images`,
      { imageId },
    );
    onUpdated(updated);
  }

  const sortedImages = product.images
    .slice()
    .sort((a, b) => a.position - b.position);
  // Une seule image doit porter le badge "Principale" — si le backend en
  // renvoyait plusieurs à isPrimary:true, on ne badge quand même que la
  // première trouvée (ou la première du tri à défaut) pour éviter que
  // toutes les vignettes affichent "Principale".
  const primaryImage =
    sortedImages.find((img) => img.isPrimary) ?? sortedImages[0];
  const existingImages = sortedImages.map((img) => ({
    key: img.id,
    url: img.url,
    badge:
      primaryImage && img.id === primaryImage.id ? "Principale" : undefined,
  }));

  return (
    <div className="max-w-2xl">
      <h2 className="mb-3 text-sm font-medium">Images du produit</h2>
      <StagedImagesManager
        existingImages={existingImages}
        deleteOne={deleteOne}
        uploadOne={uploadOne}
        maxTotal={5}
      />
      <p className="mt-3 text-xs text-gray-400">
        JPEG, PNG, WEBP ou GIF · 5 Mo max par fichier · 5 images max au total
      </p>
    </div>
  );
}

// ---------- Étape Caractéristiques (attributs isVariant:false) ----------
function AttributesStep({
  product,
  onUpdated,
}: {
  product: Product;
  onUpdated: (p: Product) => void;
}) {
  const [definitions, setDefinitions] = useState<AttributeDefinition[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get<AttributeDefinition[]>(
        `/categories/${product.categoryId}/attributes`,
      )
      .then((defs) => {
        const productDefs = defs.filter((d) => !d.isVariant);
        setDefinitions(productDefs);
        const initial: Record<string, string> = {};
        product.attributeValues.forEach((av) => {
          initial[av.attributeDefinition.id] = av.value;
        });
        setValues(initial);
      })
      .catch(() =>
        setError("Erreur lors du chargement des attributs de la catégorie"),
      )
      .finally(() => setIsLoading(false));
  }, [product.categoryId, product.attributeValues]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const attributes = definitions
        .filter((def) => values[def.id]?.trim())
        .map((def) => ({
          attributeDefinitionId: def.id,
          value: values[def.id],
        }));

      const updated = await apiClient.put<Product>(
        `/product/${product.id}/attributes`,
        { attributes },
      );
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'enregistrement des attributs",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  if (isLoading)
    return <Loader2 size={16} className="animate-spin text-gray-400" />;

  if (definitions.length === 0) {
    return (
      <div className="max-w-2xl">
        <h2 className="mb-2 text-sm font-medium">Caractéristiques produit</h2>
        <p className="text-sm text-gray-400">
          Aucun attribut produit (hors variante) défini pour cette catégorie —
          vous pouvez passer à l'étape suivante.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 text-sm font-medium">Caractéristiques produit</h2>
      <p className="mb-3 text-xs text-gray-400">
        Ces valeurs remplacent l'intégralité des caractéristiques du produit à
        chaque enregistrement. Les attributs marqués{" "}
        <span className="text-red-500">*</span> sont requis pour activer le
        produit.
      </p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        {definitions.map((def) => (
          <div key={def.id}>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {def.name}{" "}
              {def.isRequired && <span className="text-red-500">*</span>}
              {def.unit && <span className="text-gray-400"> ({def.unit})</span>}
            </label>
            {def.type === "SELECT" || def.type === "COLOR" ? (
              <select
                value={values[def.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [def.id]: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">Sélectionner...</option>
                {def.options.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.value}
                  </option>
                ))}
              </select>
            ) : def.type === "BOOLEAN" ? (
              <select
                value={values[def.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [def.id]: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">Sélectionner...</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            ) : (
              <input
                type={def.type === "NUMBER" ? "number" : "text"}
                value={values[def.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [def.id]: e.target.value }))
                }
                className={inputClass}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les caractéristiques"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 size={14} /> Enregistré
          </span>
        )}
      </div>
    </div>
  );
}

// ---------- Étape Tags ----------
function TagsStep({ productId }: { productId: number }) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [tags, productTags] = await Promise.all([
          apiClient.get<Tag[]>("/tags"),
          apiClient.get<{ tag: Tag }[]>(`/product/${productId}/tags`),
        ]);
        setAllTags(tags);
        setSelectedIds(productTags.map((pt) => pt.tag.id));
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Erreur de chargement des tags",
        );
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [productId]);

  function toggle(tagId: string) {
    setSelectedIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  async function handleSave() {
    if (selectedIds.length === 0) {
      setError("Sélectionnez au moins un tag.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiClient.put(`/product/${productId}/tags`, {
        tagIds: selectedIds,
      });
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'enregistrement",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading)
    return <Loader2 size={16} className="animate-spin text-gray-400" />;

  return (
    <div className="max-w-2xl">
      <h2 className="mb-3 text-sm font-medium">Tags</h2>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      {allTags.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucun tag n'existe encore.{" "}
          <Link href="/admin/tags" className="underline">
            Créer des tags →
          </Link>
        </p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = selectedIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggle(tag.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les tags"}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 size={14} /> Enregistré
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Étape Variantes ----------
function VariantsStep({ product }: { product: Product }) {
  const [combinations, setCombinations] = useState<ProductCombination[] | null>(
    null,
  );

  useEffect(() => {
    apiClient
      .get<ProductCombination[]>(`/product/${product.id}/combinations`)
      .then(setCombinations)
      .catch(() => setCombinations([]));
  }, [product.id]);

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 text-sm font-medium">Variantes</h2>
      <p className="mb-4 text-xs text-gray-400">
        La gestion des combinaisons (taille, couleur...) se fait sur un écran
        dédié, car elle implique plusieurs sous-étapes (sélection des options,
        génération, ajustement individuel).
      </p>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <Boxes size={20} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium">
              {combinations === null
                ? "Chargement..."
                : `${combinations.length} combinaison(s) active(s)`}
            </p>
            <p className="text-xs text-gray-500">
              Taille, couleur ou toute autre variante définie sur la catégorie.
            </p>
          </div>
        </div>
        <Link
          href={`/admin/products/${product.id}/variants`}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Gérer les combinaisons →
        </Link>
      </div>
    </div>
  );
}

// ---------- Wizard principal ----------
export function ProductWizard({
  initialProduct,
}: {
  initialProduct?: Product;
}) {
  const router = useRouter();
  const isEditingInitially = Boolean(initialProduct);
  const [product, setProduct] = useState<Product | null>(
    initialProduct ?? null,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(isEditingInitially ? ["info"] : []),
  );

  const productExists = Boolean(product);

  const disabledIndexes = new Set<number>(
    !productExists ? STEPS.map((_, i) => i).filter((i) => i > 0) : [],
  );

  // Toute étape traversée (qu'on quitte en avançant) est marquée comme
  // complétée — corrige le bug où seule "info" était jamais cochée, quelle
  // que soit la progression réelle dans les autres étapes.
  function goTo(index: number) {
    if (disabledIndexes.has(index)) return;
    if (index > currentStep) {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        for (let i = currentStep; i < index; i++) {
          next.add(STEPS[i].id);
        }
        return next;
      });
    }
    setCurrentStep(index);
  }

  function handleInfoSaved(saved: Product) {
    const wasNew = !product;
    setProduct(saved);
    setCompletedSteps((prev) => new Set(prev).add("info"));
    if (wasNew) {
      setCurrentStep(1);
    }
  }

  const stepId = STEPS[currentStep].id;

  return (
    <div>
      <Stepper
        steps={STEPS}
        currentIndex={currentStep}
        completed={completedSteps}
        onStepClick={goTo}
        disabledIndexes={disabledIndexes}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {stepId === "info" && (
          <ProductForm
            initialProduct={product ?? undefined}
            onSuccess={handleInfoSaved}
          />
        )}
        {stepId === "images" && product && (
          <ImagesStep product={product} onUpdated={setProduct} />
        )}
        {stepId === "attributes" && product && (
          <AttributesStep product={product} onUpdated={setProduct} />
        )}
        {stepId === "tags" && product && <TagsStep productId={product.id} />}
        {stepId === "variants" && product && <VariantsStep product={product} />}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          <ArrowLeft size={14} /> Précédent
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => goTo(currentStep + 1)}
            disabled={!productExists}
            className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
          >
            Étape suivante <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Terminer <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
