import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import type { BakalavriatStudentContentVariant } from "@/lib/bakalavriatStudentSection";

export const MAGISTRATURA_STUDENT_MENU_ID = 115;

export type MagistraturaStudentContentVariant = BakalavriatStudentContentVariant;

export type MagistraturaStudentHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type MagistraturaStudentRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: MagistraturaStudentContentVariant;
  heroAccent: string;
  heroIcon: string;
  pdfTitleKey?: string;
  linksIntroKey?: string;
  pdfFirst?: boolean;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "magistrantlar-uchun-yoriqnoma": {
    introKey: "student.magistratura.intro.yoriqnoma",
    variant: "student-article",
    heroAccent: "student-mag-guide",
    heroIcon: "ri-book-open-line",
    pdfTitleKey: "student.magistratura.pdf.yoriqnoma",
  },
  "magistrlik-dissertatsiyasi-himoyasi": {
    introKey: "student.magistratura.intro.dissertatsiya",
    variant: "student-article",
    heroAccent: "student-mag-dissertation",
    heroIcon: "ri-presentation-line",
    pdfTitleKey: "student.magistratura.pdf.dissertatsiya",
  },
  "magistratura-baholash-mezonlari": {
    introKey: "student.magistratura.intro.mezonlar",
    variant: "student-article",
    heroAccent: "student-mag-criteria",
    heroIcon: "ri-checkbox-multiple-line",
    pdfTitleKey: "student.magistratura.pdf.mezonlar",
  },
  "magistratura-yakuniy-davlat-attestatsiya-imtihon-savollari": {
    introKey: "student.magistratura.intro.yda",
    variant: "student-pdf-links",
    heroAccent: "student-mag-yda",
    heroIcon: "ri-question-answer-line",
    linksIntroKey: "student.magistratura.yda.intro",
  },
  "talaba-maqomi": {
    introKey: "student.magistratura.intro.maqomi",
    variant: "student-article",
    heroAccent: "student-mag-status",
    heroIcon: "ri-user-star-line",
    pdfTitleKey: "student.magistratura.pdf.maqomi",
  },
  "grant-taqsimoti": {
    introKey: "student.magistratura.intro.grantlar",
    variant: "student-article",
    heroAccent: "student-mag-grants",
    heroIcon: "ri-pie-chart-line",
  },
};

export const MAGISTRATURA_STUDENT_RELATED_LINKS: MagistraturaStudentRelatedLink[] = [
  { slug: "magistrantlar-uchun-yoriqnoma", labelKey: "student.magistratura.link.yoriqnoma", icon: "ri-book-open-line" },
  {
    slug: "magistrlik-dissertatsiyasi-himoyasi",
    labelKey: "student.magistratura.link.dissertatsiya",
    icon: "ri-presentation-line",
  },
  {
    slug: "magistratura-baholash-mezonlari",
    labelKey: "student.magistratura.link.mezonlar",
    icon: "ri-checkbox-multiple-line",
  },
  {
    slug: "magistratura-yakuniy-davlat-attestatsiya-imtihon-savollari",
    labelKey: "student.magistratura.link.yda",
    icon: "ri-question-answer-line",
  },
  { slug: "talaba-maqomi", labelKey: "student.magistratura.link.maqomi", icon: "ri-user-star-line" },
  { slug: "grant-taqsimoti", labelKey: "student.magistratura.link.grantlar", icon: "ri-pie-chart-line" },
];

export function isMagistraturaStudentSectionPage(menuId?: number): boolean {
  return menuId === MAGISTRATURA_STUDENT_MENU_ID;
}

export function getMagistraturaStudentContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): MagistraturaStudentContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "student-article";
  if (!text || text.length < 25) return "placeholder";
  return "article";
}

export function getMagistraturaStudentHeroConfig(slug?: string): MagistraturaStudentHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.magistraturaStudent",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getMagistraturaStudentPageMeta(
  slug?: string,
): Pick<PageConfig, "pdfTitleKey" | "linksIntroKey" | "pdfFirst"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { pdfTitleKey, linksIntroKey, pdfFirst } = PAGE_CONFIG[slug];
  return { pdfTitleKey, linksIntroKey, pdfFirst };
}

export function getMagistraturaStudentPdfTitleKey(pdfUrl?: string | null, slug?: string): string {
  const meta = getMagistraturaStudentPageMeta(slug);
  if (meta.pdfTitleKey) return meta.pdfTitleKey;
  if (pdfUrl && /dissertatsiya|mavzusi/i.test(decodeURIComponent(pdfUrl))) return "student.magistratura.pdf.dissertatsiya";
  if (pdfUrl && /baholash|mezoni/i.test(decodeURIComponent(pdfUrl))) return "student.magistratura.pdf.mezonlar";
  if (pdfUrl && /axloq|odob/i.test(decodeURIComponent(pdfUrl))) return "student.magistratura.pdf.yoriqnoma";
  return "admission.downloadPdf";
}
