// lib/api-server.ts
import type { ApiResponse } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://britannica-glenn-kid-versions.trycloudflare.com";

// Fetch public minimal pour les server components (ex: generateMetadata).
// Ne remplace PAS apiClient (pas d'auth, pas de POST/PUT/DELETE) — sert
// uniquement à éviter de dupliquer le format d'enveloppe {status, data}
// dans chaque page.tsx qui a besoin d'un fetch SSR pour le SEO.
export async function fetchPublic<T>(
  path: string,
  revalidateSeconds = 300, // aligné par défaut sur cache.default_ttl_seconds
): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: revalidateSeconds },
    });
    const text = await res.text();
    const json: ApiResponse<T> = text
      ? JSON.parse(text)
      : { status: true, data: undefined as T };
    if (!json.status) return null;
    return json.data;
  } catch {
    return null;
  }
}
