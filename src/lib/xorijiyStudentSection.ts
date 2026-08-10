import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import type { BakalavriatStudentContentVariant } from "@/lib/bakalavriatStudentSection";

export const XORIJIY_STUDENT_MENU_ID = 344;

export type XorijiyStudentContentVariant = BakalavriatStudentContentVariant;

export type XorijiyStudentHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type XorijiyStudentRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: XorijiyStudentContentVariant;
  heroAccent: string;
  heroIcon: string;
  pdfTitleKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "xorijiy-bolim": {
    introKey: "student.xorijiy.intro.bolim",
    variant: "student-article",
    heroAccent: "student-intl-dept",
    heroIcon: "ri-global-line",
  },
  "xorijiy-talabalar-uchun-tolov-kontrakatlar-miqdori": {
    introKey: "student.xorijiy.intro.kontrakt",
    variant: "student-foreign-contract",
    heroAccent: "student-intl-contract",
    heroIcon: "ri-money-dollar-circle-line",
  },
  "chet-el-talabalari-turar-joyi-togrisidagi-malumotlar": {
    introKey: "student.xorijiy.intro.turarJoy",
    variant: "student-article",
    heroAccent: "student-intl-dorm",
    heroIcon: "ri-home-heart-line",
  },
  "chet-ellik-talabalar-xavfsizligi": {
    introKey: "student.xorijiy.intro.xavfsizlik",
    variant: "student-article",
    heroAccent: "student-intl-safety",
    heroIcon: "ri-shield-check-line",
  },
};

export const XORIJIY_STUDENT_RELATED_LINKS: XorijiyStudentRelatedLink[] = [
  { slug: "xorijiy-bolim", labelKey: "student.xorijiy.link.bolim", icon: "ri-global-line" },
  {
    slug: "xorijiy-talabalar-uchun-tolov-kontrakatlar-miqdori",
    labelKey: "student.xorijiy.link.kontrakt",
    icon: "ri-money-dollar-circle-line",
  },
  {
    slug: "chet-el-talabalari-turar-joyi-togrisidagi-malumotlar",
    labelKey: "student.xorijiy.link.turarJoy",
    icon: "ri-home-heart-line",
  },
  {
    slug: "chet-ellik-talabalar-xavfsizligi",
    labelKey: "student.xorijiy.link.xavfsizlik",
    icon: "ri-shield-check-line",
  },
];

export function isXorijiyStudentSectionPage(menuId?: number): boolean {
  return menuId === XORIJIY_STUDENT_MENU_ID;
}

export function getXorijiyStudentContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): XorijiyStudentContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "student-article";
  if (!text || text.length < 25) return "placeholder";
  if (/<table/i.test(html ?? "")) return "student-foreign-contract";
  return "article";
}

export function getXorijiyStudentHeroConfig(slug?: string): XorijiyStudentHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.xorijiyStudent",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getXorijiyStudentPageMeta(slug?: string): Pick<PageConfig, "pdfTitleKey"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { pdfTitleKey } = PAGE_CONFIG[slug];
  return { pdfTitleKey };
}

export function getXorijiyStudentPdfTitleKey(_pdfUrl?: string | null, slug?: string): string {
  const meta = getXorijiyStudentPageMeta(slug);
  if (meta.pdfTitleKey) return meta.pdfTitleKey;
  return "admission.downloadPdf";
}
