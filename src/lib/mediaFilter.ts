/** Detect admin-uploaded graphic posters (event flyers) — not campus photography. */
export function isGraphicBanner(src: string, title = ""): boolean {
  const s = `${src} ${title}`.toLowerCase();
  return (
    /it-med|it med|tashabbus|haftalik|haftaligi|ariza yuborish|startap|master-klass|flyer|flayer|fayer|poster/i.test(
      s
    ) ||
    /\/images\/banner\//i.test(src) ||
    /\/corusel\/fayer/i.test(src) ||
    /fon-1\.jpg/i.test(src) ||
    /banner-\d/i.test(src)
  );
}

/**
 * Home page must never load multi-megabyte collage originals —
 * they freeze the tab when the gallery scrolls into view.
 */
export function isHeavyHomeImage(src: string): boolean {
  const s = src.toLowerCase();
  return (
    /\/fotogallery\/2026\/d-\d/i.test(s) ||
    /fon-1\.jpg/i.test(s) ||
    /flayer_fergana/i.test(s) ||
    /\/yangilikar\/flayer/i.test(s)
  );
}

export function isHomeSafeImage(src: string, title = ""): boolean {
  if (!src) return false;
  if (isGraphicBanner(src, title)) return false;
  if (isHeavyHomeImage(src)) return false;
  return true;
}

/** Lightweight fallbacks only (< ~700KB). */
export const CAMPUS_PHOTOS = [
  { id: -101, img: "/images/institut-about.jpg" },
  { id: -102, img: "https://api.fermi.uz/uploads/img/fotogallery/2026/PYU.jpg" },
  { id: -103, img: "https://api.fermi.uz/uploads/img/fotogallery/2026/uz%20iftixorlari.jpg" },
  { id: -104, img: "https://api.fermi.uz/uploads/img/fotogallery/2026/Glaukoma%20haftaligi.jpg" },
  {
    id: -105,
    img: "https://api.fermi.uz/uploads/img/fotogallery/2026/Rektor%20va%20talabalar%20uchrashuvi.jpg",
  },
] as const;

/** Sharp hero back-banner only (not used for cards/aside). */
export const HERO_BANNER_PHOTOS = [
  "/images/hero/banner-bg-1.jpg",
  "/images/hero/banner-bg-2.jpg",
  "/images/hero/banner-bg-3.jpg",
] as const;

export function pickSafeImage(
  src: string | null | undefined,
  title = "",
  fallback = CAMPUS_PHOTOS[0].img
): string {
  if (!src) return fallback;
  if (!isHomeSafeImage(src, title)) return fallback;
  return src;
}
