// components/PriceDisplay.tsx
import type { ProductPricing } from "@/lib/types";
import { formatXAF } from "@/lib/format";

interface PriceDisplayProps {
  price: number;
  pricing?: ProductPricing;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: { main: "text-sm font-medium", old: "text-xs" },
  md: { main: "text-base font-semibold", old: "text-sm" },
  lg: { main: "text-2xl font-semibold", old: "text-base" },
};

export function PriceDisplay({
  price,
  pricing,
  size = "md",
}: PriceDisplayProps) {
  const classes = SIZE_CLASSES[size];

  if (pricing?.hasDiscount) {
    return (
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`${classes.main} text-red-600`}>
          {formatXAF(pricing.finalPrice)}
        </span>
        <span className={`${classes.old} text-gray-400 line-through`}>
          {formatXAF(pricing.originalPrice)}
        </span>
        <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
          -{pricing.discountPercentage}%
        </span>
      </div>
    );
  }

  return <span className={classes.main}>{formatXAF(price)}</span>;
}
