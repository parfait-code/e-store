// lib/api-server.ts
import type { ApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
export async function fetchPublic<T>(
  path: string,
  revalidateSeconds = 300,
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
