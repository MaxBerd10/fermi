import { normalizeCmsOrthography } from "@/lib/normalizeCmsText";
import { stripHtml } from "@/lib/html";

export function displayLeaderText(value: string): string {
  return normalizeCmsOrthography(value.replace(/`/g, "'").replace(/\s+/g, " ").trim());
}

/** CMS activity/biography — faqat bo'sh HTML (&nbsp;, teglar) bo'lmasa true */
export function hasLeaderHtmlContent(html: string | null | undefined): boolean {
  if (!html?.trim()) return false;
  return Boolean(stripHtml(html));
}

export function cleanPhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function getLeaderRoleKey(position: string): string | null {
  const p = position.toLowerCase();
  if (/o[''`]?quv|oquv ishlar/.test(p)) return "leader.role.education";
  if (/ilmiy|innovatsiya/.test(p)) return "leader.role.science";
  if (/davolash|klinik/.test(p)) return "leader.role.clinical";
  if (/yoshlar|ma.naviy|marifiy/.test(p)) return "leader.role.youth";
  if (/ishlar boshqarmasi|boshlig/.test(p)) return "leader.role.admin";
  if (/kafedra/.test(p)) return "leader.role.departmentHead";
  return "leader.role.prorector";
}

export type LeaderRoleTone = "education" | "science" | "clinical" | "youth" | "admin" | "department" | "default";

export function getLeaderRoleTone(position: string): LeaderRoleTone {
  const p = position.toLowerCase();
  if (/o[''`]?quv|oquv ishlar/.test(p)) return "education";
  if (/ilmiy|innovatsiya/.test(p)) return "science";
  if (/davolash|klinik/.test(p)) return "clinical";
  if (/yoshlar|ma.naviy|marifiy/.test(p)) return "youth";
  if (/ishlar boshqarmasi|boshlig/.test(p)) return "admin";
  if (/kafedra/.test(p)) return "department";
  return "default";
}

export function getDepartmentLabel(position: string): string {
  const cleaned = displayLeaderText(position);
  const match = cleaned.match(/^(.+?)\s+kafedrasi\s+mudir/i);
  if (match) return match[1].trim();
  if (/kafedrasi mudir/i.test(cleaned)) {
    return cleaned.replace(/\s*kafedrasi\s*mudir.*$/i, "").trim();
  }
  return cleaned;
}

/** CMS da hali to'ldirilmagan rahbar yozuvi */
export function isPlaceholderLeaderName(name: string): boolean {
  const normalized = displayLeaderText(name).toLowerCase();
  return (
    /ma[''`]?lumot to[''`]?ldirilmoqda/.test(normalized) ||
    /заполняется/.test(normalized) ||
    /being updated/.test(normalized)
  );
}
