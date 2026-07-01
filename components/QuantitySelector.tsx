// components/QuantitySelector.tsx
"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center rounded-md border border-gray-300">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 text-center text-sm font-medium">{quantity}</span>
      <button
        type="button"
        onClick={() =>
          onChange(max ? Math.min(max, quantity + 1) : quantity + 1)
        }
        disabled={max !== undefined && quantity >= max}
        className="p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
