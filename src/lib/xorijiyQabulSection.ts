import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const XORIJIY_QABUL_MENU_ID = 378;

export const FOREIGN_BACHELOR_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScIUuq7K99n3G6rau00oejQrpQpmjFoQmc7hScJ1zEXzYs1Nw/viewform";

export type XorijiyQabulContentVariant =
  | "article"
  | "pdf-only"
  | "placeholder"
  | "foreign-bachelor"
  | "foreign-ordinatura"
  | "foreign-docs"
  | "foreign-contract"
  | "foreign-mandat";

export type XorijiyQabulHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type XorijiyQabulRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

export type ForeignContractRow = {
  num: number;
  direction: string;
  cisAmount: string;
  foreignAmount: string;
};

type PageConfig = {
  introKey: string;
  variant: XorijiyQabulContentVariant;
  heroAccent: string;
  heroIcon: string;
  pdfTitleKey?: string;
  leadKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "bakalavriat-2025": {
    introKey: "admission.xorijiy.intro.bakalavriat",
    variant: "foreign-bachelor",
    heroAccent: "foreign-bachelor",
    heroIcon: "ri-graduation-cap-line",
  },
  "xorijiy-fuqarolar-uchun-magistratura-va-klinik-ordinatura": {
    introKey: "admission.xorijiy.intro.ordinatura",
    variant: "foreign-ordinatura",
    heroAccent: "foreign-ordinatura",
    heroIcon: "ri-stethoscope-line",
  },
  "horijiy-fuqarolar-uchun-hujjatlarni-topshirish-tartibi": {
    introKey: "admission.xorijiy.intro.hujjatlar",
    variant: "foreign-docs",
    heroAccent: "foreign-docs",
    heroIcon: "ri-folder-3-line",
    pdfTitleKey: "admission.xorijiy.pdf.application",
  },
  "xorijiy-talabalar-uchun-tolov-kontrakatlar-miqdori": {
    introKey: "admission.xorijiy.intro.kontrakt",
    variant: "foreign-contract",
    heroAccent: "foreign-contract",
    heroIcon: "ri-money-dollar-circle-line",
  },
  "xorijiy-abiturientlar-uchun-mandat-2025": {
    introKey: "admission.xorijiy.intro.mandat",
    variant: "foreign-mandat",
    heroAccent: "foreign-mandat",
    heroIcon: "ri-award-line",
    pdfTitleKey: "admission.xorijiy.pdf.mandat",
    leadKey: "admission.xorijiy.mandat.lead",
  },
};

export const XORIJIY_QABUL_RELATED_LINKS: XorijiyQabulRelatedLink[] = [
  { slug: "bakalavriat-2025", labelKey: "admission.xorijiy.link.bakalavriat", icon: "ri-graduation-cap-line" },
  {
    slug: "xorijiy-fuqarolar-uchun-magistratura-va-klinik-ordinatura",
    labelKey: "admission.xorijiy.link.ordinatura",
    icon: "ri-stethoscope-line",
  },
  {
    slug: "horijiy-fuqarolar-uchun-hujjatlarni-topshirish-tartibi",
    labelKey: "admission.xorijiy.link.hujjatlar",
    icon: "ri-folder-3-line",
  },
  {
    slug: "xorijiy-talabalar-uchun-tolov-kontrakatlar-miqdori",
    labelKey: "admission.xorijiy.link.kontrakt",
    icon: "ri-money-dollar-circle-line",
  },
  { slug: "xorijiy-abiturientlar-uchun-mandat-2025", labelKey: "admission.xorijiy.link.mandat", icon: "ri-award-line" },
];

export const FOREIGN_BACHELOR_CONTRACT_ROWS: ForeignContractRow[] = [
  { num: 1, direction: "Stomatologiya", cisAmount: "2200 $", foreignAmount: "3500 $" },
  { num: 2, direction: "Farmatsiya", cisAmount: "2200 $", foreignAmount: "3500 $" },
  { num: 3, direction: "Pediatriya ishi", cisAmount: "2200 $", foreignAmount: "3500 $" },
  { num: 4, direction: "Davolash ishi", cisAmount: "2200 $", foreignAmount: "3500 $" },
  { num: 5, direction: "Tibbiy profilaktika ishi", cisAmount: "2200 $", foreignAmount: "3500 $" },
  { num: 6, direction: "Oliy hamshiralik ishi", cisAmount: "2200 $", foreignAmount: "3500 $" },
  { num: 7, direction: "Biotibbiyot muhandisligi", cisAmount: "2200 $", foreignAmount: "3500 $" },
  { num: 8, direction: "Fundamental tibbiyot", cisAmount: "2200 $", foreignAmount: "3500 $" },
];

export const FOREIGN_MASTER_CONTRACT_ROWS: ForeignContractRow[] = [
  { num: 1, direction: "Endokrinologiya", cisAmount: "3000 $", foreignAmount: "3000 $" },
  { num: 2, direction: "Gigiyena", cisAmount: "3000 $", foreignAmount: "3000 $" },
  { num: 3, direction: "Kardiologiya", cisAmount: "3000 $", foreignAmount: "3000 $" },
  { num: 4, direction: "Pediatriya", cisAmount: "3000 $", foreignAmount: "3000 $" },
  { num: 5, direction: "Patologik anatomiya", cisAmount: "3000 $", foreignAmount: "3000 $" },
  { num: 6, direction: "Terapiya (yo'nalishlar bo'yicha)", cisAmount: "3000 $", foreignAmount: "3000 $" },
  { num: 7, direction: "Tibbiyot doktori", cisAmount: "3500 $", foreignAmount: "3500 $" },
];

export function isXorijiyQabulSectionPage(menuId?: number): boolean {
  return menuId === XORIJIY_QABUL_MENU_ID;
}

export function getXorijiyQabulContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): XorijiyQabulContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "foreign-mandat";
  if (!text || text.length < 25) return "placeholder";
  if (/<table/i.test(html ?? "")) return "foreign-contract";
  return "article";
}

export function getXorijiyQabulHeroConfig(slug?: string): XorijiyQabulHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.xorijiyQabul",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getXorijiyQabulPageMeta(slug?: string): Pick<PageConfig, "pdfTitleKey" | "leadKey"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { pdfTitleKey, leadKey } = PAGE_CONFIG[slug];
  return { pdfTitleKey, leadKey };
}

export function getXorijiyQabulPdfTitleKey(pdfUrl?: string | null, slug?: string): string {
  const meta = getXorijiyQabulPageMeta(slug);
  if (meta.pdfTitleKey) return meta.pdfTitleKey;
  if (pdfUrl && /mandat/i.test(decodeURIComponent(pdfUrl))) return "admission.xorijiy.pdf.mandat";
  if (pdfUrl && /zayavlenie|application/i.test(decodeURIComponent(pdfUrl))) return "admission.xorijiy.pdf.application";
  return "admission.downloadPdf";
}

export function getXorijiyQabulExternalCta(slug?: string): { url: string; labelKey: string } | null {
  if (slug === "bakalavriat-2025") {
    return { url: FOREIGN_BACHELOR_FORM_URL, labelKey: "admission.xorijiy.cta.applyForm" };
  }
  if (slug === "xorijiy-fuqarolar-uchun-magistratura-va-klinik-ordinatura") {
    return { url: FOREIGN_BACHELOR_FORM_URL, labelKey: "admission.xorijiy.cta.applyOnline" };
  }
  return null;
}

export function getXorijiyQabulDocsHref(): string {
  return `/blog/${XORIJIY_QABUL_MENU_ID}/horijiy-fuqarolar-uchun-hujjatlarni-topshirish-tartibi`;
}
