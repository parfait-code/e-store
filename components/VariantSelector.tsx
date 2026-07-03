// components/VariantSelector.tsx
"use client";

import type { ProductCombination, CombinationAttributeRef } from "@/lib/types";

interface CombinationSelectorProps {
  combinations: ProductCombination[];
  selectedCombination: ProductCombination | null;
  onSelect: (combination: ProductCombination | null) => void;
}

interface AttributeGroup {
  definition: CombinationAttributeRef;
  values: { id: string; value: string; colorHex: string | null }[];
}

function buildAttributeGroups(
  combinations: ProductCombination[],
): AttributeGroup[] {
  const groups = new Map<string, AttributeGroup>();

  combinations.forEach((combo) => {
    combo.values.forEach((v) => {
      const defId = v.attributeDefinition.id;
      if (!groups.has(defId)) {
        groups.set(defId, { definition: v.attributeDefinition, values: [] });
      }
      const group = groups.get(defId)!;
      if (!group.values.some((o) => o.id === v.attributeOption.id)) {
        group.values.push(v.attributeOption);
      }
    });
  });

  return Array.from(groups.values());
}

export function VariantSelector({
  combinations,
  selectedCombination,
  onSelect,
}: CombinationSelectorProps) {
  const activeCombinations = combinations.filter((c) => c.isActive);
  const groups = buildAttributeGroups(activeCombinations);

  if (groups.length === 0) return null;

  function getOptionIdForAttribute(
    combo: ProductCombination | null,
    attributeDefinitionId: string,
  ): string | undefined {
    return combo?.values.find(
      (v) => v.attributeDefinition.id === attributeDefinitionId,
    )?.attributeOption.id;
  }

  function handlePick(attributeDefinitionId: string, optionId: string) {
    // Construit la combinaison de valeurs souhaitée (celle déjà sélectionnée + ce nouveau choix)
    const desired: Record<string, string> = {};
    groups.forEach((g) => {
      const current = getOptionIdForAttribute(
        selectedCombination,
        g.definition.id,
      );
      if (current) desired[g.definition.id] = current;
    });
    desired[attributeDefinitionId] = optionId;

    const match = activeCombinations.find((c) =>
      Object.entries(desired).every(
        ([defId, optId]) =>
          c.values.find((v) => v.attributeDefinition.id === defId)
            ?.attributeOption.id === optId,
      ),
    );

    onSelect(match ?? null);
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const currentOptionId = getOptionIdForAttribute(
          selectedCombination,
          group.definition.id,
        );
        const isColor = group.values.some((v) => v.colorHex !== null);

        return (
          <div key={group.definition.id}>
            <p className="mb-2 text-sm font-medium text-gray-700">
              {group.definition.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.values.map((option) => {
                const isSelected = currentOptionId === option.id;

                if (isColor && option.colorHex) {
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handlePick(group.definition.id, option.id)}
                      title={option.value}
                      className={`h-8 w-8 rounded-full border-2 ${
                        isSelected ? "border-gray-900" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: option.colorHex }}
                    />
                  );
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handlePick(group.definition.id, option.id)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {option.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
