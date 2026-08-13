function getApiKey() {
  const b64 = String(import.meta.env.VITE_IMENTOR_API_KEY_B64 || "").trim();
  if (!b64) return "";
  try {
    return atob(b64).trim();
  } catch {
    return "";
  }
}

const BASE_URL = String(import.meta.env.VITE_IMENTOR_API_BASE_URL || "").trim();

export async function imentorGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey || !BASE_URL) {
    throw new Error("iMentor API sozlanmagan");
  }

  const url = new URL(BASE_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, ""), window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": apiKey },
  });

  if (!response.ok) {
    throw new Error(`iMentor API xatosi: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
