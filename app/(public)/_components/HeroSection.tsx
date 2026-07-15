// app/(public)/_components/HeroSection.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useActivePromotions } from "@/lib/queries/shop/usePromotions";

function FallbackHero() {
  return (
    <section className="overflow-hidden rounded-2xl bg-gray-900 px-8 py-16 text-center text-white sm:py-20">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-gray-400">
        Nouvelle collection disponible
      </p>
      <h1 className="text-3xl font-semibold sm:text-4xl">
        Bienvenue sur E-Store
      </h1>
      <p className="mx-auto mt-3 max-w-md text-gray-300">
        Découvrez notre sélection de produits au meilleur prix, livrés où que
        vous soyez.
      </p>
      <Link
        href="/products"
        className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
      >
        Voir le catalogue
      </Link>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div className="aspect-12/5 w-full animate-pulse rounded-2xl bg-gray-200" />
  );
}

export function HeroSection() {
  const { data, isLoading, isError } = useActivePromotions({
    slot: "hero",
    limit: 5,
  });
  const slides = data?.items ?? [];
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  if (isLoading) return <HeroSkeleton />;
  if (isError || slides.length === 0) return <FallbackHero />;

  function goPrev() {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }
  function goNext() {
    setIndex((prev) => (prev + 1) % slides.length);
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((promo, i) => {
          const bgImage = promo.heroImages[0] ?? promo.images[0] ?? null;

          return (
            <Link
              key={promo.id}
              href={`/promotions/${promo.slug}`}
              className="relative aspect-12/5 w-full shrink-0"
              aria-label={promo.name}
            >
              {bgImage ? (
                <Image
                  src={bgImage}
                  alt={promo.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority={i === 0}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <span className="text-lg font-semibold text-white">
                    {promo.name}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-5 w-5 text-gray-900" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white"
            aria-label="Suivant"
          >
            <ChevronRight className="h-5 w-5 text-gray-900" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Aller au slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
