import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface AdmissionImage {
  url: string;
  alt: string;
}

export interface AdmissionContactInfo {
  address?: string;
  phones: string[];
  emails: string[];
  mapUrl?: string;
  images: AdmissionImage[];
}

function stripText(html: string): string {
  return decodeAndCleanCmsText(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function parseAdmissionImages(html: string): AdmissionImage[] {
  const images: AdmissionImage[] = [];
  const seen = new Set<string>();
  const re = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const url = match[1].trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    images.push({ url, alt: match[2]?.trim() ?? "" });
  }
  return images;
}

export function parseAdmissionContact(html: string): AdmissionContactInfo {
  const text = stripText(html);
  const phones = [...text.matchAll(/\+998[\d\s()-]{7,}/g)].map((m) => m[0].replace(/\s+/g, " ").trim());
  const emails = [...text.matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)].map((m) => m[0]);
  const addressMatch = text.match(/Manzil:\s*(.+?)(?=Qabul|$)/i);
  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return {
    address: addressMatch?.[1]?.trim(),
    phones: [...new Set(phones)],
    emails: [...new Set(emails)],
    mapUrl: iframeMatch?.[1],
    images: parseAdmissionImages(html),
  };
}

export function extractPrimaryExternalUrl(html: string, fallback?: string): string | null {
  const re = /<a[^>]+href=["'](https?:\/\/[^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const url = match[1];
    if (/my\.uzbmb|my\.gov|my\.edu|magistr\.edu|tmbm\.ssv|lex\.uz|studyin-uzbekistan/i.test(url)) return url;
  }
  return fallback ?? null;
}
