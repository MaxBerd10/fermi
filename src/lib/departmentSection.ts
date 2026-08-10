import type { Leader } from "@/types/content";
import { displayLeaderText } from "@/lib/leaderDisplay";

export const DEPARTMENT_MENU_ID = 38;
export const DEPARTMENT_LEADERS_MENU_ID = 35;
export const DEPARTMENT_LEADERS_SLUG = "kafedra-mudirlari";

export type DepartmentTheme =
  | "preventive"
  | "basic"
  | "clinical"
  | "social"
  | "tech"
  | "nursing";

/** Slugs that currently 500 on GET /departments/{slug} — use list + leader fallback */
export const DEPARTMENT_API_BROKEN_SLUGS = new Set([
  "normal-anatomiya-kafedrasi",
  "umumiy-jarrohlik-kafedrasi",
  "urologiya-va-onkologiya-kafedrasi",
  "tibbiy-va-biologik-kimyo-kafedrasi",
]);

/** Keywords matched against leader.position (normalized) */
export const DEPARTMENT_LEADER_MATCH: Record<string, string[]> = {
  "kommunal-va-mehnat-gigienasi-kafedrasi": ["kommunal va mehnat gigienasi"],
  "ovqatlanish-bolalar-va-osmirlar-gigienasi-kafedrasi": ["ovqatlanish", "bolalar va o", "osmirlar gigiyena"],
  "preventiv-tibbiyot-asoslari-jamoat-salomatligi-jismoniy-tarbiya-va-sport-kafedrasi": ["preventiv tibbiyot asoslari"],
  "epidemiologiya-va-yuqumli-kasalliklar-hamshiralik-ishi-kafedrasi": ["epidemiologiya va yuqumli"],
  "mikrobiologiya-virusologiya-va-immunologiya-kafedrasi": ["mikrobiologiya", "virusologiya"],
  "xalq-tabobati-va-farmakologiya-kafedrasi": ["xalqa tabobati", "xalq tabobati", "farmakologiya"],
  "biotibbiyot-muhandisligi-biofizikia-va-axborot-texnologiyalar-kafedrasi": ["biotibbiyot muhandisligi", "biofizika"],
  "ichki-kasalliklar-propedevtikasi-kafedrasi": ["ichki kasalliklar propedevtikasi"],
  "terapiya-yonalishidagi-fanlar-kafedrasi": ["terapiya yo'nalishidagi", "terapiya yonalishidagi"],
  "travmatologiya-va-ortopediya-kafedrasi": ["travmatologiya va ortopediya"],
  "normal-anatomiya-kafedrasi": ["normal anatomiya"],
  "gospital-terapiya-laboratoriya-kafedrasi": ["gospital terapiya (laboratoriya)", "gospital terapiya"],
  "umumiy-jarrohlik-kafedrasi": ["umumiy jarrohlik"],
  "fakultet-va-gospital-jarrohlik-kafedrasi": ["fakultet va gospital jarrohlik", "gospital jarrohlik"],
  "akusherlik-va-ginekologiya-kafedrasi": ["akusher va ginekologiya", "akusherlik va ginekologiya"],
  "urologiya-va-onkologiya-kafedrasi": ["urologiya va onkologiya"],
  "nevrologiya-va-psixiatriya-kafedrasi": ["nevrologiya va psixatriya", "nevrologiya va psixiatriya"],
  "pediatriya-kafedrasi": ["pediatriya kafedrasi mudiri", "pediatriya kafedrasi mud"],
  "pediatriya-kafedrasi-2": ["pediatriya-2", "pediatriya 2"],
  "stomatologiya-va-otorinolaringologiya-kafedrasi": ["stomatologiya va otoloringologiya", "stomatologiya va otorinolaringologiya"],
  "dermatovenerologiya-va-allergologiya-kafedrasi": ["dermatovenerologiya va allergologiya"],
  "endokrinologiya-gemotologiya-va-ftiziatriya-kafedrasi": ["endokrinologiya", "gematologiya", "ftizatriya"],
  "ozbek-va-xorijiy-tillar-kafedrasi": ["o`zbek va xorijiy tillar", "o'zbek va xorijiy tillar", "ozbek va xorijiy"],
  "lotin-tili-pedagogika-va-psixologiya": ["lotin tili", "pedagogika va psixologiya"],
  "tibbiy-va-biologik-kimyo-kafedrasi": ["tibbiy va biologik kimyo"],
  "ijtimoiy-fanlar-kafedrasi": ["ijtimoiy fanlar"],
  "fiziologiya-kafedrasi": ["fiziologiya kafedrasi mudiri"],
  "patologik-fiziologiya-va-patologik-anatomiya-kafedrasi": ["patologik fiziologiya va patologik anatomiya"],
  "gistologiya-va-biologiya-kafedrasi": ["gistologiya va biologiya"],
};

function normalizeMatchText(value: string): string {
  return displayLeaderText(value)
    .toLowerCase()
    .replace(/[`']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchDepartmentLeader(slug: string, leaders: Leader[]): Leader | null {
  const keywords = DEPARTMENT_LEADER_MATCH[slug];
  if (!keywords?.length) return null;

  const normalizedKeywords = keywords.map(normalizeMatchText);

  for (const leader of leaders) {
    const position = normalizeMatchText(leader.position);
    if (normalizedKeywords.some((kw) => position.includes(kw))) {
      return leader;
    }
  }

  return null;
}

export function getDepartmentTheme(slug: string): DepartmentTheme {
  if (/gigiyena|preventiv|epidemiologiya|jamoat-salomatligi|hamshiralik|profilaktika/.test(slug)) {
    return /hamshiralik/.test(slug) ? "nursing" : "preventive";
  }
  if (/anatomiya|gistologiya|fiziologiya|patologik|biologik-kimyo|mikrobiologiya/.test(slug)) {
    return "basic";
  }
  if (/biotibbiyot|biofizik|axborot-texnologiya/.test(slug)) return "tech";
  if (/ozbek|lotin|ijtimoiy|tillar|pedagogika|psixologiya/.test(slug)) return "social";
  return "clinical";
}

export function buildDepartmentFallbackContent(leader: Leader | null): string {
  if (!leader) return "";
  const parts: string[] = [];
  if (leader.activity?.trim()) {
    parts.push(`<h3 class="department-fallback-heading">Asosiy vazifalar</h3>${leader.activity}`);
  }
  if (leader.biography?.trim()) {
    parts.push(`<h3 class="department-fallback-heading">Tarjimai hol</h3>${leader.biography}`);
  }
  return parts.join("");
}
