// app/admin/categories/_components/CategoryWizard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { Stepper, type StepDefinition } from "@/components/admin/Stepper";
import { CategoryForm } from "./CategoryForm";
import { CategoryAssetsUploader } from "./CategoryAssetsUploader";
import { CategoryAttributes } from "./CategoryAttributes";

const STEPS: StepDefinition[] = [
  { id: "info", label: "Informations" },
  { id: "assets", label: "Image & icône" },
  { id: "attributes", label: "Attributs" },
];

export function CategoryWizard({
  initialCategory,
}: {
  initialCategory?: Category;
}) {
  const router = useRouter();
  const isEditingInitially = Boolean(initialCategory);
  const [category, setCategory] = useState<Category | null>(
    initialCategory ?? null,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(isEditingInitially ? ["info"] : []),
  );

  const categoryExists = Boolean(category);

  const disabledIndexes = new Set<number>(
    !categoryExists ? STEPS.map((_, i) => i).filter((i) => i > 0) : [],
  );

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

  function handleInfoSaved(saved: Category) {
    const wasNew = !category;
    setCategory(saved);
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
          <CategoryForm
            initialCategory={category ?? undefined}
            onSuccess={handleInfoSaved}
          />
        )}
        {stepId === "assets" && category && (
          <CategoryAssetsUploader category={category} onUpdated={setCategory} />
        )}
        {stepId === "attributes" && category && (
          <CategoryAttributes categoryId={category.id} />
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
            disabled={!categoryExists}
            className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
          >
            Étape suivante <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => router.push("/admin/categories")}
            className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Terminer <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
