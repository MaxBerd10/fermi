import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface PediatriyaFaoliyatDocument {
  url: string;
  title: string;
}

export interface PediatriyaFaoliyatSection {
  title: string;
  body: string;
  document?: PediatriyaFaoliyatDocument;
  icon: string;
}

export interface ParsedPediatriyaFaoliyat {
  sections: PediatriyaFaoliyatSection[];
}

function stripBlockHtml(html: string): string {
  return decodeAndCleanCmsText(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function cleanDocTitle(raw: string): string {
  return decodeAndCleanCmsText(
    raw
      .replace(/\(yuklab\s*olish\)/gi, "")
      .replace(/yuklab\s*olish/gi, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function normalizeTitle(text: string): string {
  return decodeAndCleanCmsText(text.replace(/\s+/g, " ").trim());
}

function pickIcon(title: string): string {
  const value = title.toLowerCase();
  if (value.includes("kredit") || value.includes("modul")) return "ri-stack-line";
  if (value.includes("kompetens")) return "ri-award-line";
  if (value.includes("strateg")) return "ri-road-map-line";
  if (value.includes("missiy")) return "ri-compass-3-line";
  return "ri-file-list-3-line";
}

function isSectionTitle(attrs: string, innerHtml: string, text: string): boolean {
  if (text.length < 12 || text.length > 120) return false;
  const centered = /text-align:\s*center/i.test(attrs);
  const strongOnly =
    /<strong\b/i.test(innerHtml) &&
    stripBlockHtml(innerHtml.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "$1")) === text;
  const uppercase = text === text.toUpperCase() && /[A-Z]/.test(text);
  return (centered && strongOnly) || (strongOnly && uppercase);
}

function extractDocument(innerHtml: string): PediatriyaFaoliyatDocument | undefined {
  const linkMatch = innerHtml.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
  if (!linkMatch) return undefined;
  const title = cleanDocTitle(stripBlockHtml(linkMatch[2]));
  if (!title) return undefined;
  return { url: linkMatch[1].trim(), title };
}

function extractBody(innerHtml: string): string {
  const withoutLinks = innerHtml.replace(/<a[\s\S]*?<\/a>/gi, " ");
  const text = stripBlockHtml(withoutLinks);
  return text.replace(/\s*—\s*$/, "").trim();
}

export function parsePediatriyaFaoliyatContent(html: string): ParsedPediatriyaFaoliyat {
  if (!html?.trim()) return { sections: [] };

  const sections: PediatriyaFaoliyatSection[] = [];
  const blockRe = /<(p|div)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  let pendingTitle: string | null = null;

  while ((match = blockRe.exec(html)) !== null) {
    const attrs = match[2] ?? "";
    const inner = match[3];
    const text = stripBlockHtml(inner);
    if (text.length < 2) continue;

    if (isSectionTitle(attrs, inner, text)) {
      pendingTitle = normalizeTitle(text);
      continue;
    }

    if (!pendingTitle) continue;

    const body = extractBody(inner);
    if (!body) continue;

    sections.push({
      title: pendingTitle,
      body,
      document: extractDocument(inner),
      icon: pickIcon(pendingTitle),
    });
    pendingTitle = null;
  }

  return { sections };
}
