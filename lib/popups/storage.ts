// lib/popups/storage.ts
import type { PopupDisplayFrequency } from "@/lib/types";

const SESSION_PREFIX = "popup_seen_session:";
const DAILY_PREFIX = "popup_seen_daily:";

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// true si ce popup a déjà été montré et ne doit PAS être réaffiché
// maintenant, compte tenu de sa fréquence.
export function hasBeenSeen(
  popupId: string,
  frequency: PopupDisplayFrequency,
): boolean {
  if (frequency === "ALWAYS") return false;

  try {
    if (frequency === "ONCE_PER_SESSION") {
      return sessionStorage.getItem(SESSION_PREFIX + popupId) !== null;
    }
    // ONCE_PER_DAY
    return localStorage.getItem(DAILY_PREFIX + popupId) === todayKey();
  } catch {
    // storage indisponible (navigation privée stricte, etc.) — on considère
    // que le popup n'a jamais été vu plutôt que de bloquer l'affichage.
    return false;
  }
}

export function markAsSeen(popupId: string, frequency: PopupDisplayFrequency) {
  try {
    if (frequency === "ONCE_PER_SESSION") {
      sessionStorage.setItem(SESSION_PREFIX + popupId, "1");
    } else if (frequency === "ONCE_PER_DAY") {
      localStorage.setItem(DAILY_PREFIX + popupId, todayKey());
    }
    // ALWAYS : rien à enregistrer, il doit réapparaître à chaque visite.
  } catch {
    // quota dépassé ou navigation privée — l'échec silencieux est acceptable
    // ici : au pire le popup réapparaîtra plus souvent que prévu.
  }
}
