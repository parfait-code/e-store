// app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Building2,
  Tag,
  Truck,
  RotateCcw,
  Coins,
  FolderTree,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/inventory", label: "Inventaire", icon: Warehouse },
  { href: "/admin/warehouses", label: "Entrepôts", icon: Building2 },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/shipments", label: "Expéditions", icon: Truck },
  { href: "/admin/returns", label: "Retours", icon: RotateCcw },
  { href: "/admin/loyalty", label: "Fidélité", icon: Coins },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <span className="text-lg font-semibold">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <div className="mb-2 px-3 text-sm">
            <p className="font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
