// app/(public)/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { formatDate } from "@/lib/format";
import { useCategories, useProducts } from "@/lib/queries/shop/useCatalog";
import { useActivePromotions } from "@/lib/queries/shop/usePromotions";

const TRUST_ITEMS = [
  {
    icon: Truck,
    label: "Livraison rapide",
    detail: "Partout au Cameroun et à l'international",
  },
  {
    icon: ShieldCheck,
    label: "Paiement sécurisé",
    detail: "À la livraison ou en ligne",
  },
  {
    icon: RotateCcw,
    label: "Retours simplifiés",
    detail: "Sous conditions, depuis votre compte",
  },
  {
    icon: HeadphonesIcon,
    label: "Support réactif",
    detail: "Une question ? On vous répond",
  },
];

// Palette déterministe à partir du nom : deux catégories identiques auront
// toujours le même badge, sans dépendre d'un champ couleur côté backend.
const AVATAR_COLORS = [
  "bg-rose-50 text-rose-600",
  "bg-blue-50 text-blue-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-cyan-50 text-cyan-600",
];

function colorForName(name: string) {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

// Composant Carrousel pour les promotions
function PromotionsCarousel({ promotions }: { promotions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = promotions.length;
  const slidesToShow = 2; // Nombre de promotions visibles en même temps

  // Calcul du nombre de slides visibles selon la taille d'écran
  const getSlidesToShow = useCallback(() => {
    if (typeof window === "undefined") return slidesToShow;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 2;
  }, []);

  const [currentSlidesToShow, setCurrentSlidesToShow] = useState(slidesToShow);

  useEffect(() => {
    const handleResize = () => {
      setCurrentSlidesToShow(getSlidesToShow());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getSlidesToShow]);

  // Navigation automatique
  useEffect(() => {
    if (isPaused || totalSlides <= currentSlidesToShow) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) =>
        prev + currentSlidesToShow >= totalSlides ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [currentSlidesToShow, isPaused, totalSlides]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? Math.max(0, totalSlides - currentSlidesToShow) : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev + currentSlidesToShow >= totalSlides ? 0 : prev + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, totalSlides - currentSlidesToShow));
  };

  // Si pas assez de promotions pour un carrousel, afficher en grille
  if (totalSlides <= currentSlidesToShow) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} />
        ))}
      </div>
    );
  }

  const visiblePromotions = promotions.slice(
    currentIndex,
    currentIndex + currentSlidesToShow
  );

  // Si on est à la fin, compléter avec les premiers éléments pour un défilement infini
  const displayPromotions =
    visiblePromotions.length < currentSlidesToShow
      ? [...visiblePromotions, ...promotions.slice(0, currentSlidesToShow - visiblePromotions.length)]
      : visiblePromotions;

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
            transform: `translateX(-${currentIndex * (100 / currentSlidesToShow)}%)`,
          }}
        >
          {promotions.map((promo, index) => (
            <div
              key={`${promo.id}-${index}`}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / currentSlidesToShow}%` }}
            >
              <PromotionCard promo={promo} />
            </div>
          ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      {totalSlides > currentSlidesToShow && (
        <>
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
        </>
      )}

      {/* Indicateurs de pagination */}
      {totalSlides > currentSlidesToShow && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({
            length: Math.ceil(totalSlides / currentSlidesToShow),
          }).map((_, idx) => {
            const dotIndex = idx * currentSlidesToShow;
            const isActive =
              currentIndex >= dotIndex &&
              currentIndex < dotIndex + currentSlidesToShow;
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
          })}
        </div>
      )}
    </div>
  );
}

// Composant carte de promotion
function PromotionCard({ promo }: { promo: any }) {
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
        {/* Badge de promotion */}
        {promo.discountPercentage && (
          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
            -{promo.discountPercentage}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-1">{promo.name}</h3>
        <p className="mt-1 text-xs text-gray-400">
          Jusqu'au {formatDate(promo.endDate)}
        </p>
        {promo.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {promo.description}
          </p>
        )}
      </div>
    </Link>
  );
}

function PromotionsSection() {
  const { data: promotions = [], isLoading } = useActivePromotions();
  const safePromotions = Array.isArray(promotions) ? promotions : [];

  if (isLoading || safePromotions.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Promotions en cours</h2>
        {safePromotions.length > 2 && (
          <Link
            href="/promotions"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Voir tout →
          </Link>
        )}
      </div>
      <PromotionsCarousel promotions={safePromotions} />
    </section>
  );
}

export default function HomePage() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 8,
  });
  const { data: allCategories = [] } = useCategories();

  const featuredProducts = Array.isArray(productsData?.items)
    ? productsData!.items
    : [];
  const categories = (Array.isArray(allCategories) ? allCategories : []).filter(
    (c) => c.parentId === null && c.isActive,
  );

  return (
    <div className="space-y-14">
      {/* Bannière */}
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
          Voir le catalogue <ArrowRight size={16} />
        </Link>
      </section>

      {/* Réassurance */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, label, detail }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-center sm:items-start sm:text-left"
          >
            <div className="rounded-md bg-gray-100 p-2">
              <Icon size={18} className="text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Promotions avec carrousel */}
      <PromotionsSection />

      {/* Catégories */}
      {categories.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Catégories</h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Tout voir →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${colorForName(c.name)}`}
                >
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <span className="block text-sm font-medium text-gray-800">
                    {c.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {c._count.products} produit(s)
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits en avant */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Produits en vedette</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <ProductGrid
          products={featuredProducts}
          isLoading={isLoadingProducts}
          emptyMessage="Aucun produit à afficher pour le moment."
        />
      </section>
    </div>
  );
}