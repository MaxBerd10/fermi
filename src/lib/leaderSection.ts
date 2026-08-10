import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const LEADER_SECTION_MENU_ID = 35;

export const LEADER_FEATURED_SLUGS = new Set(["rektor"]);

export function isLeaderFeaturedPage(slug?: string, count?: number): boolean {
  return Boolean(slug && LEADER_FEATURED_SLUGS.has(slug) && count === 1);
}

export function findLeaderSectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    if (top.id === LEADER_SECTION_MENU_ID) {
      return { title: top.title, items: top.children ?? [] };
    }
    for (const section of top.children ?? []) {
      if (section.id === LEADER_SECTION_MENU_ID) {
        return { title: section.title, items: section.children ?? [] };
      }
    }
  }
  return null;
}

export function isLeaderNavItemActive(item: MenuNode, pathname: string, slug?: string): boolean {
  const href = normalizeMenuHref(item.href);
  if (pathname === href) return true;
  return Boolean(slug && href.endsWith(`/${slug}`));
}

export function getLeaderPageIntroKey(slug?: string): string | null {
  switch (slug) {
    case "rektor":
      return "leader.intro.rector";
    case "prorektorlar":
      return "leader.intro.prorektorlar";
    case "kafedra-mudirlari":
      return "leader.intro.departmentHeads";
    default:
      return "leader.intro.default";
  }
}

export function isVacantLeader(name: string): boolean {
  return /^vakant$/i.test(name.trim());
}
