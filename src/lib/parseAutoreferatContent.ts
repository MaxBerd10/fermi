import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import { normalizeDoctorateAssetUrl } from "@/lib/parseDoctorateContent";

export interface AutoreferatEntry {
  council: string;
  author: string;
  topic: string;
  url: string;
}

function stripTags(html: string): string {
  return decodeAndCleanCmsText(html.replace(/<[^>]+>/g, " "));
}

function isCouncilLine(text: string): boolean {
  return /ILMIY KENGASH|ILMIY DARAJALAR|FARG[''`’]?ONA JAMOAT/i.test(text);
}

function isAuthorLine(text: string): boolean {
  return (
    text.length >= 6 &&
    text.length <= 80 &&
    text === text.toUpperCase() &&
    /[A-Z]/.test(text) &&
    !isCouncilLine(text)
  );
}

export function parseAutoreferatContent(html: string): AutoreferatEntry[] {
  if (!html?.trim()) return [];

  const blocks = html.split(/<hr\b[^>]*>/i);
  const entries: AutoreferatEntry[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const byUrl = new Map<string, string[]>();
    let match: RegExpExecArray | null;

    while ((match = linkRe.exec(block)) !== null) {
      const url = match[1].trim();
      const text = stripTags(match[2]).trim();
      if (!url || !text) continue;
      const list = byUrl.get(url) ?? [];
      if (!list.includes(text)) list.push(text);
      byUrl.set(url, list);
    }

    for (const [url, texts] of byUrl) {
      if (seen.has(url)) continue;
      seen.add(url);

      const council = texts.find(isCouncilLine) ?? "";
      const author = texts.find(isAuthorLine) ?? texts.find((t) => !isCouncilLine(t) && t.length < 80) ?? "";
      const topic =
        texts.find((t) => t !== council && t !== author && t.length > 12) ??
        texts.find((t) => t !== council && t !== author) ??
        "";

      if (!author && !topic) continue;
      const normalizedUrl = normalizeDoctorateAssetUrl(url) ?? url;
      entries.push({ council, author, topic, url: normalizedUrl });
    }
  }

  return entries;
}
