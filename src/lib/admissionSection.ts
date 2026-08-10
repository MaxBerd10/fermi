import {
  BAKALAVRIAT_MENU_ID,
  getBakalavriatContentVariant,
  getBakalavriatExternalCta,
  getBakalavriatHeroConfig,
  isBakalavriatSectionPage,
  type BakalavriatContentVariant,
  type BakalavriatHeroConfig,
} from "@/lib/bakalavriatSection";
import {
  MAGISTRATURA_MENU_ID,
  getMagistraturaContentVariant,
  getMagistraturaExternalCta,
  getMagistraturaHeroConfig,
  isMagistraturaSectionPage,
  type MagistraturaContentVariant,
  type MagistraturaHeroConfig,
} from "@/lib/magistraturaSection";
import {
  ORDINATURA_MENU_ID,
  getOrdinaturaContentVariant,
  getOrdinaturaExternalCta,
  getOrdinaturaHeroConfig,
  isOrdinaturaSectionPage,
  type OrdinaturaContentVariant,
  type OrdinaturaHeroConfig,
} from "@/lib/ordinaturaSection";
import {
  QOSHMA_MENU_ID,
  getQoshmaContentVariant,
  getQoshmaExternalCta,
  getQoshmaHeroConfig,
  isQoshmaSectionPage,
  type QoshmaContentVariant,
  type QoshmaHeroConfig,
} from "@/lib/qoshmaSection";
import {
  KOCHIRISH_MENU_ID,
  getKochirishContentVariant,
  getKochirishHeroConfig,
  isKochirishSectionPage,
  type KochirishContentVariant,
  type KochirishHeroConfig,
} from "@/lib/kochirishSection";
import {
  DOKTORANTURA_MENU_ID,
  getDoktoranturaContentVariant,
  getDoktoranturaHeroConfig,
  isDoktoranturaSectionPage,
  type DoktoranturaContentVariant,
  type DoktoranturaHeroConfig,
} from "@/lib/doktoranturaSection";
import {
  INTERNATURA_MENU_ID,
  getInternaturaContentVariant,
  getInternaturaHeroConfig,
  isInternaturaSectionPage,
  type InternaturaContentVariant,
  type InternaturaHeroConfig,
} from "@/lib/internaturaSection";
import {
  XORIJIY_QABUL_MENU_ID,
  getXorijiyQabulContentVariant,
  getXorijiyQabulExternalCta,
  getXorijiyQabulHeroConfig,
  isXorijiyQabulSectionPage,
  type XorijiyQabulContentVariant,
  type XorijiyQabulHeroConfig,
} from "@/lib/xorijiyQabulSection";
import {
  TEXNIKUM_BITIRUV_MENU_ID,
  getTexnikumBitiruvContentVariant,
  getTexnikumBitiruvExternalCta,
  getTexnikumBitiruvHeroConfig,
  isTexnikumBitiruvSectionPage,
  type TexnikumBitiruvContentVariant,
  type TexnikumBitiruvHeroConfig,
} from "@/lib/texnikumBitiruvSection";

export const ADMISSION_MENU_IDS = [
  BAKALAVRIAT_MENU_ID,
  MAGISTRATURA_MENU_ID,
  ORDINATURA_MENU_ID,
  QOSHMA_MENU_ID,
  KOCHIRISH_MENU_ID,
  DOKTORANTURA_MENU_ID,
  INTERNATURA_MENU_ID,
  XORIJIY_QABUL_MENU_ID,
  TEXNIKUM_BITIRUV_MENU_ID,
] as const;

export type AdmissionContentVariant =
  | BakalavriatContentVariant
  | MagistraturaContentVariant
  | OrdinaturaContentVariant
  | QoshmaContentVariant
  | KochirishContentVariant
  | DoktoranturaContentVariant
  | InternaturaContentVariant
  | XorijiyQabulContentVariant
  | TexnikumBitiruvContentVariant;
export type AdmissionHeroConfig =
  | BakalavriatHeroConfig
  | MagistraturaHeroConfig
  | OrdinaturaHeroConfig
  | QoshmaHeroConfig
  | KochirishHeroConfig
  | DoktoranturaHeroConfig
  | InternaturaHeroConfig
  | XorijiyQabulHeroConfig
  | TexnikumBitiruvHeroConfig;

