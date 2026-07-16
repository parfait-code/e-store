// lib/pricing.ts
import type { Product, ProductCombination, ProductPricing } from "@/lib/types";

export function computeCombinationPricing(
  product: Product,
  combination: ProductCombination | null,
): ProductPricing | undefined {
  if (!combination) return product.pricing;
  if (!product.pricing?.hasDiscount) return undefined;

  const basePrice = combination.price ?? product.price;

  if (combination.price === null || basePrice === product.price) {
    return product.pricing;
  }

  const { discountPercentage, discountAmount, promotionId, discountId } =
    product.pricing;

  const rebasedDiscountAmount =
    discountPercentage > 0
      ? Math.round(basePrice * (discountPercentage / 100))
      : Math.min(discountAmount, basePrice);

  const finalPrice = Math.max(0, basePrice - rebasedDiscountAmount);

  return {
    originalPrice: basePrice,
    finalPrice,
    discountAmount: rebasedDiscountAmount,
    discountPercentage,
    hasDiscount: true,
    promotionId,
    discountId,
  };
}

export function combinationValuesForDisplay(
  combination: ProductCombination | null,
) {
  if (!combination || !Array.isArray(combination.values)) return undefined;
  return combination.values.map((v) => ({
    name: v.attributeDefinition.name,
    value: v.attributeOption.value,
  }));
}
