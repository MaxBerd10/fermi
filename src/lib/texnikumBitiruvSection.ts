import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const TEXNIKUM_BITIRUV_MENU_ID = 495;
export const TEXNIKUM_MENU_ID = 337;

export const TEXNIKUM_ONLINE_PORTAL = "https://my.uzbmb.uz";
export const TEXNIKUM_EDU_PORTAL = "https://my.edu.uz";

export type TexnikumBitiruvContentVariant =
  | "article"
  | "pdf-only"
  | "placeholder"
  | "texnikum-online"
  | "texnikum-news"
  | "texnikum-nizom"
  | "texnikum-callcenter"
  | "texnikum-appeal";

export type TexnikumBitiruvHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export type TexnikumCollegeLink = {
  slug: string;
  labelKey: string;
};

export type TexnikumRelatedLink = {
  slug: string;
  labelKey: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: TexnikumBitiruvContentVariant;
  heroAccent: string;
  heroIcon: string;
  pdfTitleKey?: string;
  leadKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "online-royxatdan-otish-2025": {
    introKey: "admission.texnikum.intro.online",
    variant: "texnikum-online",
    heroAccent: "texnikum-online",
    heroIcon: "ri-user-add-line",
  },
  "tibbiyot-texnikumlari-bitiruvchilari-uchun-qabul-komissiyasi-yangiliklari": {
    introKey: "admission.texnikum.intro.yangiliklar",
    variant: "texnikum-news",
    heroAccent: "texnikum-news",
    heroIcon: "ri-newspaper-line",
  },
  "tibbiyot-texnikumi-biturvchilarini-qabul-qilish-nizomi": {
    introKey: "admission.texnikum.intro.nizom",
    variant: "texnikum-nizom",
    heroAccent: "texnikum-nizom",
    heroIcon: "ri-scales-3-line",
    pdfTitleKey: "admission.texnikum.pdf.nizom",
  },
  "texnikumlar-uchun-qabul-komissiyasi-markazi": {
    introKey: "admission.texnikum.intro.callcenter",
    variant: "texnikum-callcenter",
    heroAccent: "texnikum-callcenter",
    heroIcon: "ri-phone-line",
  },
  "appelyatsiya-komissiyasi": {
    introKey: "admission.texnikum.intro.appeal",
    variant: "texnikum-appeal",
    heroAccent: "texnikum-appeal",
    heroIcon: "ri-chat-check-line",
    pdfTitleKey: "admission.texnikum.pdf.appeal",
    leadKey: "admission.texnikum.appeal.lead",
  },
  "texnikum-bituruvchilari": {
    introKey: "admission.texnikum.intro.hub",
    variant: "texnikum-nizom",
    heroAccent: "texnikum-hub",
    heroIcon: "ri-graduation-cap-line",
    pdfTitleKey: "admission.texnikum.pdf.hub",
  },
};

export const TEXNIKUM_COLLEGES: TexnikumCollegeLink[] = [
  { slug: "fargona-shahar-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.ferganaCity" },
  { slug: "1-margilon-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.margilan1" },
  { slug: "2-margilon-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.margilan2" },
  { slug: "qoqon-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.qoqon" },
  { slug: "quva-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.quva" },
  { slug: "buvayda-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.buvayda" },
  { slug: "fargona-tumani-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.ferganaDistrict" },
  { slug: "rishton-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.rishton" },
  { slug: "beshariq-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi", labelKey: "admission.texnikum.college.beshariq" },
];

export const TEXNIKUM_RELATED_LINKS: TexnikumRelatedLink[] = [
  { slug: "online-royxatdan-otish-2025", labelKey: "admission.texnikum.link.online", icon: "ri-user-add-line" },
  {
    slug: "tibbiyot-texnikumlari-bitiruvchilari-uchun-qabul-komissiyasi-yangiliklari",
    labelKey: "admission.texnikum.link.yangiliklar",
    icon: "ri-newspaper-line",
  },
  {
    slug: "tibbiyot-texnikumi-biturvchilarini-qabul-qilish-nizomi",
    labelKey: "admission.texnikum.link.nizom",
    icon: "ri-scales-3-line",
  },
  { slug: "texnikumlar-uchun-qabul-komissiyasi-markazi", labelKey: "admission.texnikum.link.callcenter", icon: "ri-phone-line" },
  { slug: "appelyatsiya-komissiyasi", labelKey: "admission.texnikum.link.appeal", icon: "ri-chat-check-line" },
];

export function isTexnikumBitiruvSectionPage(menuId?: number): boolean {
  return menuId === TEXNIKUM_BITIRUV_MENU_ID;
}

export function getTexnikumBitiruvContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): TexnikumBitiruvContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "texnikum-nizom";
  if (!text || text.length < 25) return "placeholder";
  return "article";
}

export function getTexnikumBitiruvHeroConfig(slug?: string): TexnikumBitiruvHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.texnikumBitiruv",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getTexnikumBitiruvPageMeta(slug?: string): Pick<PageConfig, "pdfTitleKey" | "leadKey"> {
  if (!slug || !PAGE_CONFIG[slug]) return {};
  const { pdfTitleKey, leadKey } = PAGE_CONFIG[slug];
  return { pdfTitleKey, leadKey };
}

export function getTexnikumBitiruvPdfTitleKey(pdfUrl?: string | null, slug?: string): string {
  const meta = getTexnikumBitiruvPageMeta(slug);
  if (meta.pdfTitleKey) return meta.pdfTitleKey;
  if (pdfUrl && /nizom/i.test(decodeURIComponent(pdfUrl))) return "admission.texnikum.pdf.nizom";
  if (pdfUrl && /komissiya|tarkib/i.test(decodeURIComponent(pdfUrl))) return "admission.texnikum.pdf.appeal";
  return "admission.downloadPdf";
}

export function getTexnikumCallCenterContact() {
  return {
    address: "Farg'ona viloyati, Farg'ona shahar, Ozodlik ko'chasi 10a-uy",
    phones: ["+998 95 202-23-45", "+998 95 302-23-45", "+998 95 402-23-45", "+998 95 404-23-45", "+998 95 848-73-53"],
    emails: ["info@fjsti.uz", "fmioz@mail.ru"],
  };
}

export function getTexnikumBitiruvExternalCta(slug?: string): { url: string; labelKey: string } | null {
  if (slug === "online-royxatdan-otish-2025") {
    return { url: TEXNIKUM_ONLINE_PORTAL, labelKey: "admission.texnikum.cta.onlinePortal" };
  }
  if (slug === "tibbiyot-texnikumlari-bitiruvchilari-uchun-qabul-komissiyasi-yangiliklari") {
    return { url: TEXNIKUM_EDU_PORTAL, labelKey: "admission.texnikum.cta.eduPortal" };
  }
  return null;
}
