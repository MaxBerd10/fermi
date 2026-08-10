import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface ScienceDocument {
  url: string;
  title: string;
  isPdf: boolean;
}

export interface ParsedScienceDocuments {
  coverImage: string | null;
  preamble: string[];
  documents: ScienceDocument[];
}

function stripTags(html: string): string {
  return decodeAndCleanCmsText(html.replace(/<[^>]+>/g, " "));
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

export function parseScienceDocumentsContent(html: string): ParsedScienceDocuments {
  if (!html?.trim()) return { coverImage: null, preamble: [], documents: [] };

  const coverImage = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
  const documents: ScienceDocument[] = [];
  const seen = new Set<string>();
  const preamble: string[] = [];

  const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(html)) !== null) {
    const url = match[1].trim();
    const title = stripTags(match[2]).trim();
    if (!url || !title || title.length < 4) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    documents.push({ url, title, isPdf: isPdfUrl(url) });
  }

  const htmlWithoutLinks = html.replace(/<a[\s\S]*?<\/a>/gi, "");
  htmlWithoutLinks
    .replace(/<hr\b[^>]*>/gi, "\n")
    .split(/<\/?(?:p|div|h[1-6])[^>]*>/gi)
    .map((chunk) => stripTags(chunk).trim())
    .filter((text) => text.length > 40 && !/^https?:\/\//i.test(text))
    .forEach((text) => {
      if (!preamble.includes(text)) preamble.push(text);
    });

  return { coverImage, preamble, documents };
}
