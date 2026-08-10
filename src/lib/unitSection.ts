export const UNIT_MENU_ID = 75;
export const FINANCE_UNIT_MENU_ID = 316;
export const CENTER_UNIT_MENU_ID = 322;
export const SCIENCE_EDU_MENU_ID = 329;
export const TEXNIKUM_MENU_ID = 337;
export const CAREER_MENU_ID = 367;
export const PRESS_MENU_ID = 514;
export const REGISTRAR_MENU_ID = 530;

export const UNIT_MENU_IDS = [
  UNIT_MENU_ID,
  FINANCE_UNIT_MENU_ID,
  CENTER_UNIT_MENU_ID,
  SCIENCE_EDU_MENU_ID,
  TEXNIKUM_MENU_ID,
  CAREER_MENU_ID,
  PRESS_MENU_ID,
  REGISTRAR_MENU_ID,
] as const;

export type UnitTheme =
  | "admin"
  | "hr"
  | "tech"
  | "youth"
  | "records"
  | "compliance"
  | "accounting"
  | "marketing"
  | "planning"
  | "digital"
  | "library"
  | "youthUnion"
  | "women"
  | "quality"
  | "academic"
  | "graduate"
  | "international"
  | "research"
  | "talent"
  | "texnikum"
  | "career"
  | "press"
  | "registrar";

export interface UnitPageConfig {
  theme: UnitTheme;
  introKey: string;
  eyebrowKey: string;
  accent?: string;
  headTitleKey?: string;
  headBadgeKey?: string;
  aboutTitleKey?: string;
  downloadDocKey?: string;
  contentVariant?: "faq" | "contacts" | "documents";
  showAllLeaders?: boolean;
}

const TEXNIKUM_BASE: Pick<
  UnitPageConfig,
  "theme" | "eyebrowKey" | "headTitleKey" | "headBadgeKey" | "aboutTitleKey" | "downloadDocKey"
> = {
  theme: "texnikum",
  eyebrowKey: "nav.section.texnikum",
  headTitleKey: "unit.texnikumDirectorTitle",
  headBadgeKey: "unit.texnikumDirectorBadge",
  aboutTitleKey: "unit.texnikumAboutTitle",
  downloadDocKey: "unit.downloadTexnikumDoc",
};

const CAREER_BASE: Pick<UnitPageConfig, "theme" | "eyebrowKey" | "aboutTitleKey" | "downloadDocKey"> = {
  theme: "career",
  eyebrowKey: "nav.section.karyera",
  aboutTitleKey: "unit.careerContentTitle",
  downloadDocKey: "unit.downloadCareerDoc",
};

const PRESS_BASE: Pick<
  UnitPageConfig,
  "theme" | "eyebrowKey" | "headTitleKey" | "headBadgeKey" | "aboutTitleKey" | "downloadDocKey"
> = {
  theme: "press",
  eyebrowKey: "nav.section.matbuot",
  headTitleKey: "unit.pressHeadTitle",
  headBadgeKey: "unit.pressHeadBadge",
  aboutTitleKey: "unit.pressAboutTitle",
  downloadDocKey: "unit.downloadPressDoc",
};

const REGISTRAR_BASE: Pick<
  UnitPageConfig,
  "theme" | "eyebrowKey" | "headTitleKey" | "headBadgeKey" | "aboutTitleKey" | "downloadDocKey" | "showAllLeaders"
> = {
  theme: "registrar",
  eyebrowKey: "nav.section.registrator",
  headTitleKey: "unit.registrarTeamTitle",
  headBadgeKey: "unit.registrarHeadBadge",
  aboutTitleKey: "unit.registrarAboutTitle",
  downloadDocKey: "unit.downloadRegistrarDoc",
  showAllLeaders: true,
};

