import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import type { BakalavriatStudentContentVariant } from "@/lib/bakalavriatStudentSection";

export const IQTIDORLI_STUDENT_MENU_ID = 414;

export type IqtidorliStudentContentVariant = BakalavriatStudentContentVariant;

export type IqtidorliStudentHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type IqtidorliStudentRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: IqtidorliStudentContentVariant;
  heroAccent: string;
  heroIcon: string;
  linksIntroKey?: string;
  infoIntroKey?: string;
  infoNoteKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "iqtidorli-talabalar": {
    introKey: "student.iqtidorli.intro.yutuqlar",
    variant: "student-pdf-links",
    heroAccent: "student-iq-yutuqlar",
    heroIcon: "ri-medal-line",
    linksIntroKey: "student.iqtidorli.yutuqlar.intro",
  },
  "respublika-miqiyosidagi-yutuqlar": {
    introKey: "student.iqtidorli.intro.respublika",
    variant: "student-info",
    heroAccent: "student-iq-respublika",
    heroIcon: "ri-trophy-line",
    infoIntroKey: "student.iqtidorli.respublika.intro",
    infoNoteKey: "student.iqtidorli.respublika.note",
  },
  "xalqaro-fan-olimpiadalari": {
    introKey: "student.iqtidorli.intro.xalqaro",
    variant: "student-info",
    heroAccent: "student-iq-xalqaro",
    heroIcon: "ri-earth-line",
    infoIntroKey: "student.iqtidorli.xalqaro.intro",
    infoNoteKey: "student.iqtidorli.xalqaro.note",
  },
  "olimpiada-sertifikatlari": {
    introKey: "student.iqtidorli.intro.sertifikat",
    variant: "student-info",
    heroAccent: "student-iq-sertifikat",
    heroIcon: "ri-award-line",
    infoIntroKey: "student.iqtidorli.sertifikat.intro",
    infoNoteKey: "student.iqtidorli.sertifikat.note",
  },
  "xalqaro-talabalar-anjumani": {
    introKey: "student.iqtidorli.intro.anjuman",
    variant: "student-article",
    heroAccent: "student-iq-anjuman",
    heroIcon: "ri-team-line",
  },
};

export const IQTIDORLI_STUDENT_RELATED_LINKS: IqtidorliStudentRelatedLink[] = [
  { slug: "iqtidorli-talabalar", labelKey: "student.iqtidorli.link.yutuqlar", icon: "ri-medal-line" },
  { slug: "respublika-miqiyosidagi-yutuqlar", labelKey: "student.iqtidorli.link.respublika", icon: "ri-trophy-line" },
  { slug: "xalqaro-fan-olimpiadalari", labelKey: "student.iqtidorli.link.xalqaro", icon: "ri-earth-line" },
  { slug: "olimpiada-sertifikatlari", labelKey: "student.iqtidorli.link.sertifikat", icon: "ri-award-line" },
  { slug: "xalqaro-talabalar-anjumani", labelKey: "student.iqtidorli.link.anjuman", icon: "ri-team-line" },
];

export function isIqtidorliStudentSectionPage(menuId?: number): boolean {
  return menuId === IQTIDORLI_STUDENT_MENU_ID;
}

export function getIqtidorliStudentContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): IqtidorliStudentContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "student-article";
  if (!text || text.length < 25) return "placeholder";
  if (parseStudentAchievementLinks(html ?? "").length > 0) return "student-pdf-links";
  return "article";
}

function parseStudentAchievementLinks(html: string): string[] {
  if (!html?.trim() || typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  return [...doc.body.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? "").filter(Boolean);
}

export function getIqtidorliStudentHeroConfig(slug?: string): IqtidorliStudentHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.iqtidorli",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getIqtidorliStudentPageMeta(
  slug?: string,
): Pick<PageConfig, "linksIntroKey" | "infoIntroKey" | "infoNoteKey"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { linksIntroKey, infoIntroKey, infoNoteKey } = PAGE_CONFIG[slug];
  return { linksIntroKey, infoIntroKey, infoNoteKey };
}

export function getIqtidorliStudentPdfTitleKey(_pdfUrl?: string | null, _slug?: string): string {
  return "admission.downloadPdf";
}
