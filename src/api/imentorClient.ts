// The production server proxies this route and keeps the iMentor credential private.
// Keeping the path relative also works behind a reverse proxy and on any domain.
const BASE_URL = "/imentor-api";

export async function imentorGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(BASE_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, ""), window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`iMentor API xatosi: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
