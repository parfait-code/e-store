// app/admin/products/_components/ProductWizard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Boxes,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { Stepper, type StepDefinition } from "@/components/admin/Stepper";
import { StagedImagesManager } from "@/components/admin/StagedImagesManager";
import { ProductForm } from "./ProductForm";
import {
  useAdminProduct,
  useUploadProductImage,
  useDeleteProductImage,
  useSaveProductAttributes,
  useProductTags,
  useSaveProductTags,
} from "@/lib/queries/admin/useCatalog";
import { useAdminCategoryAttributes } from "@/lib/queries/admin/useCategories";
import { useAdminTags } from "@/lib/queries/admin/useTags";
import { useProductCombinationsList } from "@/lib/queries/admin/useProductVariants";
import { useEffect } from "react";

const STEPS: StepDefinition[] = [
  { id: "info", label: "Informations" },
  { id: "images", label: "Images" },
  { id: "attributes", label: "Caractéristiques" },
  { id: "tags", label: "Tags" },
  { id: "variants", label: "Variantes" },
];

// ---------- Étape Images ----------
function ImagesStep({ product }: { product: Product }) {
  const { mutateAsync: uploadImage } = useUploadProductImage(product.id);
  const { mutateAsync: deleteImage } = useDeleteProductImage(product.id);

  const sortedImages = product.images
    .slice()
    .sort((a, b) => a.position - b.position);
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
        deleteOne={async (imageId) => {
          await deleteImage(imageId);
        }}
        uploadOne={async (file) => {
          await uploadImage(file);
        }}
        maxTotal={5}
      />
      <p className="mt-3 text-xs text-gray-400">
        JPEG, PNG, WEBP ou GIF · 5 Mo max par fichier · 5 images max au total
      </p>
    </div>
  );
}

// ---------- Étape Caractéristiques (attributs isVariant:false) ----------
function AttributesStep({ product }: { product: Product }) {
  const { data: allDefinitions = [], isLoading } = useAdminCategoryAttributes(
    product.categoryId,
  );
  const definitions = allDefinitions.filter((d) => !d.isVariant);

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const {
    mutate: saveAttributes,
    isPending: isSaving,
    error: saveErr,
  } = useSaveProductAttributes(product.id);

  useEffect(() => {
    const initial: Record<string, string> = {};
    product.attributeValues.forEach((av) => {
      initial[av.attributeDefinition.id] = av.value;
    });
    setValues(initial);
  }, [product.attributeValues]);

  function handleSave() {
    setSaved(false);
    const attributes = definitions
      .filter((def) => values[def.id]?.trim())
      .map((def) => ({
        attributeDefinitionId: def.id,
        value: values[def.id],
      }));

    saveAttributes(attributes, {
      onSuccess: () => setSaved(true),
    });
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
      {saveErr && (
        <p className="mb-2 text-xs text-red-600">
          Erreur lors de l'enregistrement des attributs
        </p>
      )}
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
function TagsStep({ productId }: { productId: string }) {
  const { data: allTags = [], isLoading: isLoadingTags } = useAdminTags();
  const { data: productTags = [], isLoading: isLoadingProductTags } =
    useProductTags(productId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: saveTags, isPending: isSaving } =
    useSaveProductTags(productId);

  useEffect(() => {
    setSelectedIds(productTags.map((pt) => pt.tag.id));
  }, [productTags]);

  function toggle(tagId: string) {
    setSelectedIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    if (selectedIds.length === 0) {
      setError("Sélectionnez au moins un tag.");
      return;
    }
    saveTags(selectedIds, {
      onSuccess: () => setSaved(true),
      onError: () => setError("Erreur lors de l'enregistrement"),
    });
  }

  const isLoading = isLoadingTags || isLoadingProductTags;

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
  const { data: combinations = [], isLoading } = useProductCombinationsList(
    product.id,
  );

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
              {isLoading
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
  // On ne garde plus le produit complet en state local — seulement son id.
  // Le produit lui-même est relu en continu depuis le cache react-query
  // (voir `product` ci-dessous), pour rester à jour après chaque mutation
  // faite dans une étape (images, attributs, tags...). C'était la cause du
  // bug : une copie locale figée ne reflétait jamais ces mises à jour, ce
  // qui donnait l'impression que l'upload d'image, le changement de statut,
  // etc. échouaient alors qu'ils avaient réussi côté serveur.
  const [productId, setProductId] = useState<string | null>(
    initialProduct?.id ?? null,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(isEditingInitially ? ["info"] : []),
  );

  const { data: product } = useAdminProduct(productId ?? "");
  // Tant que le fetch n'a pas résolu juste après une création, on retombe
  // sur `initialProduct` pour éviter un flash vide.
  const effectiveProduct = product ?? initialProduct;

  const productExists = Boolean(productId);

  const disabledIndexes = new Set<number>(
    !productExists ? STEPS.map((_, i) => i).filter((i) => i > 0) : [],
  );

  const { data: categoryAttrs = [] } = useAdminCategoryAttributes(
    effectiveProduct?.categoryId ?? "",
  );
  const { data: productTags = [] } = useProductTags(productId ?? "");
  const { data: combinations = [] } = useProductCombinationsList(
    productId ?? "",
  );

  const derivedCompleted = new Set(completedSteps);
  if (effectiveProduct) {
    derivedCompleted.add("info");
    if (effectiveProduct.images.length > 0) derivedCompleted.add("images");

    const nonVariantDefs = categoryAttrs.filter((d) => !d.isVariant);
    const requiredNonVariant = nonVariantDefs.filter((d) => d.isRequired);
    const coveredIds = new Set(
      effectiveProduct.attributeValues.map((av) => av.attributeDefinition.id),
    );
    const allRequiredCovered = requiredNonVariant.every((d) =>
      coveredIds.has(d.id),
    );
    if (nonVariantDefs.length === 0 || allRequiredCovered) {
      derivedCompleted.add("attributes");
    }

    if (productTags.length > 0) derivedCompleted.add("tags");
    if (combinations.length > 0) derivedCompleted.add("variants");
  }

  function goTo(index: number) {
    if (disabledIndexes.has(index)) return;
    setCurrentStep(index);
  }

  function handleInfoSaved(saved: Product) {
    const wasNew = !productId;
    setProductId(saved.id);
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
        completed={derivedCompleted}
        onStepClick={goTo}
        disabledIndexes={disabledIndexes}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {stepId === "info" && (
          <ProductForm
            initialProduct={effectiveProduct}
            onSuccess={handleInfoSaved}
          />
        )}
        {stepId === "images" && effectiveProduct && (
          <ImagesStep product={effectiveProduct} />
        )}
        {stepId === "attributes" && effectiveProduct && (
          <AttributesStep product={effectiveProduct} />
        )}
        {stepId === "tags" && effectiveProduct && (
          <TagsStep productId={effectiveProduct.id} />
        )}
        {stepId === "variants" && effectiveProduct && (
          <VariantsStep product={effectiveProduct} />
        )}
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
