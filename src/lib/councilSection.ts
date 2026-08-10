import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const COUNCIL_SECTION_MENU_ID = 265;

/** CMS menyu — Ilmiy seminarlar (href #) → tadbirlar yangiliklari */
export const COUNCIL_SEMINARS_HREF = "/news/72/tadbirlar";

export const COUNCIL_PDF_SLUGS = new Set([
  "ilmiy-kengash-nizomi",
  "ilmiy-kengash-tarkibi",
  "kengash-kun-tartibi",
]);

export function isCouncilPdfPage(slug?: string): boolean {
  return Boolean(slug && COUNCIL_PDF_SLUGS.has(slug));
}

export function isValidCouncilNavHref(href: string): boolean {
  return Boolean(href && href !== "#");
}

export function resolveCouncilNavHref(item: MenuNode): string {
  if (item.id === 579) return COUNCIL_SEMINARS_HREF;
  return normalizeMenuHref(item.href);
}

export function findCouncilSectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === COUNCIL_SECTION_MENU_ID) {
        return {
          title: section.title,
          items: section.children ?? [],
        };
      }
    }
  }
  return null;
}

export function isCouncilNavItemActive(href: string, pathname: string, slug?: string): boolean {
  const normalized = normalizeMenuHref(href);
  if (pathname === normalized) return true;
  if (slug && normalized.endsWith(`/${slug}`)) return true;
  return false;
}

export function isCouncilCompactPdf(slug?: string): boolean {
  return slug === "kengash-kun-tartibi" || slug === "ilmiy-kengash";
}

export function getCouncilsPageIntroKey(slug?: string): string | null {
  switch (slug) {
    case "institut-ilmiy-kengashi":
      return "council.intro.main";
    case "ilmiy-kengash-nizomi":
      return "council.intro.regulation";
    case "ilmiy-kengash-tarkibi":
      return "council.intro.members";
    case "kengash-kun-tartibi":
      return "council.intro.agenda";
    case "ilmiy-kengash":
      return "council.intro.decisions";
    case "avtoreferatlar":
      return "council.intro.autoreferat";
    default:
      return null;
  }
}
