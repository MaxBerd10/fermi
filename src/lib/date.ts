/**
 * CMS dates were previously formatted with hardcoded Uzbek month names (or
 * a literal "uz-UZ" locale), so switching the site to RU/EN left every date
 * on the page still reading in Uzbek. Intl.DateTimeFormat with the active
 * i18n language mostly fixes that, EXCEPT Chromium's bundled ICU data has
 * no real Uzbek month names — Intl.DateTimeFormat('uz', {month: 'short'})
 * silently falls back to a garbage "M07"-style token instead of throwing,
 * so this only surfaces visually, not as an error. Since Uzbek is this
 * site's primary language, that's not an acceptable fallback: keep an
 * explicit Uzbek month table (reliable everywhere) and only hand off to
 * Intl for languages the browser actually has real data for.
 */
const UZ_MONTHS_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const UZ_MONTHS_LONG = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

export function formatShortDate(iso: string, locale?: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const lang = String(locale || "uz").slice(0, 2);
  if (lang === "uz") return `${date.getDate()} ${UZ_MONTHS_SHORT[date.getMonth()] || ""}`;
  try {
    return new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" }).format(date);
  } catch {
    return `${date.getDate()}.${date.getMonth() + 1}`;
  }
}

export function formatLongDate(iso: string, locale?: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const lang = String(locale || "uz").slice(0, 2);
  if (lang === "uz") return `${date.getDate()} ${UZ_MONTHS_LONG[date.getMonth()] || ""}, ${date.getFullYear()}`;
  try {
    return new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(date);
  } catch {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }
}
