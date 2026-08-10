import { decodeAndCleanCmsText, normalizeCmsOrthography } from "@/lib/normalizeCmsText";
import { resolveNewsImageUrl } from "@/lib/newsImages";

export interface KongressDocument {
  url: string;
  title: string;
  year: string | null;
}

export interface KongressVideo {
  embedUrl: string;
}

export interface KongressEventBlock {
  id: string;
  titleKey: string;
  year: string | null;
  bannerImage: string | null;
  galleryImages: string[];
  videos: KongressVideo[];
  documents: KongressDocument[];
}

export interface ParsedKongress {
  heroImage: string | null;
  blocks: KongressEventBlock[];
  featuredDocument: KongressDocument | null;
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

function extractYear(text: string, url: string): string | null {
  const fromText = text.match(/\b(20\d{2})\b/);
  if (fromText) return fromText[1];
  const fromUrl = url.match(/\b(20\d{2})\b/);
  return fromUrl ? fromUrl[1] : null;
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

function cleanDocTitle(raw: string, url: string): string {
  const title = decodeAndCleanCmsText(raw.replace(/<[^>]*>/g, " "));
  if (title.length >= 8) return title;
  const fromUrl = titleFromUrl(url);
  return fromUrl.length > 5 ? fromUrl : title || url.split("/").pop() || "";
}

function extractImages(segment: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(segment)) !== null) {
    const src = resolveNewsImageUrl(match[1].trim());
    if (!src || seen.has(src)) continue;
    seen.add(src);
    images.push(src);
  }

  return images;
}

function extractVideos(segment: string): KongressVideo[] {
  const videos: KongressVideo[] = [];
  const seen = new Set<string>();
  const re = /<iframe[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(segment)) !== null) {
    const embedUrl = match[1].trim();
    if (!embedUrl || seen.has(embedUrl)) continue;
    seen.add(embedUrl);
    videos.push({ embedUrl });
  }

  return videos;
}

function extractDocuments(segment: string): KongressDocument[] {
  const docs: KongressDocument[] = [];
  const seen = new Set<string>();
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(segment)) !== null) {
    const url = match[1].trim();
    if (!isPdfUrl(url)) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const title = cleanDocTitle(match[2], url);
    docs.push({ url, title, year: extractYear(title, url) });
  }

  return docs;
}

function detectBlockMeta(segment: string, index: number): { id: string; titleKey: string; year: string | null } {
  const lower = segment.toLowerCase();

  if (/dermatolog|dermo|2024/.test(lower)) {
    return { id: "dermatology-2024", titleKey: "kongress.block.dermatology2024", year: "2024" };
  }
  if (/kongress-2022|taklifnoma|participants|dermatovenerology/.test(lower)) {
    return { id: "kongress-2022", titleKey: "kongress.block.kongress2022", year: "2022" };
  }
  if (/zoom|инф_письмо|программ|2022г/.test(lower)) {
    return { id: "materials-2022", titleKey: "kongress.block.materials2022", year: "2022" };
  }

  return {
    id: `block-${index}`,
    titleKey: index === 0 ? "kongress.block.main" : "kongress.block.archive",
    year: extractYear(segment, segment),
  };
}

function parseSegment(segment: string, index: number): KongressEventBlock {
  const meta = detectBlockMeta(segment, index);
  const images = extractImages(segment);
  const [bannerImage, ...galleryImages] = images;

  return {
    id: meta.id,
    titleKey: meta.titleKey,
    year: meta.year,
    bannerImage: bannerImage ?? null,
    galleryImages,
    videos: extractVideos(segment),
    documents: extractDocuments(segment),
  };
}

/** CMS Kongress HTML dan tadbir bloklari, videolar va hujjatlarni ajratish */
export function parseKongressContent(html: string, primaryPdfUrl?: string | null): ParsedKongress {
  if (!html?.trim()) {
    return {
      heroImage: null,
      blocks: [],
      featuredDocument: primaryPdfUrl
        ? { url: primaryPdfUrl, title: "", year: extractYear("", primaryPdfUrl) }
        : null,
    };
  }

  const segments = html
    .split(/<hr\s*\/?>/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const blocks = segments.map((segment, index) => parseSegment(segment, index));
  const heroImage = blocks[0]?.bannerImage ?? extractImages(html)[0] ?? null;

  let featuredDocument: KongressDocument | null = null;
  if (primaryPdfUrl) {
    const allDocs = blocks.flatMap((b) => b.documents);
    const existing = allDocs.find((d) => d.url === primaryPdfUrl);
    featuredDocument = existing ?? {
      url: primaryPdfUrl,
      title: "",
      year: extractYear("", primaryPdfUrl),
    };
  }

  return { heroImage, blocks, featuredDocument };
}
