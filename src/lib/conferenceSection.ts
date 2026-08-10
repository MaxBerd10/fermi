import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const CONFERENCE_SECTION_MENU_ID = 397;

export const CONFERENCE_PAGE_SLUGS = new Set([
  "ilmiy-konferensiyalar",
  "respublika-ilmiy-konferensiyalari",
  "fan-olimpiadalari",
]);

export function isConferenceSectionPage(slug?: string): boolean {
  return Boolean(slug && CONFERENCE_PAGE_SLUGS.has(slug));
}

export function findConferenceSectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === CONFERENCE_SECTION_MENU_ID) {
        return { title: section.title, items: section.children ?? [] };
      }
    }
  }
  return null;
}

export function isConferenceNavItemActive(href: string, pathname: string, slug?: string): boolean {
  const normalized = normalizeMenuHref(href);
  if (pathname === normalized) return true;
  if (slug && normalized.endsWith(`/${slug}`)) return true;
  return false;
}

export function getConferencePageTitleKey(slug?: string): string | null {
  switch (slug) {
    case "ilmiy-konferensiyalar":
      return "conference.title.international";
    case "respublika-ilmiy-konferensiyalari":
      return "conference.title.republic";
    case "fan-olimpiadalari":
      return "conference.title.olympiads";
    default:
      return null;
  }
}

export function getConferencePageIntroKey(slug?: string): string | null {
  switch (slug) {
    case "ilmiy-konferensiyalar":
      return "conference.intro.international";
    case "respublika-ilmiy-konferensiyalari":
      return "conference.intro.republic";
    case "fan-olimpiadalari":
      return "conference.intro.olympiads";
    default:
      return null;
  }
}
