import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface RegulatoryMetadataRow {
  label: string;
  value: string;
}

export interface RegulatoryDocument {
  url: string;
  title: string;
  isPdf: boolean;
}

export interface RegulatoryGroup {
  heading: string | null;
  documents: RegulatoryDocument[];
}

export interface ParsedRegulatory {
  metadata: RegulatoryMetadataRow[];
  preamble: string[];
  coverImage: string | null;
  groups: RegulatoryGroup[];
  allDocuments: RegulatoryDocument[];
}

function stripTags(html: string): string {
  return decodeAndCleanCmsText(html);
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

function parseMetadata(html: string): RegulatoryMetadataRow[] {
  const rows: RegulatoryMetadataRow[] = [];
  const scopeMatch = html.match(/<div class="article-text"[\s\S]*$/i);
  const scope = scopeMatch ? scopeMatch[0] : html;
  const divRe = /<div[^>]*>([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null;

  while ((match = divRe.exec(scope)) !== null) {
    const inner = match[1];
    if (/<a[^>]+href=/i.test(inner)) continue;

    const labelMatch = inner.match(/<strong>([^<]*?)<\/strong>\s*:?\s*(?:&nbsp;)?([\s\S]*)/i);
    if (!labelMatch) continue;

    const label = stripTags(labelMatch[1]).replace(/:$/, "").trim();
    const value = stripTags(labelMatch[2]).trim();
    if (!label || !value) continue;
    if (label.length > 48 || value.length > 120) continue;
    rows.push({ label, value });
  }

  return rows;
}

function parsePreamble(html: string): string[] {
  const lines: string[] = [];
  const classRe =
    /<div class="(?:ACCEPTING_BODY|ACT_FORM|ACT_TITLE)"[^>]*>([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null;

  while ((match = classRe.exec(html)) !== null) {
    const text = stripTags(match[1]);
    if (text.length > 3) lines.push(text);
  }

  return lines;
}

function extractDocuments(html: string): RegulatoryDocument[] {
  const docs: RegulatoryDocument[] = [];
  const seen = new Set<string>();
  const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRe.exec(html)) !== null) {
    const url = match[1].trim();
    const title = stripTags(match[2]);
    if (!url || title.length < 8) continue;
    if (url.startsWith("#") || /^javascript:/i.test(url)) continue;

    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    docs.push({ url, title, isPdf: isPdfUrl(url) });
  }

  return docs;
}

function parseGroups(html: string, allDocuments: RegulatoryDocument[]): RegulatoryGroup[] {
  const blocks = html.split(/<hr\s*\/?>/i);
  const groups: RegulatoryGroup[] = [];
  let current: RegulatoryGroup = { heading: null, documents: [] };
  const assigned = new Set<string>();

  const pushCurrent = () => {
    if (current.heading || current.documents.length > 0) {
      groups.push(current);
    }
    current = { heading: null, documents: [] };
  };

  blocks.forEach((block) => {
    const blockDocs = extractDocuments(block);
    const blockText = stripTags(block.replace(/<a[\s\S]*?<\/a>/gi, ""));

    if (blockDocs.length === 0 && blockText.length > 4 && blockText.length < 200) {
      if (current.documents.length > 0 || current.heading) pushCurrent();
      current.heading = blockText;
      return;
    }

    blockDocs.forEach((doc) => {
      if (assigned.has(doc.url)) return;
      assigned.add(doc.url);
      current.documents.push(doc);
    });
  });

  pushCurrent();

  const ungrouped = allDocuments.filter((d) => !assigned.has(d.url));
  if (ungrouped.length > 0) {
    if (groups.length === 0) {
      return [{ heading: null, documents: allDocuments }];
    }
    groups.push({ heading: null, documents: ungrouped });
  }

  if (groups.length === 0 && allDocuments.length > 0) {
    return [{ heading: null, documents: allDocuments }];
  }

  return groups.filter((g) => g.heading || g.documents.length > 0);
}

/** CMS me'yoriy hujjat HTML ni tuzilgan ko'rinishga ajratish */
export function parseRegulatoryContent(html: string): ParsedRegulatory {
  if (!html?.trim()) {
    return { metadata: [], preamble: [], coverImage: null, groups: [], allDocuments: [] };
  }

  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const coverImage = imgMatch?.[1] ?? null;
  const metadata = parseMetadata(html);
  const preamble = parsePreamble(html);
  const allDocuments = extractDocuments(html);
  const groups = parseGroups(html, allDocuments);

  return { metadata, preamble, coverImage, groups, allDocuments };
}

export function buildEducationLawTitle(metadata: RegulatoryMetadataRow[]): string | null {
  const number = metadata.find((r) => /raqam/i.test(r.label))?.value;
  const date = metadata.find((r) => /qabul qilingan/i.test(r.label))?.value;
  if (!number) return null;
  const name = metadata.find((r) => /hujjat nomi/i.test(r.label))?.value ?? "Ta'lim to'g'risida";
  return `O'zbekiston Respublikasining «${name}» qonuni (${number}${date ? `, ${date}` : ""})`;
}
