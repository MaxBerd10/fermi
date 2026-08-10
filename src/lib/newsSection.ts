import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const NEWS_SECTION_MENU_ID = 72;
export const NEWS_DEFAULT_MENU_ID = 72;

export function normalizeNewsHref(href: string): string {
  return normalizeMenuHref(href);
}

export function isValidNewsNavHref(href: string): boolean {
  if (!href || href === "#") return false;
  if (href === "/blog/72/" || href.endsWith("/blog/72")) return false;
  return true;
}

export function findNewsSectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === NEWS_SECTION_MENU_ID) {
        return {
          title: section.title,
          items: (section.children ?? []).filter((item) => isValidNewsNavHref(item.href)),
        };
      }
    }
  }
  return null;
}

export function buildNewsDetailHref(slug: string, menuId = NEWS_DEFAULT_MENU_ID): string {
  return `/detail/${slug}?menuId=${menuId}`;
}

export function isNewsNavItemActive(href: string, pathname: string, slug?: string): boolean {
  const normalized = normalizeNewsHref(href);
  if (pathname === normalized) return true;

  if (slug && normalized.endsWith(`/${slug}`)) return true;

  return false;
}

export function newsCategoryTagStyle(categoryTitle: string | undefined): {
  bg: string;
  text: string;
  label: string;
} {
  const t = (categoryTitle ?? "").toLowerCase();
  if (/tadbir|sport|konferens|xalqaro|madaniy|yoshlar|talaba/.test(t)) {
    return { bg: "news-tag--event", text: "", label: categoryTitle ?? "Tadbir" };
  }
  if (/e['`’]?lon|qabul|komissiya/.test(t)) {
    return { bg: "news-tag--announce", text: "", label: categoryTitle ?? "E'lon" };
  }
  return { bg: "news-tag--news", text: "", label: categoryTitle ?? "Yangilik" };
}
