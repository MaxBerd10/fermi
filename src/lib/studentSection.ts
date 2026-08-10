import {

  BAKALAVRIAT_STUDENT_MENU_ID,

  getBakalavriatStudentContentVariant,

  getBakalavriatStudentExternalCta,

  getBakalavriatStudentHeroConfig,

  getBakalavriatStudentPageMeta,

  getBakalavriatStudentPdfTitleKey,

  isBakalavriatStudentSectionPage,

  type BakalavriatStudentContentVariant,

  type BakalavriatStudentHeroConfig,

} from "@/lib/bakalavriatStudentSection";

import {

  MAGISTRATURA_STUDENT_MENU_ID,

  getMagistraturaStudentContentVariant,

  getMagistraturaStudentHeroConfig,

  getMagistraturaStudentPageMeta,

  getMagistraturaStudentPdfTitleKey,

  isMagistraturaStudentSectionPage,

  type MagistraturaStudentHeroConfig,

} from "@/lib/magistraturaStudentSection";

import {

  ORDINATURA_STUDENT_MENU_ID,

  getOrdinaturaStudentContentVariant,

  getOrdinaturaStudentHeroConfig,

  getOrdinaturaStudentPageMeta,

  getOrdinaturaStudentPdfTitleKey,

  isOrdinaturaStudentSectionPage,

  type OrdinaturaStudentHeroConfig,

} from "@/lib/ordinaturaStudentSection";

import {

  XORIJIY_STUDENT_MENU_ID,

  getXorijiyStudentContentVariant,

  getXorijiyStudentHeroConfig,

  getXorijiyStudentPageMeta,

  getXorijiyStudentPdfTitleKey,

  isXorijiyStudentSectionPage,

  type XorijiyStudentHeroConfig,

} from "@/lib/xorijiyStudentSection";

import {

  IQTIDORLI_STUDENT_MENU_ID,

  getIqtidorliStudentContentVariant,

  getIqtidorliStudentHeroConfig,

  getIqtidorliStudentPageMeta,

  getIqtidorliStudentPdfTitleKey,

  isIqtidorliStudentSectionPage,

  type IqtidorliStudentHeroConfig,

} from "@/lib/iqtidorliStudentSection";

import {

  KLINIK_FIKRLASH_STUDENT_MENU_ID,

  getKlinikFikrlashStudentContentVariant,

  getKlinikFikrlashStudentHeroConfig,

  getKlinikFikrlashStudentPageMeta,

  getKlinikFikrlashStudentPdfTitleKey,

  isKlinikFikrlashStudentSectionPage,

  type KlinikFikrlashStudentHeroConfig,

} from "@/lib/klinikFikrlashStudentSection";



export const STUDENT_MENU_IDS = [

  BAKALAVRIAT_STUDENT_MENU_ID,

  MAGISTRATURA_STUDENT_MENU_ID,

  ORDINATURA_STUDENT_MENU_ID,

  XORIJIY_STUDENT_MENU_ID,

  IQTIDORLI_STUDENT_MENU_ID,

  KLINIK_FIKRLASH_STUDENT_MENU_ID,

] as const;



export type StudentContentVariant = BakalavriatStudentContentVariant;

export type StudentHeroConfig =

  | BakalavriatStudentHeroConfig

  | MagistraturaStudentHeroConfig

  | OrdinaturaStudentHeroConfig

  | XorijiyStudentHeroConfig

  | IqtidorliStudentHeroConfig

  | KlinikFikrlashStudentHeroConfig;



export function isStudentSectionPage(menuId?: number): boolean {

  return (

    isBakalavriatStudentSectionPage(menuId) ||

    isMagistraturaStudentSectionPage(menuId) ||

    isOrdinaturaStudentSectionPage(menuId) ||

    isXorijiyStudentSectionPage(menuId) ||

    isIqtidorliStudentSectionPage(menuId) ||

    isKlinikFikrlashStudentSectionPage(menuId)

  );

}



export function getStudentPageTheme(menuId: number): string {

  if (menuId === BAKALAVRIAT_STUDENT_MENU_ID) return "bakalavriat-student";

  if (menuId === MAGISTRATURA_STUDENT_MENU_ID) return "magistratura-student";

  if (menuId === ORDINATURA_STUDENT_MENU_ID) return "ordinatura-student";

  if (menuId === XORIJIY_STUDENT_MENU_ID) return "xorijiy-student";

  if (menuId === IQTIDORLI_STUDENT_MENU_ID) return "iqtidorli-student";

  if (menuId === KLINIK_FIKRLASH_STUDENT_MENU_ID) return "klinik-fikrlash-student";

  return "student";

}



