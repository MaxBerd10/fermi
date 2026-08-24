/** Institut manzili: Fargʻona sh., Yangi Turon koʻchasi, 2-a uy */
export const INSTITUTE_ADDRESS = "Fargʻona sh., Yangi Turon koʻchasi, 2-a uy";

/** Google Maps embed — aniq institut joylashuvi */
export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3053.8!2d71.8089087!3d40.3802946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bb8546725ec125%3A0xcae07b9c0d192cc6!2sFarg%27ona%20jamoat%20salomatligi%20tibbiyot%20instituti!5e0!3m2!1suz!2suz!4v1720000000000!5m2!1suz!2suz";

export const FOUNDED_YEAR = "1992";

/** Menyu va sarlavhalardagi matnni normallashtirish */
export function normalizeYearLabels(text: string): string {
  let result = text;
  if (/vakant|vakansiya|yo[ʻ'`]l xaritasi|xaritasi|yo-l-xaritasi/i.test(result)) {
    result = result.replace(/\b2025\b/g, "2026");
  }
  // Dynamic import avoided — inline minimal orthography for menu labels
  result = result.replace(/`/g, "ʻ");
  result = result.replace(/\btogrisia\b/gi, "toʻgʻrisida");
  result = result.replace(/\bOzbeksiton\b/gi, "Oʻzbekiston");
  return result;
}

export function normalizeMenuHref(href: string): string {
  if (!href) return href;
  return href
    .replace(/vakant-lavozimlar-2025/gi, "vakant-lavozimlar-2026")
    .replace(/vakansiyalar-2025/gi, "vakansiyalar-2026")
    .replace(/institut-yol-xaritasi-2025/gi, "institut-yol-xaritasi-2026")
    .replace(/yo-l-xaritasi-2025/gi, "institut-yol-xaritasi-2026")
    .replace(/yol-xaritasi-2025/gi, "institut-yol-xaritasi-2026");
}

/** URL slug → API slug (CMS hali yangilanmagan boʻlsa) */
export function normalizePageSlug(slug: string): string {
  if (!slug) return slug;
  return slug
    .replace(/institut-yol-xaritasi-2026/gi, "institut-yol-xaritasi-2025")
    .replace(/yo-l-xaritasi-2026/gi, "institut-yol-xaritasi-2025")
    .replace(/yol-xaritasi-2026/gi, "institut-yol-xaritasi-2025");
}

export function isSamePageSlug(a: string, b: string): boolean {
  return normalizePageSlug(a) === normalizePageSlug(b);
}

export function buildSubMenuHref(
  menuId: number,
  item: { urlType: string; urlValue: string },
): string {
  if (item.urlType === "departments") {
    return `/departments/${menuId}/${item.urlValue}`;
  }
  return normalizeMenuHref(`/blog/${menuId}/${item.urlValue}`);
}
