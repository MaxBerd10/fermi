import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import { INSTITUTE_ADDRESS, MAP_EMBED_URL } from "@/lib/siteConstants";

export const INTERNATURA_MENU_ID = 375;

export type InternaturaContentVariant =
  | "article"
  | "pdf-only"
  | "placeholder"
  | "internatura-commission"
  | "internatura-submit"
  | "internatura-pdf";

export type InternaturaHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type InternaturaRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: InternaturaContentVariant;
  heroAccent: string;
  heroIcon: string;
  pdfTitleKey?: string;
  leadKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "internatura-qabul-komissiyasi-2025": {
    introKey: "admission.internatura.intro.komissiya",
    variant: "internatura-commission",
    heroAccent: "internatura-contact",
    heroIcon: "ri-map-pin-line",
  },
  "internaturaga-hujjat-topshirish-2025": {
    introKey: "admission.internatura.intro.hujjatTopshirish",
    variant: "internatura-submit",
    heroAccent: "internatura-submit",
    heroIcon: "ri-upload-cloud-2-line",
  },
  "internatura-qabul-taqsimoti-2024": {
    introKey: "admission.internatura.intro.taqsimot",
    variant: "internatura-pdf",
    heroAccent: "internatura-distribution",
    heroIcon: "ri-pie-chart-line",
    pdfTitleKey: "admission.internatura.pdf.distribution",
    leadKey: "admission.internatura.distribution.lead",
  },
  "internatura-mandat-2025": {
    introKey: "admission.internatura.intro.mandat",
    variant: "internatura-pdf",
    heroAccent: "internatura-mandat",
    heroIcon: "ri-award-line",
    pdfTitleKey: "admission.internatura.pdf.mandat",
    leadKey: "admission.internatura.mandat.lead",
  },
};

export const INTERNATURA_RELATED_LINKS: InternaturaRelatedLink[] = [
  { slug: "internatura-qabul-komissiyasi-2025", labelKey: "admission.internatura.link.komissiya", icon: "ri-map-pin-line" },
  { slug: "internaturaga-hujjat-topshirish-2025", labelKey: "admission.internatura.link.hujjatTopshirish", icon: "ri-upload-cloud-2-line" },
  { slug: "internatura-qabul-taqsimoti-2024", labelKey: "admission.internatura.link.taqsimot", icon: "ri-pie-chart-line" },
  { slug: "internatura-mandat-2025", labelKey: "admission.internatura.link.mandat", icon: "ri-award-line" },
];

export function isInternaturaSectionPage(menuId?: number): boolean {
  return menuId === INTERNATURA_MENU_ID;
}

export function getInternaturaContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): InternaturaContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && !pdfUrl) return "placeholder";
  if (!text && pdfUrl) return "internatura-pdf";
  return "article";
}

export function getInternaturaHeroConfig(slug?: string): InternaturaHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.internatura",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getInternaturaPageMeta(slug?: string): Pick<PageConfig, "pdfTitleKey" | "leadKey"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { pdfTitleKey, leadKey } = PAGE_CONFIG[slug];
  return { pdfTitleKey, leadKey };
}

export function getInternaturaPdfTitleKey(pdfUrl?: string | null, slug?: string): string {
  const meta = getInternaturaPageMeta(slug);
  if (meta.pdfTitleKey) return meta.pdfTitleKey;
  if (pdfUrl && /mandat/i.test(decodeURIComponent(pdfUrl))) return "admission.internatura.pdf.mandat";
  if (pdfUrl && /buyruq|taqsimot/i.test(decodeURIComponent(pdfUrl))) return "admission.internatura.pdf.distribution";
  return "admission.downloadPdf";
}

export function getInternaturaCommissionContact() {
  return {
    address: INSTITUTE_ADDRESS,
    phones: ["+998 95 062-23-45", "+998 95 063-23-45"],
    emails: ["info@fjsti.uz", "fmioz@mail.ru"],
    mapUrl: MAP_EMBED_URL,
  };
}
