// app/(checkout)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function CheckoutLayout({
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
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
