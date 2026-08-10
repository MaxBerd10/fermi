import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import type { BakalavriatStudentContentVariant } from "@/lib/bakalavriatStudentSection";

export const ORDINATURA_STUDENT_MENU_ID = 173;

export type OrdinaturaStudentContentVariant = BakalavriatStudentContentVariant;

export type OrdinaturaStudentHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type OrdinaturaStudentRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: OrdinaturaStudentContentVariant;
  heroAccent: string;
  heroIcon: string;
  pdfTitleKey?: string;
  infoIntroKey?: string;
  infoPointCount?: number;
  infoNoteKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "yoriqnoma-klinik-ordinatura": {
    introKey: "student.ordinatura.intro.yoriqnoma",
    variant: "student-article",
    heroAccent: "student-ord-guide",
    heroIcon: "ri-book-open-line",
  },
  "stipendiyalar-3": {
    introKey: "student.ordinatura.intro.stipendiya",
    variant: "student-info",
    heroAccent: "student-ord-stipendiya",
    heroIcon: "ri-hand-coin-line",
    infoIntroKey: "student.ordinatura.stipendiya.intro",
    infoPointCount: 5,
    infoNoteKey: "student.ordinatura.stipendiya.note",
  },
  "davlat-imtihonlari": {
    introKey: "student.ordinatura.intro.imtihonlar",
    variant: "student-article",
    heroAccent: "student-ord-exams",
    heroIcon: "ri-file-edit-line",
  },
};

export const ORDINATURA_STUDENT_RELATED_LINKS: OrdinaturaStudentRelatedLink[] = [
  { slug: "yoriqnoma-klinik-ordinatura", labelKey: "student.ordinatura.link.yoriqnoma", icon: "ri-book-open-line" },
  { slug: "stipendiyalar-3", labelKey: "student.ordinatura.link.stipendiya", icon: "ri-hand-coin-line" },
  { slug: "davlat-imtihonlari", labelKey: "student.ordinatura.link.imtihonlar", icon: "ri-file-edit-line" },
];

export function isOrdinaturaStudentSectionPage(menuId?: number): boolean {
  return menuId === ORDINATURA_STUDENT_MENU_ID;
}

export function getOrdinaturaStudentContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): OrdinaturaStudentContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "student-article";
  if (!text || text.length < 25) return "placeholder";
  return "article";
}

export function getOrdinaturaStudentHeroConfig(slug?: string): OrdinaturaStudentHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.ordinaturaStudent",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getOrdinaturaStudentPageMeta(
  slug?: string,
): Pick<PageConfig, "pdfTitleKey" | "infoIntroKey" | "infoPointCount" | "infoNoteKey"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { pdfTitleKey, infoIntroKey, infoPointCount, infoNoteKey } = PAGE_CONFIG[slug];
  return { pdfTitleKey, infoIntroKey, infoPointCount, infoNoteKey };
}

export function getOrdinaturaStudentPdfTitleKey(_pdfUrl?: string | null, slug?: string): string {
  const meta = getOrdinaturaStudentPageMeta(slug);
  if (meta.pdfTitleKey) return meta.pdfTitleKey;
  return "admission.downloadPdf";
}

export function getOrdinaturaStudentInfoPointKey(slug: string, index: number): string {
  if (slug === "stipendiyalar-3") return `student.ordinatura.stipendiya.point${index}`;
  return `student.info.point${index}`;
}
