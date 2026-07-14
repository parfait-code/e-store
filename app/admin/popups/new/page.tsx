// app/admin/popups/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PopupForm } from "../_components/PopupForm";

export default function NewPopupPage() {
  const router = useRouter();

  return (
    <div>
      <Link
        href="/admin/popups"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux popups
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouveau popup</h1>

      <PopupForm onSuccess={() => router.push("/admin/popups")} />
    </div>
  );
}
