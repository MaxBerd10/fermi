import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface DoctorateStat {
  value: string;
  labelKey: string;
  icon: string;
}

export interface DoctorateSpecialty {
  code: string;
  title: string;
  url: string | null;
}

export interface DoctorateDocument {
  title: string;
  url: string;
  isPdf: boolean;
}

const INVALID_LINK_RE = /^https?:\/\/(\d{2}\.\d{2}|14\.00|03\.00)/i;

export function normalizeDoctorateAssetUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/uploads/")) return `https://api.fermi.uz${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed;
  if (INVALID_LINK_RE.test(trimmed)) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

export function toDoctorateInternalPath(url: string): string | null {
  if (url.startsWith("/blog/")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/blog/")) return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
  return null;
}

function stripText(html: string): string {
  return decodeAndCleanCmsText(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseSpecialtyFromText(text: string): { code: string; title: string } | null {
  const match = text.match(/^(\d{2}\.\d{2}(?:\.\d{2,3})?)\.?[\s-–—]+(.+)$/i);
  if (!match) return null;
  return { code: match[1], title: match[2].trim() };
}

export function parseDoctorateSpecialties(html: string): DoctorateSpecialty[] {
  const items: DoctorateSpecialty[] = [];
  const seen = new Set<string>();
  const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRe.exec(html)) !== null) {
    const rawUrl = match[1];
    const text = stripText(match[2]);
    const parsed = parseSpecialtyFromText(text);
    if (!parsed) continue;
    const key = parsed.code;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      code: parsed.code,
      title: parsed.title,
      url: normalizeDoctorateAssetUrl(rawUrl),
    });
  }

  return items.sort((a, b) => a.code.localeCompare(b.code));
}

export function parseDoctorateStats(intro: string): DoctorateStat[] {
  const stats: DoctorateStat[] = [];
  const tayanch = intro.match(/(\d+)\s*nafar\s*tayanch\s*doktorant/i);
  if (tayanch) {
    stats.push({ value: tayanch[1], labelKey: "faoliyat.doctorate.statPhdStudents", icon: "ri-user-star-line" });
  }
  const mustaqil = intro.match(/(\d+)\s*nafar\s*mustaqil\s*izlanuvchi/i);
  if (mustaqil) {
    stats.push({ value: mustaqil[1], labelKey: "faoliyat.doctorate.statResearchers", icon: "ri-user-search-line" });
  }
  const specialties = intro.match(/ixtisosliklari soni\s*(\d+)/i);
  if (specialties) {
    stats.push({ value: specialties[1], labelKey: "faoliyat.doctorate.statSpecialties", icon: "ri-bookmark-line" });
  }
  return stats;
}

export function parseDoctorateDocuments(html: string): DoctorateDocument[] {
  const docs: DoctorateDocument[] = [];
  const seen = new Set<string>();
  const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRe.exec(html)) !== null) {
    const url = normalizeDoctorateAssetUrl(match[1]);
    if (!url) continue;
    const title = stripText(match[2]);
    if (!title || title.length < 8) continue;
    if (!/\.pdf(\?|$)/i.test(url) && !/qarori|nizom/i.test(title)) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    docs.push({ title, url, isPdf: /\.pdf(\?|$)/i.test(url) });
  }

  return docs;
}

export function extractDoctorateIntro(html: string): string {
  const match = html.match(/<p[^>]*style=["'][^"']*text-align:\s*center[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  if (match) return stripText(match[1]);
  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return firstP ? stripText(firstP[1]) : "";
}

export function stripDoctorateSpecialtyBlocks(html: string): string {
  return html
    .replace(/<div>\s*<br\s*\/?>\s*<a[^>]+>[\s\S]*?<\/a>\s*<\/div>\s*(<hr\s*\/?>\s*)?<\/div>/gi, "")
    .replace(/<div>\s*<a[^>]+>[\s\S]*?\d{2}\.\d{2}[\s\S]*?<\/a>\s*(<hr\s*\/?>\s*)?<\/div>/gi, "")
    .replace(/<hr\s*\/?>\s*(<p>\s*&nbsp;\s*<\/p>)?/gi, "\n");
}