export const UNIT_PAGE_CONFIG: Record<string, UnitPageConfig> = {
  "jismoniy-va-yuridik-shaxslarning-murojaatlari-bilan-ishlash-nazorat-va-monitoring-bolimi": {
    theme: "admin",
    introKey: "unit.intro.murojaat",
    eyebrowKey: "nav.section.bolimlar",
  },
  "xodimlar-bolimi": {
    theme: "hr",
    introKey: "unit.intro.xodimlar",
    eyebrowKey: "nav.section.bolimlar",
  },
  "oqitishning-texnik-vositalar-bolimi": {
    theme: "tech",
    introKey: "unit.intro.texnik",
    eyebrowKey: "nav.section.bolimlar",
  },
  "yoshlar-bilan-ishlash-manaviyat-va-marifat-bolimi": {
    theme: "youth",
    introKey: "unit.intro.yoshlar",
    eyebrowKey: "nav.section.bolimlar",
  },
  "devonxona-bolimi": {
    theme: "records",
    introKey: "unit.intro.devonxona",
    eyebrowKey: "nav.section.bolimlar",
  },
  "korrupsiyaga-qarshi-kurashish-komplayens-nazorat-tizimini-boshqarish-bolimi": {
    theme: "compliance",
    introKey: "unit.intro.komplayens",
    eyebrowKey: "nav.section.bolimlar",
  },
  "buxgalteriya-bolimi": {
    theme: "accounting",
    introKey: "unit.intro.buxgalteriya",
    eyebrowKey: "nav.section.moliya",
  },
  "marketing-va-talabalar-amaliyoti-bolimi": {
    theme: "marketing",
    introKey: "unit.intro.marketing",
    eyebrowKey: "nav.section.moliya",
  },
  "reja-moliya-bolimi": {
    theme: "planning",
    introKey: "unit.intro.rejaMoliya",
    eyebrowKey: "nav.section.moliya",
  },
  "raqamli-talim-texnologiyalari-markazi": {
    theme: "digital",
    introKey: "unit.intro.rttm",
    eyebrowKey: "nav.section.markazlar",
    headTitleKey: "unit.centerHeadTitle",
    headBadgeKey: "unit.centerHeadBadge",
    aboutTitleKey: "unit.centerAboutTitle",
  },
  "axborot-resurs-markazi": {
    theme: "library",
    introKey: "unit.intro.arm",
    eyebrowKey: "nav.section.markazlar",
    headTitleKey: "unit.centerHeadTitle",
    headBadgeKey: "unit.centerHeadBadge",
    aboutTitleKey: "unit.centerAboutTitle",
  },
  "yoshlar-ittifoqi-bt": {
    theme: "youthUnion",
    introKey: "unit.intro.yoshlarIttifoqi",
    eyebrowKey: "nav.section.markazlar",
    headTitleKey: "unit.youthLeaderTitle",
    headBadgeKey: "unit.youthLeaderBadge",
    aboutTitleKey: "unit.centerAboutTitle",
  },
  "xotin-qizlar-qomitasi": {
    theme: "women",
    introKey: "unit.intro.xotinQizlar",
    eyebrowKey: "nav.section.markazlar",
    headTitleKey: "unit.womenChairTitle",
    headBadgeKey: "unit.womenChairBadge",
    aboutTitleKey: "unit.committeeAboutTitle",
  },
  "talim-sifatini-nazorat-qilish-bolimi": {
    theme: "quality",
    introKey: "unit.intro.talimSifati",
    eyebrowKey: "nav.section.ilmiyOquv",
  },
  "oquv-uslubiy-boshqarma": {
    theme: "academic",
    introKey: "unit.intro.oquvUslubiy",
    eyebrowKey: "nav.section.ilmiyOquv",
    headTitleKey: "unit.boshqarmaHeadTitle",
    headBadgeKey: "unit.boshqarmaHeadBadge",
    aboutTitleKey: "unit.boshqarmaAboutTitle",
  },
  "magistratura-bolimi": {
    theme: "graduate",
    introKey: "unit.intro.magistratura",
    eyebrowKey: "nav.section.ilmiyOquv",
  },
  "xalqaro-hamkorlik-bolimi": {
    theme: "international",
    introKey: "unit.intro.xalqaroHamkorlik",
    eyebrowKey: "nav.section.ilmiyOquv",
  },
  "ilmiy-tadqiqotlar-innovatsiyalar-va-ilmiy-pedagog-kadrlar-tayyorlash-bolimi": {
    theme: "research",
    introKey: "unit.intro.ilmiyTadqiqot",
    eyebrowKey: "nav.section.ilmiyOquv",
  },
  "iqtidorli-talabalarning-ilmiy-tadqiqot-faoliyatini-tashkil-etish-bolimi": {
    theme: "talent",
    introKey: "unit.intro.iqtidorliTalaba",
    eyebrowKey: "nav.section.ilmiyOquv",
  },
  "fargona-shahar-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-fergana-city",
    introKey: "unit.intro.texnikum.ferganaCity",
  },
  "1-margilon-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-margilan-1",
    introKey: "unit.intro.texnikum.margilan1",
  },
  "2-margilon-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-margilan-2",
    introKey: "unit.intro.texnikum.margilan2",
  },
  "qoqon-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-qoqon",
    introKey: "unit.intro.texnikum.qoqon",
  },
  "quva-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-quva",
    introKey: "unit.intro.texnikum.quva",
  },
  "buvayda-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-buvayda",
    introKey: "unit.intro.texnikum.buvayda",
  },
  "fargona-tumani-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-fergana-district",
    introKey: "unit.intro.texnikum.ferganaDistrict",
  },
  "rishton-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-rishton",
    introKey: "unit.intro.texnikum.rishton",
  },
  "beshariq-abu-ali-ibn-sino-nomidagi-jamoat-salomatligi-texnikumi": {
    ...TEXNIKUM_BASE,
    accent: "tx-beshariq",
    introKey: "unit.intro.texnikum.beshariq",
  },
  "markaz-xaqida": {
    ...CAREER_BASE,
    accent: "cr-about",
    introKey: "unit.intro.career.about",
    aboutTitleKey: "unit.careerAboutTitle",
  },
  "meyoriy-hujjatlar": {
    ...CAREER_BASE,
    accent: "cr-docs",
    introKey: "unit.intro.career.docs",
    aboutTitleKey: "unit.careerDocsTitle",
    contentVariant: "documents",
  },
  "hududiy-boshqarmalar": {
    ...CAREER_BASE,
    accent: "cr-regions",
    introKey: "unit.intro.career.regions",
    aboutTitleKey: "unit.careerRegionsTitle",
    contentVariant: "contacts",
  },
  "bitiruvchilar": {
    ...CAREER_BASE,
    accent: "cr-graduates",
    introKey: "unit.intro.career.graduates",
    aboutTitleKey: "unit.careerGraduatesTitle",
  },
  "bilim-yurtlari": {
    ...CAREER_BASE,
    accent: "cr-schools",
    introKey: "unit.intro.career.schools",
    aboutTitleKey: "unit.careerSchoolsTitle",
    contentVariant: "contacts",
  },
  "ishga-joylashish-uchun-hujjatlari": {
    ...CAREER_BASE,
    accent: "cr-employment",
    introKey: "unit.intro.career.employment",
    aboutTitleKey: "unit.careerEmploymentTitle",
  },
  "eng-kop-beriladigan-savollar": {
    ...CAREER_BASE,
    accent: "cr-faq",
    introKey: "unit.intro.career.faq",
    aboutTitleKey: "unit.careerFaqTitle",
    contentVariant: "faq",
  },
  "ish-beruvchilarning-institut-bitiruvchilari-xaqida-fikri": {
    ...CAREER_BASE,
    accent: "cr-employers",
    introKey: "unit.intro.career.employers",
    aboutTitleKey: "unit.careerEmployersTitle",
  },
  "karyera-kuni": {
    ...CAREER_BASE,
    accent: "cr-event",
    introKey: "unit.intro.career.event",
    aboutTitleKey: "unit.careerEventTitle",
  },
  "shartnomalar-namunasi-2": {
    ...CAREER_BASE,
    accent: "cr-contracts",
    introKey: "unit.intro.career.contracts",
    aboutTitleKey: "unit.careerContractsTitle",
  },
  "matbuot-kotibi": {
    ...PRESS_BASE,
    accent: "press-main",
    introKey: "unit.intro.matbuot",
  },
  "registrator-ofisi": {
    ...REGISTRAR_BASE,
    accent: "registrar-main",
    introKey: "unit.intro.registrator",
  },
};

