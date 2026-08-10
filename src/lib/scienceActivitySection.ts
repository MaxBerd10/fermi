import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const SCIENCE_ACTIVITY_MENU_ID = 48;
export const DISSERTATION_MENU_ITEM_ID = 598;

export type ScienceActivityContentVariant =
  | "council-decisions"
  | "documents"
  | "conference"
  | "journal"
  | "autoreferat"
  | "article"
  | "research-table"
  | "dissertation";

const PAGE_CONFIG: Record<string, { introKey: string; variant: ScienceActivityContentVariant }> = {
  "ilmiy-kengash": { introKey: "science.intro.council", variant: "council-decisions" },
  "ilmiy-faoliyat-boyicha-normativ-huquqiy-hujjatlar": {
    introKey: "science.intro.regulatory",
    variant: "documents",
  },
  "klinik-va-profilaktik-tibbiyot-jurnali": { introKey: "science.intro.journal", variant: "journal" },
  "fjsti-grant-siyosati": { introKey: "science.intro.grants", variant: "article" },
  "tibbiy-talimga-tadqiq-etilgan-ilmiy-tadqiqot-ishlari": {
    introKey: "science.intro.medicalResearch",
    variant: "research-table",
  },
  "innovatsion-goyalar": { introKey: "science.intro.innovation", variant: "article" },
  "ilmiy-tadqiqot-yonalishlari": { introKey: "science.intro.directions", variant: "documents" },
  "oliy-oquv-yurtidan-keyingi-talim": { introKey: "science.intro.postgraduate", variant: "article" },
  "ilmiy-konferensiyalar": { introKey: "science.intro.conferences", variant: "conference" },
  avtoreferatlar: { introKey: "science.intro.autoreferat", variant: "autoreferat" },
  "dissertatsiya-himoyalari": { introKey: "science.intro.dissertation", variant: "dissertation" },
};

export function isScienceActivitySectionPage(menuId?: number): boolean {
  return menuId === SCIENCE_ACTIVITY_MENU_ID;
}

export function isScienceActivitySlug(slug?: string): boolean {
  return Boolean(slug && slug in PAGE_CONFIG);
}

export function getScienceActivityContentVariant(slug?: string): ScienceActivityContentVariant | null {
  if (!slug) return null;
  return PAGE_CONFIG[slug]?.variant ?? null;
}

export function getScienceActivityIntroKey(slug?: string): string | null {
  if (!slug) return null;
  return PAGE_CONFIG[slug]?.introKey ?? null;
}

export function findScienceActivitySectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === SCIENCE_ACTIVITY_MENU_ID) {
        return { title: section.title, items: section.children ?? [] };
      }
    }
  }
  return null;
}

export function resolveScienceActivityNavHref(item: MenuNode): string {
  if (item.id === DISSERTATION_MENU_ITEM_ID) {
    return normalizeMenuHref(`/blog/${SCIENCE_ACTIVITY_MENU_ID}/dissertatsiya-himoyalari`);
  }

  const raw = item.urlValue ?? item.href ?? "";
  if (raw === "/blog/48/" || raw === "/blog/48" || raw.endsWith("/blog/48/")) {
    return normalizeMenuHref(`/blog/${SCIENCE_ACTIVITY_MENU_ID}/dissertatsiya-himoyalari`);
  }

  return normalizeMenuHref(item.href);
}

export function isScienceActivityNavItemActive(href: string, pathname: string, slug?: string): boolean {
  const normalized = normalizeMenuHref(href);
  if (pathname === normalized) return true;
  if (slug && normalized.endsWith(`/${slug}`)) return true;
  return false;
}
