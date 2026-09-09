// Routes a CMS-hosted photo through this frontend's own resize/compress cache (see
// server/image-proxy.mjs) instead of loading the raw upload directly — admin-panel
// uploads are stored exactly as received (often 8-10MB straight off a phone/camera),
// so a page showing them at a few hundred on-screen pixels was downloading megabytes
// for nothing. Falls back to the original URL untouched for anything not on an
// allowlisted CMS origin (matches the server's own allowlist), so this is always safe
// to call even on an unrelated or already-optimized URL.

const ALLOWED_ORIGINS = ["https://api.fermi.uz", "https://fjsti.uz", "https://www.fjsti.uz"];
// Mirrors ALLOWED_WIDTHS in server/image-proxy.mjs — must match exactly, since the
// server rejects any width outside this fixed set.
const ALLOWED_WIDTHS = [200, 320, 480, 640, 900, 1200, 1600] as const;

function nearestAllowedWidth(target: number): number {
  return ALLOWED_WIDTHS.reduce((best, w) => (Math.abs(w - target) < Math.abs(best - target) ? w : best));
}

export function optimizedImageUrl(url: string | undefined | null, targetWidth: number): string {
  const trimmed = url?.trim();
  if (!trimmed) return "";
  let origin: string;
  try {
    origin = new URL(trimmed).origin;
  } catch {
    return trimmed;
  }
  if (!ALLOWED_ORIGINS.includes(origin)) return trimmed;
  const width = nearestAllowedWidth(targetWidth);
  return `/img-cache?src=${encodeURIComponent(trimmed)}&w=${width}`;
}
