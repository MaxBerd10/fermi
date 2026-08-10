import type { MenuNode } from "@/types/menu";
import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import { stripHtml } from "@/lib/html";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const FAOLIYAT_MENU_IDS = [49, 50, 51, 245, 409, 515, 581, 591] as const;

export const DISSERTATION_DOCTORATE_ITEM_ID = 594;

export type FaoliyatContentVariant =
  | "pdf-only"
  | "pdf-intro"
  | "finance-documents"
  | "documents"
  | "article"
  | "research-table"
  | "autoreferat"
  | "kam-taminlangan"
  | "pediatriya-faoliyat"
  | "fundamental-loyiha"
  | "doktorantura-info"
  | "malakaviy-exams"
  | "dissertation-hub"
  | "placeholder";

type PageConfig = { introKey: string; variant: FaoliyatContentVariant; heroAccent?: string; heroIcon?: string };

export type FaoliyatHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

const MENU_HERO_THEME: Record<number, { eyebrowKey: string; accent: string }> = {
  49: { eyebrowKey: "nav.section.xalqaroFaoliyat", accent: "intl" },
  50: { eyebrowKey: "nav.section.moliyaviyFaoliyat", accent: "finance" },
  51: { eyebrowKey: "nav.section.madaniyFaoliyat", accent: "culture" },
  245: { eyebrowKey: "nav.section.oquvFaoliyat", accent: "academic" },
  409: { eyebrowKey: "nav.section.fakultetFaoliyat", accent: "faculty" },
  515: { eyebrowKey: "nav.section.korrupsiya", accent: "compliance" },
  581: { eyebrowKey: "nav.section.loyihalar", accent: "projects" },
  591: { eyebrowKey: "nav.section.doktoranturaFaoliyat", accent: "doctorate" },
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  // Xalqaro faoliyat (49)
  "xalqaro-talim": {
    introKey: "faoliyat.intro.xalqaroTalim",
    variant: "pdf-only",
    heroAccent: "intl-edu",
    heroIcon: "ri-graduation-cap-line",
  },
  "amaldagi-loyihalar": {
    introKey: "faoliyat.intro.amaldagiLoyihalar",
    variant: "placeholder",
    heroAccent: "intl-projects",
    heroIcon: "ri-stack-line",
  },
  "xalqaro-xamkor-tashkilotlar": {
    introKey: "faoliyat.intro.xalqaroHamkor",
    variant: "article",
    heroAccent: "intl-partners",
    heroIcon: "ri-global-line",
  },
  "iqlim-boyicha-xarakatlar-strategiyasi": {
    introKey: "faoliyat.intro.iqlim",
    variant: "documents",
    heroAccent: "intl-climate",
    heroIcon: "ri-leaf-line",
  },
  "thumbay-fergana-college-of-medical-sciences": {
    introKey: "faoliyat.intro.thumbay",
    variant: "article",
    heroAccent: "intl-thumbay",
    heroIcon: "ri-building-4-line",
  },

  // Moliyaviy faoliyat (50)
  "kontrakt-xisob-raqam-smetasi": {
    introKey: "faoliyat.intro.kontraktSmeta",
    variant: "pdf-only",
    heroAccent: "finance-contract",
    heroIcon: "ri-bank-card-line",
  },
  "valyuta-xisob-raqam-smetasi": {
    introKey: "faoliyat.intro.valyutaSmeta",
    variant: "pdf-only",
    heroAccent: "finance-currency",
    heroIcon: "ri-exchange-dollar-line",
  },
  "kvartal-boyicha-tushumlar-va-xarajatlar": {
    introKey: "faoliyat.intro.kvartal",
    variant: "pdf-only",
    heroAccent: "finance-quarter",
    heroIcon: "ri-bar-chart-grouped-line",
  },
  "byudjet-smetasi": {
    introKey: "faoliyat.intro.byudjet",
    variant: "finance-documents",
    heroAccent: "finance-budget",
    heroIcon: "ri-pie-chart-line",
  },
  "davlat-organlari-va-tashkilotlari-tasarrufidagi-xizmat-avtomototransport-vositalari-xizmat-uylari-va-boshqa-kochmas-mulklar-togrisidagi-malumotlar":
    {
      introKey: "faoliyat.intro.kochmasMulklar",
      variant: "pdf-only",
      heroAccent: "finance-property",
      heroIcon: "ri-building-2-line",
    },
  "mansabdor-shaxslarning-xizmat-safarlari-va-xorijdan-tashrif-buyurgan-mehmonlarni-kutib-olish-xarajatlari-togrisidagi-malumotlar":
    {
      introKey: "faoliyat.intro.xizmatSafarlari",
      variant: "pdf-only",
      heroAccent: "finance-travel",
      heroIcon: "ri-flight-takeoff-line",
    },
  "xarid-qilinishi-rejalashtirilgan-tovarlar-ishlar-xizmatlar-togrisida-malumotlar":
    {
      introKey: "faoliyat.intro.rejalashtirilganXaridlar",
      variant: "pdf-only",
      heroAccent: "finance-procurement",
      heroIcon: "ri-shopping-cart-line",
    },
  "davlat-xaridlari-va-investitsiya-loyihalari-doirasida-tashkil-etiladigan-xarid-komissiyalarining-tarkibi-togrisidagi-malumotlar":
    {
      introKey: "faoliyat.intro.xaridKomissiyalari",
      variant: "pdf-intro",
      heroAccent: "finance-commission",
      heroIcon: "ri-team-line",
    },

  // Madaniy-ma'rifiy (51)
  "kam-taminlangan-talabalar-uchun-yaratilgan-imkoniyatlar": {
    introKey: "faoliyat.intro.kamTaminlangan",
    variant: "kam-taminlangan",
    heroAccent: "culture-support",
    heroIcon: "ri-hand-heart-line",
  },

  // O'quv-uslubiy (245)
  "malaka-tavsifnoma": { introKey: "faoliyat.intro.malakaTavsifnoma", variant: "documents" },
  "malaka-talablari": { introKey: "faoliyat.intro.malakaTalablari", variant: "documents" },
  "reyting-nizomi": { introKey: "faoliyat.intro.reytingNizomi", variant: "pdf-only" },
  "kredit-modul-nizomi": { introKey: "faoliyat.intro.kreditModul", variant: "pdf-only" },

  // Fakultetlar faoliyati (409)
  "fakultet-talim-faoliyati": { introKey: "faoliyat.intro.davolashFakultet", variant: "documents" },
  "xalqaro-talim-faoliyati": { introKey: "faoliyat.intro.xalqaroTalimFakultet", variant: "documents" },
  "pediatriya-fakulteti-faoliyati": {
    introKey: "faoliyat.intro.pediatriyaFakultet",
    variant: "pediatriya-faoliyat",
    heroAccent: "faculty-pediatric",
    heroIcon: "ri-emotion-happy-line",
  },

  // Korrupsiya (515)
  "korrupsiyaga-qarshi-ichki-nazorat-komplayens-tizimini-joriy-etish-boyicha-qollanma":
    { introKey: "faoliyat.intro.komplayensQollanma", variant: "pdf-only" },
  "korrupsiyaga-qarshi-kurashish-tadbirlari": { introKey: "faoliyat.intro.korrupsiyaTadbirlari", variant: "article" },
  "uslubiy-qollanma-va-tavsiyalar": { introKey: "faoliyat.intro.uslubiyQollanma", variant: "pdf-only" },
  "tavsiyaviy-qollanma": { introKey: "faoliyat.intro.tavsiyaviyQollanma", variant: "article" },
  "korrupsiyaga-qarshi-kurashish-davlat-dasturlari": { introKey: "faoliyat.intro.korrupsiyaDasturlari", variant: "documents" },
  "ssv-korrupsiyaga-qarshi-kurashish-siyosati": { introKey: "faoliyat.intro.ssvSiyosati", variant: "documents" },

  // Loyihalar (581)
  "fundamental-loyiha": {
    introKey: "faoliyat.intro.fundamentalLoyiha",
    variant: "fundamental-loyiha",
    heroAccent: "projects-fundamental",
    heroIcon: "ri-microscope-line",
  },

  // Doktorantura (591)
  "doktorantura-malumotlari": {
    introKey: "faoliyat.intro.doktoranturaMalumot",
    variant: "doktorantura-info",
    heroAccent: "doctorate-info",
    heroIcon: "ri-graduation-cap-line",
  },
  avtoreferatlar: {
    introKey: "faoliyat.intro.avtoreferatlar",
    variant: "autoreferat",
    heroAccent: "doctorate-autoreferat",
    heroIcon: "ri-book-open-line",
  },
  dissertatsiyalar: {
    introKey: "faoliyat.intro.dissertatsiyalar",
    variant: "dissertation-hub",
    heroAccent: "doctorate-dissertation",
    heroIcon: "ri-article-line",
  },
  monografiya: {
    introKey: "faoliyat.intro.monografiya",
    variant: "documents",
    heroAccent: "doctorate-monograph",
    heroIcon: "ri-book-2-line",
  },
  "malakaviy-imtihonlar": {
    introKey: "faoliyat.intro.malakaviyImtihonlar",
    variant: "malakaviy-exams",
    heroAccent: "doctorate-exams",
    heroIcon: "ri-file-edit-line",
  },
};