export function isAdmissionSectionPage(menuId?: number): boolean {
  return (
    isBakalavriatSectionPage(menuId) ||
    isMagistraturaSectionPage(menuId) ||
    isOrdinaturaSectionPage(menuId) ||
    isQoshmaSectionPage(menuId) ||
    isKochirishSectionPage(menuId) ||
    isDoktoranturaSectionPage(menuId) ||
    isInternaturaSectionPage(menuId) ||
    isXorijiyQabulSectionPage(menuId) ||
    isTexnikumBitiruvSectionPage(menuId)
  );
}

export function getAdmissionPageTheme(menuId: number): string {
  if (menuId === MAGISTRATURA_MENU_ID) return "magistratura";
  if (menuId === ORDINATURA_MENU_ID) return "ordinatura";
  if (menuId === QOSHMA_MENU_ID) return "qoshma";
  if (menuId === KOCHIRISH_MENU_ID) return "kochirish";
  if (menuId === DOKTORANTURA_MENU_ID) return "doktorantura";
  if (menuId === INTERNATURA_MENU_ID) return "internatura";
  if (menuId === XORIJIY_QABUL_MENU_ID) return "xorijiy";
  if (menuId === TEXNIKUM_BITIRUV_MENU_ID) return "texnikum";
  return "bakalavriat";
}

export function getAdmissionContentVariant(
  menuId: number,
  slug?: string,
  html?: string,
  pdfUrl?: string | null,
): AdmissionContentVariant {
  if (menuId === BAKALAVRIAT_MENU_ID) return getBakalavriatContentVariant(slug, html, pdfUrl);
  if (menuId === MAGISTRATURA_MENU_ID) return getMagistraturaContentVariant(slug, html, pdfUrl);
  if (menuId === ORDINATURA_MENU_ID) return getOrdinaturaContentVariant(slug, html, pdfUrl);
  if (menuId === QOSHMA_MENU_ID) return getQoshmaContentVariant(slug, html, pdfUrl);
  if (menuId === KOCHIRISH_MENU_ID) return getKochirishContentVariant(slug, html, pdfUrl);
  if (menuId === DOKTORANTURA_MENU_ID) return getDoktoranturaContentVariant(slug, html, pdfUrl);
  if (menuId === INTERNATURA_MENU_ID) return getInternaturaContentVariant(slug, html, pdfUrl);
  if (menuId === XORIJIY_QABUL_MENU_ID) return getXorijiyQabulContentVariant(slug, html, pdfUrl);
  if (menuId === TEXNIKUM_BITIRUV_MENU_ID) return getTexnikumBitiruvContentVariant(slug, html, pdfUrl);
  return "article";
}

export function getAdmissionHeroConfig(menuId: number, slug?: string): AdmissionHeroConfig | null {
  if (menuId === BAKALAVRIAT_MENU_ID) return getBakalavriatHeroConfig(slug);
  if (menuId === MAGISTRATURA_MENU_ID) return getMagistraturaHeroConfig(slug);
  if (menuId === ORDINATURA_MENU_ID) return getOrdinaturaHeroConfig(slug);
  if (menuId === QOSHMA_MENU_ID) return getQoshmaHeroConfig(slug);
  if (menuId === KOCHIRISH_MENU_ID) return getKochirishHeroConfig(slug);
  if (menuId === DOKTORANTURA_MENU_ID) return getDoktoranturaHeroConfig(slug);
  if (menuId === INTERNATURA_MENU_ID) return getInternaturaHeroConfig(slug);
  if (menuId === XORIJIY_QABUL_MENU_ID) return getXorijiyQabulHeroConfig(slug);
  if (menuId === TEXNIKUM_BITIRUV_MENU_ID) return getTexnikumBitiruvHeroConfig(slug);
  return null;
}

export function getAdmissionExternalCta(menuId: number, slug?: string): { url: string; labelKey: string } | null {
  if (menuId === BAKALAVRIAT_MENU_ID) return getBakalavriatExternalCta(slug);
  if (menuId === MAGISTRATURA_MENU_ID) return getMagistraturaExternalCta(slug);
  if (menuId === ORDINATURA_MENU_ID) return getOrdinaturaExternalCta(slug);
  if (menuId === QOSHMA_MENU_ID) return getQoshmaExternalCta(slug);
  if (menuId === XORIJIY_QABUL_MENU_ID) return getXorijiyQabulExternalCta(slug);
  if (menuId === TEXNIKUM_BITIRUV_MENU_ID) return getTexnikumBitiruvExternalCta(slug);
  return null;
}
