import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface CouncilDecisionItem {
  title: string;
  url?: string;
  isPdf: boolean;
}

export interface ParsedCouncilDecisions {
  coverImage: string | null;
  items: CouncilDecisionItem[];
}

function stripTags(html: string): string {
  return decodeAndCleanCmsText(html.replace(/<[^>]+>/g, " "));
}

const RESTRICTED_RE = /ushbu sahifani ko[''`’]?rish faqat ro[''`’]?yxatdan o[''`’]?tgan/i;

export function parseCouncilDecisionsContent(html: string): ParsedCouncilDecisions {
  if (!html?.trim()) return { coverImage: null, items: [] };

  const coverImage = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
  const items: CouncilDecisionItem[] = [];
  const seen = new Set<string>();

  const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(html)) !== null) {
    const url = match[1].trim();
    const title = stripTags(match[2]).trim();
    if (!title || RESTRICTED_RE.test(title)) continue;
    if (!/kengash|bayon|qaror/i.test(title)) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ title, url, isPdf: /\.pdf(\?|$)/i.test(url) });
  }

  const textOnly = stripTags(html.replace(/<a[\s\S]*?<\/a>/gi, " "));
  textOnly.split(/\n+/).forEach((line) => {
    const t = line.trim();
    if (t.length < 8 || RESTRICTED_RE.test(t)) return;
    if (!/kengash|bayon|qaror/i.test(t)) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ title: t, isPdf: false });
  });

  return { coverImage, items };
}
