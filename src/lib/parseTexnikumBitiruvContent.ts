import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

function cleanText(value: string): string {
  return decodeAndCleanCmsText(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function parseTexnikumPdfLead(html: string): string | undefined {
  if (!html?.trim() || typeof DOMParser === "undefined") return undefined;
  const text = cleanText(new DOMParser().parseFromString(html, "text/html").body.textContent ?? "");
  return text.length > 20 ? text.slice(0, 600) : undefined;
}

export function parseTexnikumRegulation(html: string): string[] {
  if (!html?.trim() || typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const paragraphs = [...doc.body.querySelectorAll("p")]
    .map((p) => cleanText(p.textContent ?? ""))
    .filter((t) => t.length > 40);
  return paragraphs;
}
