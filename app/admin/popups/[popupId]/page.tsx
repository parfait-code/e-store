// app/admin/popups/[popupId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAdminPopup } from "@/lib/queries/admin/usePopups";
import { PopupForm } from "../_components/PopupForm";

export default function EditPopupPage() {
  const { popupId } = useParams<{ popupId: string }>();
  const router = useRouter();
  const { data: popup, isLoading, isError } = useAdminPopup(popupId);

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (isError || !popup) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Popup introuvable.
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/popups"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux popups
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Modifier « {popup.title} »</h1>

      <PopupForm
        initialPopup={popup}
        onSuccess={() => router.push("/admin/popups")}
      />
    </div>
  );
}
