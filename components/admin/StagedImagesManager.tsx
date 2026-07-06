// components/admin/StagedImagesManager.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X, Loader2, Check } from "lucide-react";

export interface ExistingStagedImage {
  key: string; // identifiant unique utilisé pour la suppression + la clé React
  url: string;
  badge?: string; // ex: "Principale"
}

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface StagedImagesManagerProps {
  existingImages: ExistingStagedImage[];
  deleteOne: (key: string) => Promise<void>;
  uploadOne: (file: File) => Promise<void>;
  accept?: string;
  maxNewPerSelection?: number; // limite par sélection de fichiers
  maxTotal?: number; // limite globale (existantes visibles + en attente)
  addLabel?: string;
  helpText?: string;
}

// Petit wrapper qui fait apparaître une vignette en fondu à son montage —
// utilisé pour les images existantes ET pour les images en attente, afin
// qu'une image nouvellement affichée (après un upload réussi, ou au chargement
// initial) s'anime en douceur au lieu d'apparaître brutalement.
function FadeInThumb({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export function StagedImagesManager({
  existingImages,
  deleteOne,
  uploadOne,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxNewPerSelection = 5,
  maxTotal,
  addLabel = "Choisir",
  helpText,
}: StagedImagesManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(
    new Set(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    return () => {
      staged.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleExisting = existingImages.filter(
    (img) => !pendingDeletions.has(img.key),
  );
  const currentTotal = visibleExisting.length + staged.length;
  const remainingSlots = maxTotal
    ? Math.max(0, maxTotal - currentTotal)
    : Infinity;
  const canAddMore = remainingSlots > 0;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const allowed = Math.min(maxNewPerSelection, remainingSlots);
    if (allowed <= 0) return;
    const files = Array.from(fileList).slice(0, allowed);
    const next: StagedFile[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setStaged((prev) => [...prev, ...next]);
    setJustSaved(false);
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  }

  function toggleDeleteExisting(key: string) {
    setPendingDeletions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setJustSaved(false);
  }

  const hasChanges = staged.length > 0 || pendingDeletions.size > 0;

  async function handleCommit() {
    setError(null);
    setIsSaving(true);
    const total = pendingDeletions.size + staged.length;
    setProgress({ done: 0, total });
    let doneCount = 0;
    let failures = 0;

    for (const key of pendingDeletions) {
      try {
        await deleteOne(key);
      } catch {
        failures += 1;
      }
      doneCount += 1;
      setProgress({ done: doneCount, total });
    }

    // Upload une image à la fois, en retirant sa vignette "en attente" dès que
    // SON upload à elle réussit — plutôt que de vider tout le lot à la fin —
    // pour que le remplacement par l'image réelle enregistrée soit visible
    // progressivement, surtout avec plusieurs images à la fois.
    for (const s of staged) {
      try {
        await uploadOne(s.file);
        URL.revokeObjectURL(s.previewUrl);
        setStaged((prev) => prev.filter((item) => item.id !== s.id));
      } catch {
        failures += 1;
      }
      doneCount += 1;
      setProgress({ done: doneCount, total });
    }

    setIsSaving(false);
    setProgress(null);
    setPendingDeletions(new Set());

    if (failures > 0) {
      setError(
        `${failures} opération(s) ont échoué sur ${total}. Vérifiez la liste ci-dessous et réessayez si besoin.`,
      );
    } else {
      setJustSaved(true);
    }
  }

  const percent = progress
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {helpText && <p className="mb-3 text-xs text-gray-400">{helpText}</p>}

      <div className="flex flex-wrap gap-3">
        {visibleExisting.map((img) => (
          <FadeInThumb key={img.key}>
            <div className="group relative h-24 w-24 overflow-hidden rounded-md border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
              />
              {img.badge && (
                <span className="absolute left-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
                  {img.badge}
                </span>
              )}
              <button
                type="button"
                onClick={() => toggleDeleteExisting(img.key)}
                disabled={isSaving}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 disabled:opacity-50"
                title="Retirer (supprimée à l'enregistrement)"
              >
                <X size={12} className="text-red-600" />
              </button>
            </div>
          </FadeInThumb>
        ))}

        {staged.map((s) => (
          <FadeInThumb key={s.id}>
            <div className="group relative h-24 w-24 overflow-hidden rounded-md border-2 border-dashed border-gray-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.previewUrl}
                alt=""
                className="h-full w-full object-cover opacity-90"
              />
              <span className="absolute left-1 top-1 rounded-full bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Nouvelle
              </span>
              <button
                type="button"
                onClick={() => removeStaged(s.id)}
                disabled={isSaving}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 disabled:opacity-50"
                title="Retirer cette image (pas encore envoyée)"
              >
                <X size={12} className="text-red-600" />
              </button>
            </div>
          </FadeInThumb>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <Upload size={18} />
            <span className="text-xs">{addLabel}</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          hidden
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {pendingDeletions.size > 0 && (
        <p className="mt-2 text-xs text-amber-600">
          {pendingDeletions.size} image(s) marquée(s) pour suppression —
          effective uniquement après enregistrement.
        </p>
      )}

      {progress && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>Enregistrement en cours...</span>
            <span>
              {percent}% ({progress.done}/{progress.total})
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gray-900 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleCommit}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Enregistrer les images
        </button>
        {justSaved && !hasChanges && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check size={14} /> Enregistré
          </span>
        )}
        {hasChanges && !isSaving && (
          <span className="text-xs text-gray-400">
            Modifications non enregistrées
          </span>
        )}
      </div>
    </div>
  );
}
