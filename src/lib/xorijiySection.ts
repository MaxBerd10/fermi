import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const XORIJIY_MENU_ID = 6;

export const STUDY_IN_UZBEKISTAN_PORTAL = "https://studyin-uzbekistan.uz/universities/80";

export type XorijiyContentVariant = "article" | "placeholder" | "xorijiy-portal" | "xorijiy-article";

export type XorijiyHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type XorijiyRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: XorijiyContentVariant;
  heroAccent: string;
  heroIcon: string;
  ctaUrl?: string;
  ctaLabelKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "study-in-uzbekistan": {
    introKey: "xorijiy.intro.studyPortal",
    variant: "xorijiy-portal",
    heroAccent: "xorijiy-study",
    heroIcon: "ri-global-line",
    ctaUrl: STUDY_IN_UZBEKISTAN_PORTAL,
    ctaLabelKey: "xorijiy.cta.studyPortal",
  },
  "xorijiy-abiturient": {
    introKey: "xorijiy.intro.abiturient",
    variant: "xorijiy-article",
    heroAccent: "xorijiy-abiturient",
    heroIcon: "ri-graduation-cap-line",
  },
  "horijiy-talabalar-ishtirokidagi-tadbirlar": {
    introKey: "xorijiy.intro.tadbirlar",
    variant: "xorijiy-article",
    heroAccent: "xorijiy-events",
    heroIcon: "ri-calendar-event-line",
  },
};

export const XORIJIY_RELATED_LINKS: XorijiyRelatedLink[] = [
  { slug: "study-in-uzbekistan", labelKey: "xorijiy.link.studyPortal", icon: "ri-global-line" },
  { slug: "xorijiy-abiturient", labelKey: "xorijiy.link.abiturient", icon: "ri-graduation-cap-line" },
  {
    slug: "horijiy-talabalar-ishtirokidagi-tadbirlar",
    labelKey: "xorijiy.link.tadbirlar",
    icon: "ri-calendar-event-line",
  },
];

export function isXorijiySectionPage(menuId?: number): boolean {
  return menuId === XORIJIY_MENU_ID;
}

export function getXorijiyContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): XorijiyContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "xorijiy-article";
  if (!text || text.length < 25) return "placeholder";
  return "article";
}

export function getXorijiyHeroConfig(slug?: string): XorijiyHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.xorijiy",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getXorijiyExternalCta(slug?: string): { url: string; labelKey: string } | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const { ctaUrl, ctaLabelKey } = PAGE_CONFIG[slug];
  if (!ctaUrl || !ctaLabelKey) return null;
  return { url: ctaUrl, labelKey: ctaLabelKey };
}

export function getXorijiyPageTheme(): string {
  return "xorijiy";
}

export function isXorijiyConfiguredPage(slug?: string): boolean {
  return getXorijiyHeroConfig(slug) !== null;
}
