import { decodeAndCleanCmsText, normalizeCmsOrthography } from "@/lib/normalizeCmsText";

export interface ConferenceItem {
  url: string;
  title: string;
  isPdf: boolean;
  year: string | null;
}

export interface ParsedConference {
  coverImage: string | null;
  items: ConferenceItem[];
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

function looksCorrupted(text: string): boolean {
  if (!text) return true;
  if (/[\u0080-\u009f]/.test(text)) return true;
  if ((text.match(/\?/g)?.length ?? 0) >= 3) return true;
  if (/[���]/.test(text)) return true;
  const letters = text.replace(/[^A-Za-zА-Яа-яЁёO'ʻʼ`'’\-]/g, "");
  return letters.length < Math.min(8, text.length * 0.35);
}

function titleFromUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(url);
    const filename = decoded.split("/").pop()?.replace(/\.pdf$/i, "") ?? "";
    return normalizeCmsOrthography(
      filename
        .replace(/[_+%0A]+/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );
  } catch {
    return "";
  }
}

function cleanTitle(raw: string, url: string): string {
  const title = decodeAndCleanCmsText(raw);
  if (!looksCorrupted(title)) return title;
  const fromUrl = titleFromUrl(url);
  return fromUrl.length > 5 ? fromUrl : title;
}

function extractYear(title: string, url: string): string | null {
  const fromTitle = title.match(/\b(20\d{2})\b/);
  if (fromTitle) return fromTitle[1];
  const fromUrl = url.match(/\b(20\d{2})\b/);
  return fromUrl ? fromUrl[1] : null;
}

/** CMS konferensiya HTML dan materiallarni ajratish */
export function parseConferenceContent(html: string): ParsedConference {
  if (!html?.trim()) return { coverImage: null, items: [] };

  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const coverImage = imgMatch?.[1] ?? null;

  const items: ConferenceItem[] = [];
  const seen = new Set<string>();
  const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRe.exec(html)) !== null) {
    const url = match[1].trim();
    if (!url || url.startsWith("#") || /^javascript:/i.test(url)) continue;

    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const rawTitle = decodeAndCleanCmsText(match[2]);
    if (rawTitle.length < 6) continue;

    const title = cleanTitle(rawTitle, url);
    items.push({
      url,
      title,
      isPdf: isPdfUrl(url),
      year: extractYear(title, url),
    });
  }

  return { coverImage, items };
}
