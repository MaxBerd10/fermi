export const XORIJIY_NEWS_MENU_ID = 6;



export type NewsCategoryFallback = "menu-list";



export type NewsCategoryHeroConfig = {

  eyebrowKey: string;

  introKey: string;

  accent: string;

  icon: string;

  theme: string;

  /** CMS kategoriyasi yo'q bo'lsa — menuId bo'yicha yangiliklar ro'yxati */

  fallback?: NewsCategoryFallback;

  menuSectionId?: number;

  titleKey?: string;

};



const CATEGORY_CONFIG: Record<string, NewsCategoryHeroConfig> = {

  tadbirlar: {

    eyebrowKey: "news.category.tadbirlar.eyebrow",

    introKey: "news.category.tadbirlar.intro",

    accent: "news-cat-events",

    icon: "ri-calendar-event-line",

    theme: "events",

  },

  "kimlarga-piyoz-yeyish-mumkin-emas": {

    eyebrowKey: "news.category.xorijiy.eyebrow",

    introKey: "news.category.xorijiy.intro",

    accent: "news-cat-xorijiy",

    icon: "ri-global-line",

    theme: "xorijiy",

    fallback: "menu-list",

    menuSectionId: XORIJIY_NEWS_MENU_ID,

    titleKey: "nav.section.xorijiy",

  },

};



export function getNewsCategoryConfig(slug?: string): NewsCategoryHeroConfig | null {

  if (!slug) return null;

  return CATEGORY_CONFIG[slug] ?? null;

}



export function isNewsCategoryConfigured(slug?: string): boolean {

  return getNewsCategoryConfig(slug) !== null;

}



export function isNewsMenuLanding(slug?: string, menuId?: number): boolean {

  const config = getNewsCategoryConfig(slug);

  return config?.fallback === "menu-list" && config.menuSectionId === menuId;

}


