import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import type { BakalavriatStudentContentVariant } from "@/lib/bakalavriatStudentSection";

export const KLINIK_FIKRLASH_STUDENT_MENU_ID = 573;

export type KlinikFikrlashStudentContentVariant = BakalavriatStudentContentVariant;

export type KlinikFikrlashStudentHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type KlinikFikrlashStudentRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: KlinikFikrlashStudentContentVariant;
  heroAccent: string;
  heroIcon: string;
  linksIntroKey?: string;
  infoIntroKey?: string;
  infoNoteKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "klinik-fikrlashga-doir-video-darslar": {
    introKey: "student.klinikFikrlash.intro.videoDarslar",
    variant: "student-test-collections",
    heroAccent: "student-kf-videos",
    heroIcon: "ri-video-line",
    linksIntroKey: "student.klinikFikrlash.video.intro",
  },
  "step-1": {
    introKey: "student.klinikFikrlash.intro.step1",
    variant: "student-info",
    heroAccent: "student-kf-step1",
    heroIcon: "ri-stack-line",
    infoIntroKey: "student.klinikFikrlash.step1.intro",
    infoNoteKey: "student.klinikFikrlash.step1.note",
  },
};

export const KLINIK_FIKRLASH_STUDENT_RELATED_LINKS: KlinikFikrlashStudentRelatedLink[] = [
  {
    slug: "klinik-fikrlashga-doir-video-darslar",
    labelKey: "student.klinikFikrlash.link.videoDarslar",
    icon: "ri-video-line",
  },
  { slug: "step-1", labelKey: "student.klinikFikrlash.link.step1", icon: "ri-stack-line" },
];

export function isKlinikFikrlashStudentSectionPage(menuId?: number): boolean {
  return menuId === KLINIK_FIKRLASH_STUDENT_MENU_ID;
}

export function getKlinikFikrlashStudentContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): KlinikFikrlashStudentContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "student-article";
  if (!text || text.length < 25) return "placeholder";
  if (/<a\s/i.test(html ?? "")) return "student-test-collections";
  return "article";
}

export function getKlinikFikrlashStudentHeroConfig(slug?: string): KlinikFikrlashStudentHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.klinikFikrlash",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getKlinikFikrlashStudentPageMeta(
  slug?: string,
): Pick<PageConfig, "linksIntroKey" | "infoIntroKey" | "infoNoteKey"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { linksIntroKey, infoIntroKey, infoNoteKey } = PAGE_CONFIG[slug];
  return { linksIntroKey, infoIntroKey, infoNoteKey };
}

export function getKlinikFikrlashStudentPdfTitleKey(_pdfUrl?: string | null, _slug?: string): string {
  return "admission.downloadPdf";
}
