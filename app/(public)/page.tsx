// app/(public)/page.tsx
import type { Metadata } from "next";
import { Truck, ShieldCheck, RotateCcw, HeadphonesIcon } from "lucide-react";
import {
  PromotionsSection,
  CategoriesSection,
  CatalogPreviewSection,
  NewArrivalsSection,
} from "./_components/HomeDynamicSections";
import { HeroSection } from "./_components/HeroSection";

export const metadata: Metadata = {
  title: "E-Store — Boutique en ligne",
  description:
    "Découvrez notre sélection de produits au meilleur prix, livrés où que vous soyez.",
};

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

export default function HomePage() {
  return (
    <div className="space-y-14">
      <HeroSection />

      {/* Réassurance — statique */}
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

      <PromotionsSection />
      <NewArrivalsSection />
      <CategoriesSection />
      <CatalogPreviewSection />
    </div>
  );
}
