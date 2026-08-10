import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface StudentDocumentLink {
  url: string;
  title: string;
  isPdf: boolean;
  isArchive: boolean;
}

export interface StudentDocumentGroup {
  heading: string;
  documents: StudentDocumentLink[];
}

function cleanText(value: string): string {
  return decodeAndCleanCmsText(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function classifyLink(url: string): Pick<StudentDocumentLink, "isPdf" | "isArchive"> {
  return {
    isPdf: /\.pdf(\?|$)/i.test(url),
    isArchive: /\.(rar|zip|7z)(\?|$)/i.test(url),
  };
}

function parseLinkElement(anchor: HTMLAnchorElement): StudentDocumentLink | null {
  const url = anchor.getAttribute("href")?.trim();
  const title = cleanText(anchor.textContent ?? "");
  if (!url || !title || title.length < 3) return null;
  return { url, title: title.replace(/^>{1,3}\s*/, ""), ...classifyLink(url) };
}

export function parseStudentFlatDocuments(html: string): StudentDocumentLink[] {
  if (!html?.trim() || typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const links: StudentDocumentLink[] = [];
  const seen = new Set<string>();

  doc.body.querySelectorAll("a[href]").forEach((anchor) => {
    const item = parseLinkElement(anchor as HTMLAnchorElement);
    if (!item) return;
    const key = item.url.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    links.push(item);
  });

  return links;
}

export function parseStudentGroupedDocuments(html: string): {
  coverImage?: string;
  groups: StudentDocumentGroup[];
} {
  if (!html?.trim() || typeof DOMParser === "undefined") return { groups: [] };

  const doc = new DOMParser().parseFromString(html, "text/html");
  const coverImage = doc.body.querySelector("img")?.getAttribute("src") ?? undefined;
  const groups: StudentDocumentGroup[] = [];
  let current: StudentDocumentGroup | null = null;

  const pushCurrent = () => {
    if (current && (current.heading || current.documents.length)) groups.push(current);
    current = null;
  };

  const isHeadingEl = (el: Element): boolean => {
    if (el.tagName === "STRONG") return true;
    if (el.querySelector("strong")) return true;
    const text = cleanText(el.textContent ?? "");
    return text.length > 3 && text.length < 120 && !el.querySelector("a") && /kafedra|bo['']limi|mavzulari/i.test(text);
  };

  [...doc.body.children].forEach((el) => {
    const link = el.querySelector("a[href]");
    if (isHeadingEl(el) && !link) {
      pushCurrent();
      current = { heading: cleanText(el.textContent ?? ""), documents: [] };
      return;
    }

    el.querySelectorAll("a[href]").forEach((anchor) => {
      const item = parseLinkElement(anchor as HTMLAnchorElement);
      if (!item) return;
      if (!current) current = { heading: "", documents: [] };
      if (!current.documents.some((d) => d.url === item.url)) current.documents.push(item);
    });
  });

  pushCurrent();

  if (groups.length === 0) {
    const flat = parseStudentFlatDocuments(html);
    if (flat.length) return { coverImage, groups: [{ heading: "", documents: flat }] };
  }

  return { coverImage, groups };
}

export function extractStudentDormPortalUrl(html: string, fallback: string): string {
  if (!html?.trim()) return fallback;
  const match = html.match(/https?:\/\/[^\s"'<>]*my\.gov\.uz[^\s"'<>]*/i);
  if (match) return match[0].replace(/^http:\/\(\(/, "https://").replace(/\)$/, "");
  return fallback;
}
