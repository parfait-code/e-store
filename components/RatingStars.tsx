// components/RatingStars.tsx
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number; // 0-5
  count?: number;
  size?: number;
}

export function RatingStars({ rating, count, size = 14 }: RatingStarsProps) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < rounded ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
}
