// components/admin/Stepper.tsx
"use client";

import { Check } from "lucide-react";

export interface StepDefinition {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepDefinition[];
  currentIndex: number;
  completed: Set<string>;
  onStepClick?: (index: number) => void;
  disabledIndexes?: Set<number>;
}

export function Stepper({
  steps,
  currentIndex,
  completed,
  onStepClick,
  disabledIndexes,
}: StepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = completed.has(step.id);
          const isCurrent = index === currentIndex;
          const isDisabled = disabledIndexes?.has(index) ?? false;
          const clickable = Boolean(onStepClick) && !isDisabled;

          return (
            <div
              key={step.id}
              className="flex flex-1 items-center last:flex-none"
            >
              <button
                type="button"
                onClick={() => clickable && onStepClick!(index)}
                disabled={!clickable}
                title={step.label}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition ${
                  isCompleted
                    ? "border-gray-900 bg-gray-900 text-white"
                    : isCurrent
                      ? "border-gray-900 bg-white text-gray-900"
                      : "border-gray-300 bg-white text-gray-400"
                } ${
                  clickable
                    ? "cursor-pointer hover:border-gray-600"
                    : "cursor-default"
                } ${isDisabled ? "opacity-50" : ""}`}
              >
                {isCompleted ? <Check size={16} /> : index + 1}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    isCompleted ? "bg-gray-900" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex-1 px-1 text-center text-xs ${
              index === currentIndex
                ? "font-medium text-gray-900"
                : "text-gray-500"
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}