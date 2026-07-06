// app/admin/promotions/_components/PromotionWizard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Promotion } from "@/lib/types";
import { Stepper, type StepDefinition } from "@/components/admin/Stepper";
import { PromotionInfoForm } from "./PromotionInfoForm";
import { PromotionImages } from "./PromotionImages";
import { PromotionDiscounts } from "./PromotionDiscounts";
import { PromotionCoupons } from "./PromotionCoupons";

const STEPS: StepDefinition[] = [
  { id: "info", label: "Informations" },
  { id: "images", label: "Images" },
  { id: "discounts", label: "Remises" },
  { id: "coupons", label: "Coupons" },
];

export function PromotionWizard({
  initialPromotion,
}: {
  initialPromotion?: Promotion;
}) {
  const router = useRouter();
  const isEditingInitially = Boolean(initialPromotion);
  const [promotion, setPromotion] = useState<Promotion | null>(
    initialPromotion ?? null,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(isEditingInitially ? ["info"] : []),
  );

  const promotionExists = Boolean(promotion);

  const disabledIndexes = new Set<number>(
    !promotionExists ? STEPS.map((_, i) => i).filter((i) => i > 0) : [],
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

  function handleInfoSaved(saved: Promotion) {
    const wasNew = !promotion;
    setPromotion(saved);
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
          <PromotionInfoForm
            initialPromotion={promotion ?? undefined}
            onSuccess={handleInfoSaved}
          />
        )}
        {stepId === "images" && promotion && (
          <PromotionImages promotion={promotion} onUpdated={setPromotion} />
        )}
        {stepId === "discounts" && promotion && (
          <PromotionDiscounts promotion={promotion} onUpdated={setPromotion} />
        )}
        {stepId === "coupons" && promotion && (
          <PromotionCoupons promotion={promotion} onUpdated={setPromotion} />
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
            disabled={!promotionExists}
            className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
          >
            Étape suivante <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => router.push("/admin/promotions")}
            className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Terminer <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
