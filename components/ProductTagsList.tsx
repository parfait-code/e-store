// components/ProductTagsList.tsx
"use client";

import Link from "next/link";
import { Tag as TagIcon } from "lucide-react";
import { useProductTags } from "@/lib/queries/shop/useTags";

function TagsRowSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="h-6 w-14 animate-pulse rounded-full bg-gray-100" />
      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
    </div>
  );
}

export function ProductTagsList({ productId }: { productId: string }) {
  const { data: tags = [], isLoading } = useProductTags(productId);

  if (isLoading) return <TagsRowSkeleton />;
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TagIcon size={14} className="text-gray-400" />
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/search?tag=${tag.slug}`}
          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
