// app/(account)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, User, Package, Heart, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

const NAV_ITEMS = [
  { href: "/account", label: "Mon compte", icon: User },
  { href: "/account/orders", label: "Mes commandes", icon: Package },
  { href: "/account/pickup-requests", label: "Enlèvements", icon: Truck },
  { href: "/account/wishlist", label: "Liste de souhaits", icon: Heart },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          <aside className="lg:col-span-1">
            {/* Mobile / tablette : tabs horizontales scrollables */}
            <nav className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:hidden">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop : sidebar verticale sticky */}
            <nav className="sticky top-20 hidden space-y-1 rounded-lg border border-gray-200 bg-white p-3 lg:block">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <div className="lg:col-span-3">{children}</div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
