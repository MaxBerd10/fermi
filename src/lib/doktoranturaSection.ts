import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const DOKTORANTURA_MENU_ID = 262;

export type DoktoranturaContentVariant =
  | "article"
  | "pdf-only"
  | "placeholder"
  | "doctorate-exam"
  | "doctorate-mandat";

export type DoktoranturaHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type DoktoranturaSpecialtyLink = {
  slug: string;
  code: string;
  title: string;
};

type PageConfig = {
  introKey: string;
  variant: DoktoranturaContentVariant;
  heroAccent: string;
  heroIcon: string;
  code?: string;
  title?: string;
};

const EXAM_INTRO = "admission.doktorantura.intro.exam";

const PAGE_CONFIG: Record<string, PageConfig> = {
  "140001-akusherlik-va-ginekologiya": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.01",
    title: "Akusherlik va ginekologiya",
  },
  "140002-morfologiya": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.02",
    title: "Morfologiya",
  },
  "140007-gigiyena": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.07",
    title: "Gigiyena",
  },
  "140011-dermatologiya-va-venerologiya": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.11",
    title: "Dermatologiya va venerologiya",
  },
  "140013-nevrologiya": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.13",
    title: "Nevrologiya",
  },
  "140015-patologik-anatomiya": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.15",
    title: "Patologik anatomiya",
  },
  "130002talim-va-tarbiya-nazariyasi-va-metodikasi-sohalar-boʻyicha": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "13.00.02",
    title: "Ta'lim va tarbiya nazariyasi va metodikasi sohalar bo'yicha",
  },
  "140003endokrinologiya": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.03",
    title: "Endokrinologiya",
  },
  "030008-odam-va-hayvonlar-fiziologiyasi": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "03.00.08",
    title: "Odam va hayvonlar fiziologiyasi",
  },
  "140005-ichki-kasalliklar": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.05",
    title: "Ichki kasalliklar",
  },
  "140043-profilaktik-tibbyot": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.43",
    title: "Profilaktik tibbyot",
  },
  "140025-klinik-laborator-va-funktsional-diagnostika": {
    introKey: EXAM_INTRO,
    variant: "doctorate-exam",
    heroAccent: "doc-exam",
    heroIcon: "ri-file-edit-line",
    code: "14.00.25",
    title: "Klinik laborator va funktsional diagnostika",
  },
  "doktorantura-mandat-2025": {
    introKey: "admission.doktorantura.intro.mandat",
    variant: "doctorate-mandat",
    heroAccent: "doc-mandat",
    heroIcon: "ri-award-line",
  },
};

export const DOKTORANTURA_SPECIALTY_LINKS: DoktoranturaSpecialtyLink[] = Object.entries(PAGE_CONFIG)
  .filter(([, cfg]) => cfg.variant === "doctorate-exam" && cfg.code && cfg.title)
  .map(([slug, cfg]) => ({ slug, code: cfg.code!, title: cfg.title! }))
  .sort((a, b) => a.code.localeCompare(b.code));

export function isDoktoranturaSectionPage(menuId?: number): boolean {
  return menuId === DOKTORANTURA_MENU_ID;
}

export function getDoktoranturaContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): DoktoranturaContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) {
    if (slug && /mandat/i.test(slug)) return "doctorate-mandat";
    return "doctorate-exam";
  }
  if (!text || text.length < 25) return "placeholder";
  return "article";
}

export function getDoktoranturaHeroConfig(slug?: string): DoktoranturaHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.doktorantura",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getDoktoranturaPdfTitleKey(pdfUrl?: string | null, slug?: string): string {
  if (slug === "doktorantura-mandat-2025") return "admission.doktorantura.pdf.mandat";
  if (pdfUrl && /mandat/i.test(decodeURIComponent(pdfUrl))) return "admission.doktorantura.pdf.mandat";
  if (pdfUrl && /dastur/i.test(decodeURIComponent(pdfUrl))) return "admission.doktorantura.pdf.examProgram";
  return "admission.doktorantura.pdf.examProgram";
}