const MENU_INTRO_FALLBACK: Record<number, string> = {
  49: "section.intro.xalqaroFaoliyat",
  50: "section.intro.moliyaviyFaoliyat",
  51: "section.intro.madaniyFaoliyat",
  245: "section.intro.oquvFaoliyat",
  409: "section.intro.fakultetFaoliyat",
  515: "section.intro.korrupsiya",
  581: "section.intro.loyihalar",
  591: "section.intro.doktoranturaFaoliyat",
};

const MENU_BREADCRUMB: Record<number, string> = {
  49: "nav.section.xalqaroFaoliyat",
  50: "nav.section.moliyaviyFaoliyat",
  51: "nav.section.madaniyFaoliyat",
  245: "nav.section.oquvFaoliyat",
  409: "nav.section.fakultetFaoliyat",
  515: "nav.section.korrupsiya",
  581: "nav.section.loyihalar",
  591: "nav.section.doktoranturaFaoliyat",
};

export function isFaoliyatSectionPage(menuId?: number): boolean {
  return Boolean(menuId && (FAOLIYAT_MENU_IDS as readonly number[]).includes(menuId));
}

export function isFaoliyatCmsPlaceholder(html?: string | null): boolean {
  const text = decodeAndCleanCmsText((html ?? "").replace(/<[^>]*>/g, " "));
  if (!text || text.length < 40) return true;
  return /sahifa to['']ldirilmoqda|страница заполняется|page is being (updated|filled)/i.test(text);
}

