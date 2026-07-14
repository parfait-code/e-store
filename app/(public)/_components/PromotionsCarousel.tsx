// app/(public)/_components/PromotionsCarousel.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { PromotionPublic } from "@/lib/types";

const DEFAULT_SLIDES_TO_SHOW = 2;

function PromotionCard({ promo }: { promo: PromotionPublic }) {
  const images = Array.isArray(promo.images) ? promo.images : [];

  return (
    <Link
      href={`/promotions/${promo.slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-3/1 w-full overflow-hidden bg-gray-100">
        {images[0] ? (
          <Image
            src={images[0]}
            alt={promo.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-900">
            <span className="text-lg font-semibold text-white">
              {promo.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-medium text-gray-900">{promo.name}</h3>
        <p className="mt-1 text-xs text-gray-400">
          Jusqu'au {formatDate(promo.endDate)}
        </p>
        {promo.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {promo.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export function PromotionsCarousel({
  promotions,
}: {
  promotions: PromotionPublic[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(DEFAULT_SLIDES_TO_SHOW);

  const totalSlides = promotions.length;

  const computeSlidesToShow = useCallback(() => {
    if (typeof window === "undefined") return DEFAULT_SLIDES_TO_SHOW;
    if (window.innerWidth < 640) return 1;
    return DEFAULT_SLIDES_TO_SHOW;
  }, []);

  useEffect(() => {
    const handleResize = () => setSlidesToShow(computeSlidesToShow());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computeSlidesToShow]);

  useEffect(() => {
    if (isPaused || totalSlides <= slidesToShow) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) =>
        prev + slidesToShow >= totalSlides ? 0 : prev + 1,
      );
    }, 4000);
    return () => clearInterval(timer);
  }, [slidesToShow, isPaused, totalSlides]);

  if (totalSlides <= slidesToShow) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} />
        ))}
      </div>
    );
  }

  function goToPrevious() {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? Math.max(0, totalSlides - slidesToShow) : prev - 1,
    );
  }
  function goToNext() {
    setCurrentIndex((prev) =>
      prev + slidesToShow >= totalSlides ? 0 : prev + 1,
    );
  }
  function goToSlide(index: number) {
    setCurrentIndex(Math.min(index, totalSlides - slidesToShow));
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
          }}
        >
          {promotions.map((promo, index) => (
            <div
              key={`${promo.id}-${index}`}
              className="shrink-0 px-2"
              style={{ width: `${100 / slidesToShow}%` }}
            >
              <PromotionCard promo={promo} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white sm:-translate-x-3"
        aria-label="Promotion précédente"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white sm:translate-x-3"
        aria-label="Promotion suivante"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(totalSlides / slidesToShow) }).map(
          (_, idx) => {
            const dotIndex = idx * slidesToShow;
            const isActive =
              currentIndex >= dotIndex &&
              currentIndex < dotIndex + slidesToShow;
            return (
              <button
                key={idx}
                onClick={() => goToSlide(dotIndex)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive ? "w-8 bg-gray-900" : "w-2 bg-gray-300"
                }`}
                aria-label={`Aller à la page ${idx + 1}`}
              />
            );
          },
        )}
      </div>
    </div>
  );
}
