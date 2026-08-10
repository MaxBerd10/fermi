import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface InternaturaPortal {
  url: string;
  label: string;
  descriptionKey: string;
}

export interface InternaturaSubmitContent {
  paragraphs: string[];
  deadlines: string[];
  portals: InternaturaPortal[];
}

function cleanText(value: string): string {
  return decodeAndCleanCmsText(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractPortals(html: string): InternaturaPortal[] {
  const portals: InternaturaPortal[] = [];
  if (/medtoifa\.ssv\.uz/i.test(html)) {
    portals.push({
      url: "https://medtoifa.ssv.uz",
      label: "medtoifa.ssv.uz",
      descriptionKey: "admission.internatura.portal.medtoifa",
    });
  }
  if (/tmbm\.ssv\.uz/i.test(html)) {
    portals.push({
      url: "https://tmbm.ssv.uz",
      label: "tmbm.ssv.uz",
      descriptionKey: "admission.internatura.portal.tmbm",
    });
  }
  return portals;
}

export function parseInternaturaSubmit(html: string): InternaturaSubmitContent {
  const empty: InternaturaSubmitContent = { paragraphs: [], deadlines: [], portals: [] };
  if (!html?.trim()) return empty;

  const paragraphs: string[] = [];
  html.split(/<hr\s*\/?>/i).forEach((chunk) => {
    const text = cleanText(chunk);
    if (text.length > 40) paragraphs.push(text);
  });

  if (paragraphs.length === 0 && typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.body.querySelectorAll("p").forEach((p) => {
      const text = cleanText(p.textContent ?? "");
      if (text.length > 40) paragraphs.push(text);
    });
  }

  const deadlines = paragraphs
    .flatMap((p) => p.match(/\d{1,2}[./]\d{1,2}[./]\d{4}(?:\s*[-–—]\s*\d{1,2}[./]\d{1,2}[./]\d{4})?/g) ?? [])
    .filter(Boolean);

  return {
    paragraphs,
    deadlines,
    portals: extractPortals(html),
  };
}

export function parseInternaturaPdfLead(html: string): string | undefined {
  if (!html?.trim() || typeof DOMParser === "undefined") return undefined;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = cleanText(doc.body.textContent ?? "");
  return text.length > 20 ? text.slice(0, 500) : undefined;
}
