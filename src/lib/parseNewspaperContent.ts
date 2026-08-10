import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface NewspaperIssue {
  url: string;
  label: string;
  date: string | null;
  issueNo: string | null;
}

export interface ParsedNewspaper {
  coverImage: string | null;
  issues: NewspaperIssue[];
}

function stripTags(html: string): string {
  return decodeAndCleanCmsText(html);
}

function extractDate(label: string): string | null {
  const match = label.match(/(\d{2}\.\d{2}\.\d{4})\s*$/);
  return match ? match[1] : null;
}

function extractIssueNo(url: string): string | null {
  try {
    const decoded = decodeURIComponent(url);
    const match = decoded.match(/№\s*\(?(\d+)\)?/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/** CMS gazeta HTML dan muqova va PDF sonlarini ajratish */
export function parseNewspaperContent(html: string): ParsedNewspaper {
  if (!html?.trim()) return { coverImage: null, issues: [] };

  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const coverImage = imgMatch?.[1] ?? null;

  const issues: NewspaperIssue[] = [];
  const seen = new Set<string>();
  const linkRe = /<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(html)) !== null) {
    const url = match[1].trim();
    const label = stripTags(match[2]);
    if (!url || !label) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    issues.push({
      url,
      label,
      date: extractDate(label),
      issueNo: extractIssueNo(url),
    });
  }

  return { coverImage, issues };
}
