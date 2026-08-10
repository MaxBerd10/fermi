import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const BUILDINGS_SECTION_MENU_ID = 479;

export const BUILDINGS_PAGE_SLUGS = new Set([
  "rektorat",
  "oquv-binolari",
  "2-oquv-kampusi",
  "vivariy",
  "simulatsiya-markazi",
  "kongress-majmuasi",
  "sport-majmualari",
  "talabalar-turar-joylari-4",
]);

/** CMS menyu xatosi: Laboratoriya xonalari ham shu slugga bog'langan */
export const BUILDINGS_LAB_MENU_ID = 486;
export const BUILDINGS_SIMULATION_MENU_ID = 484;

export type BuildingsSubView = "laboratory" | null;

export function getBuildingsSubView(searchParams: URLSearchParams): BuildingsSubView {
  return searchParams.get("view") === "laboratory" ? "laboratory" : null;
}

export function getBuildingsNavHref(item: MenuNode): string {
  if (item.id === BUILDINGS_LAB_MENU_ID) {
    return "/blog/479/simulatsiya-markazi?view=laboratory";
  }
  if (item.id === BUILDINGS_SIMULATION_MENU_ID) {
    return "/blog/479/simulatsiya-markazi";
  }
  return normalizeMenuHref(item.href);
}

export function isBuildingsSectionPage(slug?: string): boolean {
  return Boolean(slug && BUILDINGS_PAGE_SLUGS.has(slug));
}

export function findBuildingsSectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === BUILDINGS_SECTION_MENU_ID) {
        return { title: section.title, items: section.children ?? [] };
      }
    }
  }
  return null;
}

export function isBuildingsNavItemActive(
  item: MenuNode,
  pathname: string,
  slug?: string,
  subView?: BuildingsSubView,
): boolean {
  const href = getBuildingsNavHref(item);
  if (item.id === BUILDINGS_LAB_MENU_ID) {
    return slug === "simulatsiya-markazi" && subView === "laboratory";
  }
  if (item.id === BUILDINGS_SIMULATION_MENU_ID) {
    return slug === "simulatsiya-markazi" && subView !== "laboratory";
  }
  if (pathname === href) return true;
  if (slug && href.endsWith(`/${slug}`)) return true;
  return false;
}

export function getBuildingsPageTitleKey(slug?: string, subView?: BuildingsSubView): string | null {
  if (slug === "simulatsiya-markazi" && subView === "laboratory") {
    return "buildings.title.laboratory";
  }
  switch (slug) {
    case "rektorat":
      return "buildings.title.rectorate";
    case "oquv-binolari":
      return "buildings.title.education";
    case "2-oquv-kampusi":
      return "buildings.title.campus2";
    case "vivariy":
      return "buildings.title.vivarium";
    case "simulatsiya-markazi":
      return "buildings.title.simulation";
    case "kongress-majmuasi":
      return "buildings.title.congress";
    case "sport-majmualari":
      return "buildings.title.sport";
    case "talabalar-turar-joylari-4":
      return "buildings.title.dormitory";
    default:
      return null;
  }
}

export function getBuildingsPageIntroKey(slug?: string, subView?: BuildingsSubView): string | null {
  if (slug === "simulatsiya-markazi" && subView === "laboratory") {
    return "buildings.intro.laboratory";
  }
  switch (slug) {
    case "rektorat":
      return "buildings.intro.rectorate";
    case "oquv-binolari":
      return "buildings.intro.education";
    case "2-oquv-kampusi":
      return "buildings.intro.campus2";
    case "vivariy":
      return "buildings.intro.vivarium";
    case "simulatsiya-markazi":
      return "buildings.intro.simulation";
    case "kongress-majmuasi":
      return "buildings.intro.congress";
    case "sport-majmualari":
      return "buildings.intro.sport";
    case "talabalar-turar-joylari-4":
      return "buildings.intro.dormitory";
    default:
      return null;
  }
}

