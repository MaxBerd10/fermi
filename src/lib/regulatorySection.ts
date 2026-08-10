import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const REGULATORY_SECTION_MENU_ID = 306;

export const REGULATORY_PAGE_SLUGS = new Set([
  "talim-togrisia",
  "kredit-modul-nizomi",
  "prezident-farmon-va-qarorlari",
  "taraqqiyot-strategiyasi",
  "davlat-dasturlari",
  "oliy-talimning-davlat-talim-standarti",
  "oliy-talim-yonalishlari-va-mutaxassisliklari-klassifikatori",
  "ozbeksiton-respublikasi-ssv-buyruqlari",
]);

export function isRegulatorySectionPage(slug?: string): boolean {
  return Boolean(slug && REGULATORY_PAGE_SLUGS.has(slug));
}

export function findRegulatorySectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === REGULATORY_SECTION_MENU_ID) {
        return { title: section.title, items: section.children ?? [] };
      }
    }
  }
  return null;
}

export function isRegulatoryNavItemActive(href: string, pathname: string, slug?: string): boolean {
  const normalized = normalizeMenuHref(href);
  if (pathname === normalized) return true;
  if (slug && normalized.endsWith(`/${slug}`)) return true;
  return false;
}

export function getRegulatoryPageTitleKey(slug?: string): string | null {
  switch (slug) {
    case "talim-togrisia":
      return "regulatory.title.education";
    case "kredit-modul-nizomi":
      return "regulatory.title.creditModule";
    case "prezident-farmon-va-qarorlari":
      return "regulatory.title.presidential";
    case "taraqqiyot-strategiyasi":
      return "regulatory.title.strategy";
    case "davlat-dasturlari":
      return "regulatory.title.programs";
    case "oliy-talimning-davlat-talim-standarti":
      return "regulatory.title.standard";
    case "oliy-talim-yonalishlari-va-mutaxassisliklari-klassifikatori":
      return "regulatory.title.classifier";
    case "ozbeksiton-respublikasi-ssv-buyruqlari":
      return "regulatory.title.healthOrders";
    default:
      return null;
  }
}

export function getRegulatoryPageIntroKey(slug?: string): string | null {
  switch (slug) {
    case "talim-togrisia":
      return "regulatory.intro.education";
    case "kredit-modul-nizomi":
      return "regulatory.intro.creditModule";
    case "prezident-farmon-va-qarorlari":
      return "regulatory.intro.presidential";
    case "taraqqiyot-strategiyasi":
      return "regulatory.intro.strategy";
    case "davlat-dasturlari":
      return "regulatory.intro.programs";
    case "oliy-talimning-davlat-talim-standarti":
      return "regulatory.intro.standard";
    case "oliy-talim-yonalishlari-va-mutaxassisliklari-klassifikatori":
      return "regulatory.intro.classifier";
    case "ozbeksiton-respublikasi-ssv-buyruqlari":
      return "regulatory.intro.healthOrders";
    default:
      return null;
  }
}
