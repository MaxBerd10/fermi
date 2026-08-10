import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const BAKALAVRIAT_STUDENT_MENU_ID = 29;

export const STUDENT_DORM_PORTAL = "https://my.gov.uz/oz/service/870";

export type BakalavriatStudentContentVariant =
  | "article"
  | "pdf-only"
  | "placeholder"
  | "student-article"
  | "student-pdf-links"
  | "student-test-collections"
  | "student-dorm"
  | "student-info"
  | "student-foreign-contract";

export type BakalavriatStudentHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type BakalavriatStudentRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: BakalavriatStudentContentVariant;
  heroAccent: string;
  heroIcon: string;
  pdfTitleKey?: string;
  linksIntroKey?: string;
  pdfFirst?: boolean;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "bakalavriat-uchun-yoriqnoma": {
    introKey: "student.bakalavriat.intro.yoriqnoma",
    variant: "student-article",
    heroAccent: "student-guide",
    heroIcon: "ri-book-open-line",
    pdfTitleKey: "student.bakalavriat.pdf.yoriqnoma",
  },
  "iqtidorli-talabalar": {
    introKey: "student.bakalavriat.intro.iqtidorli",
    variant: "student-pdf-links",
    heroAccent: "student-talented",
    heroIcon: "ri-medal-line",
    linksIntroKey: "student.bakalavriat.iqtidorli.intro",
  },
  "mutaxassisliklar-boyicha-testlar-toplami": {
    introKey: "student.bakalavriat.intro.testToplamlari",
    variant: "student-test-collections",
    heroAccent: "student-tests",
    heroIcon: "ri-file-list-3-line",
  },
  "test-markazi-semestr-grafigi": {
    introKey: "student.bakalavriat.intro.semestrGrafik",
    variant: "student-pdf-links",
    heroAccent: "student-schedule",
    heroIcon: "ri-calendar-schedule-line",
    linksIntroKey: "student.bakalavriat.semestrGrafik.intro",
  },
  "dak-savollari": {
    introKey: "student.bakalavriat.intro.dak",
    variant: "student-pdf-links",
    heroAccent: "student-dak",
    heroIcon: "ri-question-answer-line",
    linksIntroKey: "student.bakalavriat.dak.intro",
  },
  "talaba-maqomi": {
    introKey: "student.bakalavriat.intro.maqomi",
    variant: "student-article",
    heroAccent: "student-status",
    heroIcon: "ri-user-star-line",
    pdfTitleKey: "student.bakalavriat.pdf.maqomi",
  },
  "bakalavriat-bitiruvchilariga-beriladigan-kvalifikatsiyalar-2025": {
    introKey: "student.bakalavriat.intro.kvalifikatsiya",
    variant: "student-article",
    heroAccent: "student-qualifications",
    heroIcon: "ri-award-line",
    pdfTitleKey: "student.bakalavriat.pdf.kvalifikatsiya",
    pdfFirst: true,
  },
  "talabalar-turar-joyi-uchun-ariza-yuborish": {
    introKey: "student.bakalavriat.intro.turarJoy",
    variant: "student-dorm",
    heroAccent: "student-dorm",
    heroIcon: "ri-home-heart-line",
    pdfTitleKey: "student.bakalavriat.pdf.turarJoy",
  },
  "grantlar-taqsimoti": {
    introKey: "student.bakalavriat.intro.grantlar",
    variant: "student-article",
    heroAccent: "student-grants",
    heroIcon: "ri-pie-chart-line",
  },
};

export const BAKALAVRIAT_STUDENT_RELATED_LINKS: BakalavriatStudentRelatedLink[] = [
  { slug: "bakalavriat-uchun-yoriqnoma", labelKey: "student.bakalavriat.link.yoriqnoma", icon: "ri-book-open-line" },
  { slug: "iqtidorli-talabalar", labelKey: "student.bakalavriat.link.iqtidorli", icon: "ri-medal-line" },
  {
    slug: "mutaxassisliklar-boyicha-testlar-toplami",
    labelKey: "student.bakalavriat.link.testToplamlari",
    icon: "ri-file-list-3-line",
  },
  {
    slug: "test-markazi-semestr-grafigi",
    labelKey: "student.bakalavriat.link.semestrGrafik",
    icon: "ri-calendar-schedule-line",
  },
  { slug: "dak-savollari", labelKey: "student.bakalavriat.link.dak", icon: "ri-question-answer-line" },
  { slug: "talaba-maqomi", labelKey: "student.bakalavriat.link.maqomi", icon: "ri-user-star-line" },
  {
    slug: "bakalavriat-bitiruvchilariga-beriladigan-kvalifikatsiyalar-2025",
    labelKey: "student.bakalavriat.link.kvalifikatsiya",
    icon: "ri-award-line",
  },
  {
    slug: "talabalar-turar-joyi-uchun-ariza-yuborish",
    labelKey: "student.bakalavriat.link.turarJoy",
    icon: "ri-home-heart-line",
  },
  { slug: "grantlar-taqsimoti", labelKey: "student.bakalavriat.link.grantlar", icon: "ri-pie-chart-line" },
];

export function isBakalavriatStudentSectionPage(menuId?: number): boolean {
  return menuId === BAKALAVRIAT_STUDENT_MENU_ID;
}

export function getBakalavriatStudentContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): BakalavriatStudentContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "student-article";
  if (!text || text.length < 25) return "placeholder";
  return "article";
}

export function getBakalavriatStudentHeroConfig(slug?: string): BakalavriatStudentHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.bakalavriatStudent",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getBakalavriatStudentPageMeta(slug?: string): Pick<PageConfig, "pdfTitleKey" | "linksIntroKey" | "pdfFirst"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { pdfTitleKey, linksIntroKey, pdfFirst } = PAGE_CONFIG[slug];
  return { pdfTitleKey, linksIntroKey, pdfFirst };
}

export function getBakalavriatStudentPdfTitleKey(pdfUrl?: string | null, slug?: string): string {
  const meta = getBakalavriatStudentPageMeta(slug);
  if (meta.pdfTitleKey) return meta.pdfTitleKey;
  if (pdfUrl && /axloq|odob/i.test(decodeURIComponent(pdfUrl))) return "student.bakalavriat.pdf.yoriqnoma";
  if (pdfUrl && /kvalif/i.test(decodeURIComponent(pdfUrl))) return "student.bakalavriat.pdf.kvalifikatsiya";
  if (pdfUrl && /376|turar/i.test(decodeURIComponent(pdfUrl))) return "student.bakalavriat.pdf.turarJoy";
  return "admission.downloadPdf";
}

export function getBakalavriatStudentExternalCta(slug?: string): { url: string; labelKey: string } | null {
  if (slug === "talabalar-turar-joyi-uchun-ariza-yuborish") {
    return { url: STUDENT_DORM_PORTAL, labelKey: "student.bakalavriat.cta.dormPortal" };
  }
  return null;
}
