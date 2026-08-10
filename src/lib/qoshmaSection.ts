import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const QOSHMA_MENU_ID = 233;

export type QoshmaContentVariant =
  | "article"
  | "pdf-only"
  | "pdf-intro"
  | "documents"
  | "quota-gallery"
  | "external-cta"
  | "contact"
  | "placeholder"
  | "docs-checklist"
  | "docs-table"
  | "qoshma-program"
  | "qoshma-docs";

export type QoshmaHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: QoshmaContentVariant;
  heroAccent: string;
  heroIcon: string;
  externalUrl?: string;
  externalLabelKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "kontrakt-miqdori-2025": {
    introKey: "admission.qoshma.intro.kontrakt",
    variant: "qoshma-program",
    heroAccent: "qoshma-contract",
    heroIcon: "ri-money-dollar-circle-line",
  },
  "qabul-komissiyasi-qoshma-talim-2025": {
    introKey: "admission.qoshma.intro.komissiya",
    variant: "contact",
    heroAccent: "qoshma-contact",
    heroIcon: "ri-map-pin-line",
  },
  "xalqaro-qoshma-talim-2025": {
    introKey: "admission.qoshma.intro.kvota",
    variant: "qoshma-program",
    heroAccent: "qoshma-quota",
    heroIcon: "ri-pie-chart-line",
  },
  "xalqaro-qabul-hujjatlar-toplami": {
    introKey: "admission.qoshma.intro.hujjatlar",
    variant: "qoshma-docs",
    heroAccent: "qoshma-docs",
    heroIcon: "ri-folder-3-line",
  },
};

export function isQoshmaSectionPage(menuId?: number): boolean {
  return menuId === QOSHMA_MENU_ID;
}

export function getQoshmaContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): QoshmaContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "pdf-only";
  if (!text || text.length < 25) return "placeholder";
  if (html?.includes("<table")) return "docs-table";
  return "article";
}

export function getQoshmaHeroConfig(slug?: string): QoshmaHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.qoshma",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getQoshmaExternalCta(slug?: string): { url: string; labelKey: string } | null {
  if (!slug || !PAGE_CONFIG[slug]?.externalUrl) return null;
  const page = PAGE_CONFIG[slug];
  return {
    url: page.externalUrl!,
    labelKey: page.externalLabelKey ?? "admission.cta.openPortal",
  };
}
