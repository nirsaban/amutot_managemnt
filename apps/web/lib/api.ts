export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const headers = new Headers(init.headers);
  if (init.json !== undefined) {
    headers.set("content-type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body
  });

  const text = await res.text();
  const body = text ? (JSON.parse(text) as any) : null;

  if (!res.ok) {
    const msg =
      body?.error?.message ??
      body?.message ??
      "שגיאה. נסו שוב.";
    return { ok: false, message: String(msg) };
  }

  return { ok: true, data: (body?.data ?? body) as T };
}