export function getFaoliyatContentVariant(
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): FaoliyatContentVariant {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].variant;

  const text = stripHtml(html ?? "").trim();
  if (!text && pdfUrl) return "pdf-only";
  if (!text && !pdfUrl) return "placeholder";
  if (html && /<table\b/i.test(html)) return "research-table";
  if (html && (html.match(/href=/gi)?.length ?? 0) >= 3) return "documents";
  return "article";
}

export function getFaoliyatIntroKey(slug?: string, menuId?: number): string | null {
  if (slug && PAGE_CONFIG[slug]) return PAGE_CONFIG[slug].introKey;
  if (menuId && MENU_INTRO_FALLBACK[menuId]) return MENU_INTRO_FALLBACK[menuId];
  return null;
}

export function getFaoliyatHeroConfig(slug?: string, menuId?: number): FaoliyatHeroConfig | null {
  if (!menuId) return null;
  const menuTheme = MENU_HERO_THEME[menuId];
  if (!menuTheme) return null;

  const page = slug ? PAGE_CONFIG[slug] : undefined;
  const introKey = page?.introKey ?? MENU_INTRO_FALLBACK[menuId];
  if (!introKey) return null;

  return {
    eyebrowKey: menuTheme.eyebrowKey,
    introKey,
    accent: page?.heroAccent ?? menuTheme.accent,
    icon: page?.heroIcon ?? "ri-file-list-3-line",
  };
}

export function usesFaoliyatHero(menuId?: number): boolean {
  return isFaoliyatSectionPage(menuId);
}

export function getFaoliyatBreadcrumbKey(menuId?: number): string | null {
  if (!menuId) return null;
  return MENU_BREADCRUMB[menuId] ?? null;
}

export function findFaoliyatSectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[]; menuId: number } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (isFaoliyatSectionPage(section.id)) {
        const items = (section.children ?? []).length > 0 ? section.children ?? [] : [section];
        return { title: section.title, items, menuId: section.id };
      }
    }
  }
  return null;
}

export function findFaoliyatSectionMenuById(
  menu: MenuNode[],
  menuId: number,
): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === menuId) {
        const items = (section.children ?? []).length > 0 ? section.children ?? [] : [section];
        return { title: section.title, items };
      }
    }
  }
  return null;
}

export function resolveFaoliyatNavHref(item: MenuNode, menuId: number): string {
  if (item.id === DISSERTATION_DOCTORATE_ITEM_ID) {
    return normalizeMenuHref(`/blog/${menuId}/dissertatsiyalar`);
  }

  const raw = item.urlValue ?? item.href ?? "";
  if (raw === `/blog/${menuId}/` || raw === `/blog/${menuId}`) {
    if (menuId === 591) return normalizeMenuHref("/blog/591/dissertatsiyalar");
  }

  if (item.urlType === "page" && item.urlValue && !item.urlValue.startsWith("/")) {
    return normalizeMenuHref(`/blog/${menuId}/${item.urlValue}`);
  }

  return normalizeMenuHref(item.href);
}

export function isFaoliyatNavItemActive(href: string, pathname: string, slug?: string): boolean {
  const normalized = normalizeMenuHref(href);
  if (pathname === normalized) return true;
  if (slug && normalized.endsWith(`/${slug}`)) return true;
  return false;
}
