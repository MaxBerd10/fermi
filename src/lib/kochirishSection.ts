import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const KOCHIRISH_MENU_ID = 241;

export type KochirishContentVariant =
  | "article"
  | "pdf-only"
  | "pdf-intro"
  | "quota-gallery"
  | "external-cta"
  | "placeholder"
  | "transfer-restore"
  | "faq";

export type KochirishHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: KochirishContentVariant;
  heroAccent: string;
  heroIcon: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "oqishni-kochirish-qayta-tiklash": {
    introKey: "admission.kochirish.intro.qaytaTiklash",
    variant: "transfer-restore",
    heroAccent: "kochirish-restore",
    heroIcon: "ri-refresh-line",
  },
  "oqishni-kochirish-natijalari-2024": {
    introKey: "admission.kochirish.intro.natijalar",
    variant: "quota-gallery",
    heroAccent: "kochirish-results",
    heroIcon: "ri-bar-chart-box-line",
  },
  "turdosh-mutaxassisliklar-royxati": {
    introKey: "admission.kochirish.intro.turdosh",
    variant: "pdf-intro",
    heroAccent: "kochirish-specialties",
    heroIcon: "ri-route-line",
  },
  "kop-berilayotgan-savollar": {
    introKey: "admission.kochirish.intro.faq",
    variant: "faq",
    heroAccent: "kochirish-faq",
    heroIcon: "ri-question-answer-line",
  },
};

export function isKochirishSectionPage(menuId?: number): boolean {
  return menuId === KOCHIRISH_MENU_ID;
}

export function getKochirishContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): KochirishContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "pdf-only";
  if (!text || text.length < 25) return "placeholder";
  if (/savol|FAQ|\?/.test(text) && text.split("?").length > 3) return "faq";
  return "article";
}

export function getKochirishHeroConfig(slug?: string): KochirishHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.kochirish",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function inferKochirishPdfTitleKey(pdfUrl?: string | null): string | undefined {
  if (!pdfUrl) return undefined;
  const url = decodeURIComponent(pdfUrl).toLowerCase();
  if (/mandat|perevod/i.test(url)) return "admission.kochirish.pdf.mandat";
  if (/turdosh|yo'nalish/i.test(url)) return "admission.kochirish.pdf.turdosh";
  if (/393|son/i.test(url)) return "admission.kochirish.pdf.regulation";
  return undefined;
}

export function getKochirishPdfTitleKey(pdfUrl?: string | null, fallbackKey?: string): string {
  return inferKochirishPdfTitleKey(pdfUrl) ?? fallbackKey ?? "admission.downloadPdf";
}
