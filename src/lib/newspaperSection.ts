import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const NEWSPAPER_SECTION_MENU_ID = 304;

export const NEWSPAPER_MAIN_SLUG = "institut-ijtimoy-tibbiy-gazetasi";

export const NEWSPAPER_ARCHIVE_SLUGS = new Set([
  "institut-gazetasi-arxivi-2021",
  "institut-gazetasi-arxivi-2022",
  "institut-gazetasi-arxivi-2023",
  "institut-gazetasi-arxivi-2024",
]);

export const NEWSPAPER_CURRENT_SLUG = "institut-gazetasi-2025";

export function isNewspaperSectionPage(slug?: string): boolean {
  if (!slug) return false;
  return (
    slug === NEWSPAPER_MAIN_SLUG ||
    NEWSPAPER_ARCHIVE_SLUGS.has(slug) ||
    slug === NEWSPAPER_CURRENT_SLUG
  );
}

export function isNewspaperArchivePage(slug?: string): boolean {
  return Boolean(slug && NEWSPAPER_ARCHIVE_SLUGS.has(slug));
}

export function findNewspaperSectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === NEWSPAPER_SECTION_MENU_ID) {
        return { title: section.title, items: section.children ?? [] };
      }
    }
  }
  return null;
}

export function isNewspaperNavItemActive(href: string, pathname: string, slug?: string): boolean {
  const normalized = normalizeMenuHref(href);
  if (pathname === normalized) return true;
  if (slug && normalized.endsWith(`/${slug}`)) return true;
  return false;
}

export function getNewspaperPageIntroKey(slug?: string): string | null {
  switch (slug) {
    case NEWSPAPER_MAIN_SLUG:
      return "newspaper.intro.main";
    case "institut-gazetasi-arxivi-2021":
      return "newspaper.intro.archive2021";
    case "institut-gazetasi-arxivi-2022":
      return "newspaper.intro.archive2022";
    case "institut-gazetasi-arxivi-2023":
      return "newspaper.intro.archive2023";
    case "institut-gazetasi-arxivi-2024":
      return "newspaper.intro.archive2024";
    case NEWSPAPER_CURRENT_SLUG:
      return "newspaper.intro.current2025";
    default:
      return null;
  }
}

export function getNewspaperArchiveYear(slug?: string): string | null {
  if (!slug) return null;
  const archive = slug.match(/^institut-gazetasi-arxivi-(\d{4})$/);
  if (archive) return archive[1];
  if (slug === NEWSPAPER_CURRENT_SLUG) return "2025";
  return null;
}
