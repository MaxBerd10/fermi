import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const BAKALAVRIAT_MENU_ID = 99;

export type BakalavriatContentVariant =
  | "article"
  | "pdf-only"
  | "pdf-intro"
  | "documents"
  | "quota-gallery"
  | "external-cta"
  | "contact"
  | "placeholder";

export type BakalavriatHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: BakalavriatContentVariant;
  heroAccent: string;
  heroIcon: string;
  externalUrl?: string;
  externalLabelKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "online-royxatdan-otish-2025": {
    introKey: "admission.intro.onlineRegister",
    variant: "external-cta",
    heroAccent: "admission-register",
    heroIcon: "ri-user-add-line",
    externalUrl: "https://my.uzbmb.uz",
    externalLabelKey: "admission.cta.registerPortal",
  },
  "test-materiallaridan-foydalanish-2025": {
    introKey: "admission.intro.testMaterials",
    variant: "pdf-only",
    heroAccent: "admission-test",
    heroIcon: "ri-file-list-3-line",
  },
  "qabul-nizomi": {
    introKey: "admission.intro.qabulNizomi",
    variant: "pdf-intro",
    heroAccent: "admission-rules",
    heroIcon: "ri-scales-3-line",
  },
  "bakalavriat-qabul-kvotasi-2025": {
    introKey: "admission.intro.qabulKvota",
    variant: "quota-gallery",
    heroAccent: "admission-quota",
    heroIcon: "ri-pie-chart-line",
  },
  "imtihon-fanlar-royxati": {
    introKey: "admission.intro.imtihonFanlar",
    variant: "pdf-intro",
    heroAccent: "admission-subjects",
    heroIcon: "ri-book-read-line",
  },
  "qabul-komissiyasi-yangiliklari": {
    introKey: "admission.intro.qabulYangiliklari",
    variant: "article",
    heroAccent: "admission-news",
    heroIcon: "ri-newspaper-line",
  },
  "qabul-komissiyasi-joylashgan-orni": {
    introKey: "admission.intro.qabulManzil",
    variant: "contact",
    heroAccent: "admission-contact",
    heroIcon: "ri-map-pin-line",
  },
  "qabul-hujjatlar-toplami": {
    introKey: "admission.intro.kerakliHujjatlar",
    variant: "article",
    heroAccent: "admission-docs",
    heroIcon: "ri-folder-3-line",
  },
  "test-sinovlarini-otkazish-tartibi-2025": {
    introKey: "admission.intro.testTartibi",
    variant: "pdf-only",
    heroAccent: "admission-test",
    heroIcon: "ri-task-line",
  },
  klassifikator: {
    introKey: "admission.intro.klassifikator",
    variant: "pdf-only",
    heroAccent: "admission-directions",
    heroIcon: "ri-route-line",
  },
  "talim-yonalishlarini-tanlash-yoriqnomasi-2025": {
    introKey: "admission.intro.yonalishYoriqnoma",
    variant: "documents",
    heroAccent: "admission-guide",
    heroIcon: "ri-compass-3-line",
  },
  "nogironligi-bolgan-shaxslarga-qoshimcha-kvota": {
    introKey: "admission.intro.nogironKvota",
    variant: "article",
    heroAccent: "admission-quota",
    heroIcon: "ri-wheelchair-line",
  },
  "bakalavriat-talim-granti-20252026": {
    introKey: "admission.intro.talimGranti",
    variant: "documents",
    heroAccent: "admission-grant",
    heroIcon: "ri-award-line",
  },
  "abituriyentlar-uchun-talim-yonalishlari-va-institut-tarixi": {
    introKey: "admission.intro.abituriyentTarixi",
    variant: "quota-gallery",
    heroAccent: "admission-history",
    heroIcon: "ri-building-line",
  },
  "talabalar-safimizga-qoshiling": {
    introKey: "admission.intro.talabalarSafimiz",
    variant: "placeholder",
    heroAccent: "admission-join",
    heroIcon: "ri-team-line",
  },
  "talabalar-turar-joyi-uchun-ariza-yuborish": {
    introKey: "admission.intro.turarJoyAriza",
    variant: "external-cta",
    heroAccent: "admission-dorm",
    heroIcon: "ri-home-smile-line",
    externalUrl: "https://my.gov.uz/uz/service/213",
    externalLabelKey: "admission.cta.dormPortal",
  },
};

export function isBakalavriatSectionPage(menuId?: number): boolean {
  return menuId === BAKALAVRIAT_MENU_ID;
}

export function isAdmissionCmsPlaceholder(html?: string | null): boolean {
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text || text.length < 25) return true;
  return /sahifa to['']ldirilmoqda|страница заполняется|page is being filled/i.test(text);
}

export function getBakalavriatContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): BakalavriatContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "pdf-only";
  if (isAdmissionCmsPlaceholder(html)) return "placeholder";
  if (html && (html.match(/href=/gi)?.length ?? 0) >= 3) return "documents";
  return "article";
}

export function getBakalavriatIntroKey(slug?: string): string | null {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].introKey;
  return "section.intro.bakalavriat";
}

export function getBakalavriatHeroConfig(slug?: string): BakalavriatHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.bakalavriat",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getBakalavriatExternalCta(slug?: string): { url: string; labelKey: string } | null {
  if (!slug || !PAGE_CONFIG[slug]?.externalUrl) return null;
  const page = PAGE_CONFIG[slug];
  return {
    url: page.externalUrl!,
    labelKey: page.externalLabelKey ?? "admission.cta.openPortal",
  };
}

export function usesBakalavriatHero(menuId?: number): boolean {
  return isBakalavriatSectionPage(menuId);
}
