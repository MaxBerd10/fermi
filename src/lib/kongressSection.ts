export const KONGRESS_MENU_ID = 362;

export const KONGRESS_PAGE_SLUGS = new Set(["kongress-2022-2024"]);

export type KongressHeroConfig = {
  eyebrowKey: string;
  introKey: string;
  accent: string;
  icon: string;
};

export function isKongressSectionPage(menuId?: number, slug?: string): boolean {
  if (menuId !== KONGRESS_MENU_ID) return false;
  if (!slug) return true;
  return KONGRESS_PAGE_SLUGS.has(slug);
}

export function getKongressHeroConfig(): KongressHeroConfig {
  return {
    eyebrowKey: "kongress.hero.eyebrow",
    introKey: "kongress.hero.intro",
    accent: "kongress-main",
    icon: "ri-presentation-line",
  };
}

export function getKongressPageTheme(): string {
  return "kongress";
}
