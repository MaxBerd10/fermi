import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export const MAGISTRATURA_MENU_ID = 100;

export type MagistraturaContentVariant =
  | "article"
  | "pdf-only"
  | "pdf-intro"
  | "documents"
  | "quota-gallery"
  | "external-cta"
  | "contact"
  | "placeholder"
  | "docs-checklist";

export type MagistraturaHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

type PageConfig = {
  introKey: string;
  variant: MagistraturaContentVariant;
  heroAccent: string;
  heroIcon: string;
  externalUrl?: string;
  externalLabelKey?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  "magistratura-online-royxatdan-otish-2025": {
    introKey: "admission.magistratura.intro.onlineRegister",
    variant: "external-cta",
    heroAccent: "magistratura-register",
    heroIcon: "ri-user-add-line",
    externalUrl: "https://my.edu.uz",
    externalLabelKey: "admission.magistratura.cta.registerPortal",
  },
  "qabul-nizomi-2": {
    introKey: "admission.magistratura.intro.qabulNizomi",
    variant: "pdf-intro",
    heroAccent: "magistratura-rules",
    heroIcon: "ri-scales-3-line",
  },
  "magistratura-qabul-kvotasi-2025": {
    introKey: "admission.magistratura.intro.qabulKvota",
    variant: "quota-gallery",
    heroAccent: "magistratura-quota",
    heroIcon: "ri-pie-chart-line",
  },
  "magistratura-qabul-hujjatlari-toplami": {
    introKey: "admission.magistratura.intro.kerakliHujjatlar",
    variant: "docs-checklist",
    heroAccent: "magistratura-docs",
    heroIcon: "ri-folder-3-line",
  },
  "magistratura-imtihon-fanlari-royxati": {
    introKey: "admission.magistratura.intro.imtihonFanlar",
    variant: "pdf-intro",
    heroAccent: "magistratura-subjects",
    heroIcon: "ri-book-read-line",
  },
  "magistratura-qabul-komissiyasi-joylashgan-orni": {
    introKey: "admission.magistratura.intro.qabulManzil",
    variant: "contact",
    heroAccent: "magistratura-contact",
    heroIcon: "ri-map-pin-line",
  },
  "magistratura-natijalari-2024": {
    introKey: "admission.magistratura.intro.natijalar",
    variant: "quota-gallery",
    heroAccent: "magistratura-results",
    heroIcon: "ri-bar-chart-box-line",
  },
  "magistratura-talim-granti-20252026": {
    introKey: "admission.magistratura.intro.talimGranti",
    variant: "quota-gallery",
    heroAccent: "magistratura-grant",
    heroIcon: "ri-award-line",
  },
};

export function isMagistraturaSectionPage(menuId?: number): boolean {
  return menuId === MAGISTRATURA_MENU_ID;
}

export function getMagistraturaContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): MagistraturaContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text && pdfUrl) return "pdf-only";
  if (!text || text.length < 25) return "placeholder";
  if (html && (html.match(/href=/gi)?.length ?? 0) >= 3) return "documents";
  return "article";
}

export function getMagistraturaHeroConfig(slug?: string): MagistraturaHeroConfig | null {
  if (!slug || !PAGE_CONFIG[slug]) return null;
  const page = PAGE_CONFIG[slug];
  return {
    eyebrowKey: "nav.section.magistratura",
    introKey: page.introKey,
    accent: page.heroAccent,
    icon: page.heroIcon,
  };
}

export function getMagistraturaExternalCta(slug?: string): { url: string; labelKey: string } | null {
  if (!slug || !PAGE_CONFIG[slug]?.externalUrl) return null;
  const page = PAGE_CONFIG[slug];
  return {
    url: page.externalUrl!,
    labelKey: page.externalLabelKey ?? "admission.cta.openPortal",
  };
}
