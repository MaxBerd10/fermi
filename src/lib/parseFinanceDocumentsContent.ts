import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import {
  parseScienceDocumentsContent,
  type ParsedScienceDocuments,
  type ScienceDocument,
} from "@/lib/parseScienceDocumentsContent";

export interface FinanceDocument extends ScienceDocument {
  isExcel: boolean;
}

export interface ParsedFinanceDocuments extends Omit<ParsedScienceDocuments, "documents"> {
  documents: FinanceDocument[];
}

function cleanFinanceTitle(raw: string): string {
  return decodeAndCleanCmsText(
    raw
      .replace(/yuklab\s*olish\s*uchun\s*bosing\s*>+/gi, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function fileKind(url: string): { isPdf: boolean; isExcel: boolean } {
  return {
    isPdf: /\.pdf(\?|$)/i.test(url),
    isExcel: /\.xlsx?(\?|$)/i.test(url),
  };
}

export function parseFinanceDocumentsContent(html: string): ParsedFinanceDocuments {
  const parsed = parseScienceDocumentsContent(html);
  const documents: FinanceDocument[] = [];
  const seen = new Set<string>();

  for (const doc of parsed.documents) {
    const title = cleanFinanceTitle(doc.title);
    if (!title || title.length < 2) continue;
    const key = doc.url.toLowerCase();
    const existing = documents.find((d) => d.url.toLowerCase() === key);
    if (existing) {
      if (title.length >= 2 && !existing.title.toLowerCase().includes(title.toLowerCase())) {
        existing.title = `${existing.title} — ${title}`;
      }
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    const kind = fileKind(doc.url);
    documents.push({ url: doc.url, title, ...kind });
  }

  if (documents.length === 0) {
    const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(html)) !== null) {
      const url = match[1].trim();
      let title = cleanFinanceTitle(match[2].replace(/<[^>]+>/g, " "));
      if (!title || title.length < 2) {
        const before = html.slice(Math.max(0, match.index - 120), match.index);
        const tail = before.replace(/yuklab\s*olish[^<]*/gi, "").replace(/<[^>]+>/g, " ");
        title = cleanFinanceTitle(tail);
      }
      if (!url || !title || title.length < 2) continue;
      const key = url.toLowerCase();
      const existing = documents.find((d) => d.url.toLowerCase() === key);
      if (existing) {
        if (!existing.title.toLowerCase().includes(title.toLowerCase())) {
          existing.title = `${existing.title} — ${title}`;
        }
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      documents.push({ url, title, ...fileKind(url) });
    }
  }

  return { ...parsed, documents };
}

export function isFinanceSpreadsheet(url: string): boolean {
  return /\.xlsx?(\?|$)/i.test(url);
}