export function getStudentContentVariant(

  menuId: number,

  slug?: string,

  html?: string,

  pdfUrl?: string | null,

): StudentContentVariant {

  if (menuId === BAKALAVRIAT_STUDENT_MENU_ID) return getBakalavriatStudentContentVariant(slug, html, pdfUrl);

  if (menuId === MAGISTRATURA_STUDENT_MENU_ID) return getMagistraturaStudentContentVariant(slug, html, pdfUrl);

  if (menuId === ORDINATURA_STUDENT_MENU_ID) return getOrdinaturaStudentContentVariant(slug, html, pdfUrl);

  if (menuId === XORIJIY_STUDENT_MENU_ID) return getXorijiyStudentContentVariant(slug, html, pdfUrl);

  if (menuId === IQTIDORLI_STUDENT_MENU_ID) return getIqtidorliStudentContentVariant(slug, html, pdfUrl);

  if (menuId === KLINIK_FIKRLASH_STUDENT_MENU_ID) return getKlinikFikrlashStudentContentVariant(slug, html, pdfUrl);

  return "article";

}



export function getStudentHeroConfig(menuId: number, slug?: string): StudentHeroConfig | null {

  if (menuId === BAKALAVRIAT_STUDENT_MENU_ID) return getBakalavriatStudentHeroConfig(slug);

  if (menuId === MAGISTRATURA_STUDENT_MENU_ID) return getMagistraturaStudentHeroConfig(slug);

  if (menuId === ORDINATURA_STUDENT_MENU_ID) return getOrdinaturaStudentHeroConfig(slug);

  if (menuId === XORIJIY_STUDENT_MENU_ID) return getXorijiyStudentHeroConfig(slug);

  if (menuId === IQTIDORLI_STUDENT_MENU_ID) return getIqtidorliStudentHeroConfig(slug);

  if (menuId === KLINIK_FIKRLASH_STUDENT_MENU_ID) return getKlinikFikrlashStudentHeroConfig(slug);

  return null;

}



export function getStudentPageMeta(

  menuId: number,

  slug?: string,

): {

  pdfTitleKey?: string;

  linksIntroKey?: string;

  pdfFirst?: boolean;

  infoIntroKey?: string;

  infoPointCount?: number;

  infoNoteKey?: string;

} {

  if (menuId === BAKALAVRIAT_STUDENT_MENU_ID) return getBakalavriatStudentPageMeta(slug);

  if (menuId === MAGISTRATURA_STUDENT_MENU_ID) return getMagistraturaStudentPageMeta(slug);

  if (menuId === ORDINATURA_STUDENT_MENU_ID) return getOrdinaturaStudentPageMeta(slug);

  if (menuId === XORIJIY_STUDENT_MENU_ID) return getXorijiyStudentPageMeta(slug);

  if (menuId === IQTIDORLI_STUDENT_MENU_ID) return getIqtidorliStudentPageMeta(slug);

  if (menuId === KLINIK_FIKRLASH_STUDENT_MENU_ID) return getKlinikFikrlashStudentPageMeta(slug);

  return {};

}



export function getStudentPdfTitleKey(menuId: number, pdfUrl?: string | null, slug?: string): string {

  if (menuId === BAKALAVRIAT_STUDENT_MENU_ID) return getBakalavriatStudentPdfTitleKey(pdfUrl, slug);

  if (menuId === MAGISTRATURA_STUDENT_MENU_ID) return getMagistraturaStudentPdfTitleKey(pdfUrl, slug);

  if (menuId === ORDINATURA_STUDENT_MENU_ID) return getOrdinaturaStudentPdfTitleKey(pdfUrl, slug);

  if (menuId === XORIJIY_STUDENT_MENU_ID) return getXorijiyStudentPdfTitleKey(pdfUrl, slug);

  if (menuId === IQTIDORLI_STUDENT_MENU_ID) return getIqtidorliStudentPdfTitleKey(pdfUrl, slug);

  if (menuId === KLINIK_FIKRLASH_STUDENT_MENU_ID) return getKlinikFikrlashStudentPdfTitleKey(pdfUrl, slug);

  return "admission.downloadPdf";

}



export function getStudentExternalCta(menuId: number, slug?: string): { url: string; labelKey: string } | null {

  if (menuId === BAKALAVRIAT_STUDENT_MENU_ID) return getBakalavriatStudentExternalCta(slug);

  return null;

}



export function isStudentConfiguredPage(menuId: number, slug?: string): boolean {

  return getStudentHeroConfig(menuId, slug) !== null;

}