export function getBuildingsHighlightKeys(slug?: string, subView?: BuildingsSubView): string[] {
  if (slug === "simulatsiya-markazi" && subView === "laboratory") {
    return [
      "buildings.highlight.laboratory.1",
      "buildings.highlight.laboratory.2",
      "buildings.highlight.laboratory.3",
      "buildings.highlight.laboratory.4",
    ];
  }
  const map: Record<string, string[]> = {
    rektorat: [
      "buildings.highlight.rectorate.1",
      "buildings.highlight.rectorate.2",
      "buildings.highlight.rectorate.3",
      "buildings.highlight.rectorate.4",
    ],
    "oquv-binolari": [
      "buildings.highlight.education.1",
      "buildings.highlight.education.2",
      "buildings.highlight.education.3",
      "buildings.highlight.education.4",
    ],
    "2-oquv-kampusi": [
      "buildings.highlight.campus2.1",
      "buildings.highlight.campus2.2",
      "buildings.highlight.campus2.3",
      "buildings.highlight.campus2.4",
    ],
    vivariy: [
      "buildings.highlight.vivarium.1",
      "buildings.highlight.vivarium.2",
      "buildings.highlight.vivarium.3",
      "buildings.highlight.vivarium.4",
    ],
    "simulatsiya-markazi": [
      "buildings.highlight.simulation.1",
      "buildings.highlight.simulation.2",
      "buildings.highlight.simulation.3",
      "buildings.highlight.simulation.4",
    ],
    "kongress-majmuasi": [
      "buildings.highlight.congress.1",
      "buildings.highlight.congress.2",
      "buildings.highlight.congress.3",
      "buildings.highlight.congress.4",
    ],
    "sport-majmualari": [
      "buildings.highlight.sport.1",
      "buildings.highlight.sport.2",
      "buildings.highlight.sport.3",
      "buildings.highlight.sport.4",
    ],
    "talabalar-turar-joylari-4": [
      "buildings.highlight.dormitory.1",
      "buildings.highlight.dormitory.2",
      "buildings.highlight.dormitory.3",
      "buildings.highlight.dormitory.4",
    ],
  };
  return slug ? (map[slug] ?? []) : [];
}

export interface BuildingsRelatedLink {
  href: string;
  labelKey: string;
  icon: string;
}

export function getBuildingsRelatedLinks(slug?: string, subView?: BuildingsSubView): BuildingsRelatedLink[] {
  if (slug === "simulatsiya-markazi" && subView === "laboratory") {
    return [
      { href: "/blog/479/simulatsiya-markazi", labelKey: "buildings.related.simulationCenter", icon: "ri-computer-line" },
      { href: "/blog/479/vivariy", labelKey: "buildings.related.vivarium", icon: "ri-microscope-line" },
    ];
  }
  const map: Record<string, BuildingsRelatedLink[]> = {
    rektorat: [
      { href: "/leader/35/rektor", labelKey: "buildings.related.leadership", icon: "ri-team-line" },
      { href: "/virtual-qabulxona", labelKey: "buildings.related.virtualReception", icon: "ri-customer-service-2-line" },
    ],
    "oquv-binolari": [
      { href: "/blog/479/2-oquv-kampusi", labelKey: "buildings.related.campus2", icon: "ri-building-2-line" },
      { href: "/qabul", labelKey: "buildings.related.admission", icon: "ri-graduation-cap-line" },
    ],
    "2-oquv-kampusi": [
      { href: "/blog/479/oquv-binolari", labelKey: "buildings.related.education", icon: "ri-school-line" },
      { href: "/blog/479/kongress-majmuasi", labelKey: "buildings.related.congress", icon: "ri-presentation-line" },
    ],
    vivariy: [
      { href: "/blog/479/simulatsiya-markazi?view=laboratory", labelKey: "buildings.related.laboratory", icon: "ri-flask-line" },
      { href: "/departments", labelKey: "buildings.related.departments", icon: "ri-book-open-line" },
    ],
    "simulatsiya-markazi": [
      { href: "/blog/479/simulatsiya-markazi?view=laboratory", labelKey: "buildings.related.laboratory", icon: "ri-flask-line" },
      { href: "/blog/479/vivariy", labelKey: "buildings.related.vivarium", icon: "ri-microscope-line" },
    ],
    "kongress-majmuasi": [
      { href: "/blog/397/ilmiy-konferensiyalar", labelKey: "buildings.related.conferences", icon: "ri-slideshow-line" },
      { href: "/blog/479/2-oquv-kampusi", labelKey: "buildings.related.campus2", icon: "ri-building-2-line" },
    ],
    "sport-majmualari": [
      { href: "/blog/479/talabalar-turar-joylari-4", labelKey: "buildings.related.dormitory", icon: "ri-home-heart-line" },
      { href: "/yangiliklar", labelKey: "buildings.related.news", icon: "ri-newspaper-line" },
    ],
    "talabalar-turar-joylari-4": [
      { href: "/qabul", labelKey: "buildings.related.admission", icon: "ri-graduation-cap-line" },
      { href: "/aloqa", labelKey: "buildings.related.contact", icon: "ri-map-pin-line" },
    ],
  };
  return slug ? (map[slug] ?? []) : [];
}
