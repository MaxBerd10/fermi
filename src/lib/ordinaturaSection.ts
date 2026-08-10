import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const ORDINATURA_MENU_ID = 215;

export type OrdinaturaContentVariant =
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
  | "ordinatura-reminder"
  | "locations";

export type OrdinaturaHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: OrdinaturaContentVariant;
  heroAccent: string;
  heroIcon: string;
  externalUrl?: string;
  externalLabelKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "hujjat-turlari": {
    introKey: "admission.ordinatura.intro.hujjatTurlari",
    variant: "docs-table",
    heroAccent: "ordinatura-docs",
    heroIcon: "ri-folder-3-line",
  },
  "abiturientlar-uchun-eslatma-2025": {
    introKey: "admission.ordinatura.intro.eslatma",
    variant: "ordinatura-reminder",
    heroAccent: "ordinatura-reminder",
    heroIcon: "ri-information-line",
  },
  "klinik-ordinatura-qabul-nizomi": {
    introKey: "admission.ordinatura.intro.qabulNizomi",
    variant: "pdf-intro",
    heroAccent: "ordinatura-rules",
    heroIcon: "ri-scales-3-line",
  },
  "ordinatura-mandat-natijalari-2025": {
    introKey: "admission.ordinatura.intro.mandat",
    variant: "quota-gallery",
    heroAccent: "ordinatura-mandat",
    heroIcon: "ri-bar-chart-box-line",
  },
  "ordinatura-qabul-komissiyasi-yangiliklari-2025": {
    introKey: "admission.ordinatura.intro.yangiliklari",
    variant: "locations",
    heroAccent: "ordinatura-news",
    heroIcon: "ri-newspaper-line",
  },
  "ordinaturaga-hujjat-topshirish-2025": {
    introKey: "admission.ordinatura.intro.hujjatTopshirish",
    variant: "docs-table",
    heroAccent: "ordinatura-submit",
    heroIcon: "ri-upload-cloud-2-line",
  },
  "ordinatura-test-sinovi-manzillari-2025": {
    introKey: "admission.ordinatura.intro.testManzillari",
    variant: "locations",
    heroAccent: "ordinatura-locations",
    heroIcon: "ri-map-pin-2-line",
  },
  "ordinatura-imtihonga-kirish-ruxsatnomasi-2025": {
    introKey: "admission.ordinatura.intro.ruxsatnoma",
    variant: "external-cta",
    heroAccent: "ordinatura-permit",
    heroIcon: "ri-ticket-2-line",
    externalUrl: "https://tmbm.ssv.uz/site/permission",
    externalLabelKey: "admission.ordinatura.cta.ruxsatnoma",
  },
};

export function isOrdinaturaSectionPage(menuId?: number): boolean {
  return menuId === ORDINATURA_MENU_ID;
}

export function getOrdinaturaContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): OrdinaturaContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "pdf-only";
  if (!text || text.length < 25) return "placeholder";
  if (html?.includes("<table")) return "docs-table";
  if ((html?.match(/maps\.|yandex\.uz\/maps/i)?.length ?? 0) >= 2) return "locations";
  return "article";
}

export function getOrdinaturaHeroConfig(slug?: string): OrdinaturaHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.ordinatura",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getOrdinaturaExternalCta(slug?: string): { url: string; labelKey: string } | null {
  if (!slug || !PAGE_CONFIG[slug]?.externalUrl) return null;
  const page = PAGE_CONFIG[slug];
  return {
    url: page.externalUrl!,
    labelKey: page.externalLabelKey ?? "admission.cta.openPortal",
  };
}

export function inferOrdinaturaPdfTitleKey(pdfUrl?: string | null): string | undefined {
  if (!pdfUrl) return undefined;
  const url = decodeURIComponent(pdfUrl).toLowerCase();
  if (/mandat/i.test(url)) return "admission.ordinatura.pdf.mandat";
  if (/fanlar-majmuasi|fanlar/i.test(url)) return "admission.ordinatura.pdf.fanlarMajmuasi";
  return undefined;
}
