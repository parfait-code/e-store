// components/VariantSelector.tsx
"use client";

import type { Variant, AttributeDefinition } from "@/lib/types";

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant | null) => void;
}

interface AttributeGroup {
  definition: AttributeDefinition;
  values: string[];
}

function buildAttributeGroups(variants: Variant[]): AttributeGroup[] {
  const groups = new Map<string, AttributeGroup>();

  variants.forEach((variant) => {
    variant.attributeValues.forEach((av) => {
      const defId = av.attributeDefinition.id;
      if (!groups.has(defId)) {
        groups.set(defId, { definition: av.attributeDefinition, values: [] });
      }
      const group = groups.get(defId)!;
      if (!group.values.includes(av.value)) group.values.push(av.value);
    });
  });

  return Array.from(groups.values());
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: VariantSelectorProps) {
  const activeVariants = variants.filter((v) => v.isActive);
  const groups = buildAttributeGroups(activeVariants);

  if (groups.length === 0) return null;

  function getValueForAttribute(
    variant: Variant | null,
    attributeDefinitionId: string,
  ): string | undefined {
    return variant?.attributeValues.find(
      (av) => av.attributeDefinition.id === attributeDefinitionId,
    )?.value;
  }

  function handlePick(attributeDefinitionId: string, value: string) {
    // Construit la combinaison de valeurs souhaitée (celle déjà sélectionnée + ce nouveau choix)
    const desired: Record<string, string> = {};
    groups.forEach((g) => {
      const current = getValueForAttribute(selectedVariant, g.definition.id);
      if (current) desired[g.definition.id] = current;
    });
    desired[attributeDefinitionId] = value;

    const match = activeVariants.find((v) =>
      Object.entries(desired).every(
        ([defId, val]) =>
          v.attributeValues.find((av) => av.attributeDefinition.id === defId)
            ?.value === val,
      ),
    );

    onSelect(match ?? null);
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const currentValue = getValueForAttribute(
          selectedVariant,
          group.definition.id,
        );
        const isColor = group.definition.type === "COLOR";

        return (
          <div key={group.definition.id}>
            <p className="mb-2 text-sm font-medium text-gray-700">
              {group.definition.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const isSelected = currentValue === value;
                const option = group.definition.options.find(
                  (o) => o.value === value,
                );

                if (isColor && option?.colorHex) {
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handlePick(group.definition.id, value)}
                      title={value}
                      className={`h-8 w-8 rounded-full border-2 ${
                        isSelected ? "border-gray-900" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: option.colorHex }}
                    />
                  );
                }

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handlePick(group.definition.id, value)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {value}
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