export function getUnitPageConfig(slug: string, menuId?: number): UnitPageConfig {
  if (UNIT_PAGE_CONFIG[slug]) return UNIT_PAGE_CONFIG[slug];

  if (menuId === FINANCE_UNIT_MENU_ID) {
    return {
      theme: "planning",
      introKey: "section.intro.moliya",
      eyebrowKey: "nav.section.moliya",
    };
  }

  if (menuId === CENTER_UNIT_MENU_ID) {
    return {
      theme: "library",
      introKey: "section.intro.markazlar",
      eyebrowKey: "nav.section.markazlar",
      headTitleKey: "unit.centerHeadTitle",
      headBadgeKey: "unit.centerHeadBadge",
      aboutTitleKey: "unit.centerAboutTitle",
    };
  }

  if (menuId === SCIENCE_EDU_MENU_ID) {
    return {
      theme: "academic",
      introKey: "section.intro.ilmiyOquv",
      eyebrowKey: "nav.section.ilmiyOquv",
    };
  }

  if (menuId === TEXNIKUM_MENU_ID) {
    return {
      ...TEXNIKUM_BASE,
      introKey: "section.intro.texnikum",
    };
  }

  if (menuId === CAREER_MENU_ID) {
    return {
      ...CAREER_BASE,
      introKey: "section.intro.karyera",
    };
  }

  if (menuId === PRESS_MENU_ID) {
    return {
      ...PRESS_BASE,
      introKey: "section.intro.matbuot",
    };
  }

  if (menuId === REGISTRAR_MENU_ID) {
    return {
      ...REGISTRAR_BASE,
      introKey: "section.intro.registrator",
    };
  }

  return {
    theme: "admin",
    introKey: "section.intro.bolimlar",
    eyebrowKey: "nav.section.bolimlar",
  };
}

export function isUnitSectionPage(menuId?: number): boolean {
  return (
    menuId === UNIT_MENU_ID ||
    menuId === FINANCE_UNIT_MENU_ID ||
    menuId === CENTER_UNIT_MENU_ID ||
    menuId === SCIENCE_EDU_MENU_ID ||
    menuId === TEXNIKUM_MENU_ID ||
    menuId === CAREER_MENU_ID ||
    menuId === PRESS_MENU_ID ||
    menuId === REGISTRAR_MENU_ID
  );
}
