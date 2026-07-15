// lib/wishlist/guest-storage.ts
const STORAGE_KEY = "guest_wishlist_ids";

function readIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // quota dépassé / navigation privée stricte — échec silencieux
  }
}

export function isInGuestWishlist(productId: string): boolean {
  if (typeof window === "undefined") return false;
  return readIds().has(productId);
}

export function toggleGuestWishlist(productId: string): boolean {
  const ids = readIds();
  let added: boolean;
  if (ids.has(productId)) {
    ids.delete(productId);
    added = false;
  } else {
    ids.add(productId);
    added = true;
  }
  writeIds(ids);
  return added;
}
