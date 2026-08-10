import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import { inferOrdinaturaPdfTitleKey } from "@/lib/ordinaturaSection";

export interface OrdinaturaReminderSection {
  title: string;
  items: string[];
}

export interface OrdinaturaReminderContent {
  bannerImage?: string;
  title?: string;
  sections: OrdinaturaReminderSection[];
  pdfTitleKey?: string;
}

function cleanText(value: string): string {
  return decodeAndCleanCmsText(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function parseOrdinaturaReminder(html: string, pdfUrl?: string | null): OrdinaturaReminderContent {
  const empty: OrdinaturaReminderContent = {
    sections: [],
    pdfTitleKey: inferOrdinaturaPdfTitleKey(pdfUrl),
  };
  if (!html?.trim() || typeof DOMParser === "undefined") return empty;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  const bannerImage =
    body.querySelector("h2 img, p img, img")?.getAttribute("src") ?? undefined;

  const sections: OrdinaturaReminderSection[] = [];
  let current: OrdinaturaReminderSection | null = null;
  let mainTitle: string | undefined;

  const pushCurrent = () => {
    if (current && (current.title || current.items.length)) sections.push(current);
    current = null;
  };

  body.querySelectorAll("h2, h3, p").forEach((el) => {
    if (el.closest("figure")) return;
    if (el.querySelector("img")) return;

    const text = cleanText(el.textContent ?? "");
    if (!text) return;

    if (el.tagName === "H2") {
      pushCurrent();
      mainTitle = text;
      return;
    }

    if (el.tagName === "H3" || (el.tagName === "P" && el.querySelector("span[style*='color']"))) {
      pushCurrent();
      current = { title: text.replace(/:$/, ""), items: [] };
      return;
    }

    if (!current) current = { title: mainTitle ?? "", items: [] };
    current.items.push(text);
  });
  pushCurrent();

  const merged: OrdinaturaReminderSection[] = [];
  for (const section of sections) {
    if (!section.title && merged.length) {
      merged[merged.length - 1].items.push(...section.items);
      continue;
    }
    if (section.title && section.items.length === 0 && merged.length) {
      merged[merged.length - 1].items.push(section.title);
      continue;
    }
    merged.push(section);
  }

  return {
    bannerImage,
    title: mainTitle,
    sections: merged.filter((s) => s.title || s.items.length),
    pdfTitleKey: inferOrdinaturaPdfTitleKey(pdfUrl),
  };
}

export function getOrdinaturaPdfTitleKey(pdfUrl?: string | null, fallbackKey?: string): string {
  return inferOrdinaturaPdfTitleKey(pdfUrl) ?? fallbackKey ?? "admission.downloadPdf";
}

// Re-export table and locations parsers from same file - keep rest of file
export interface AdmissionDocsTableRow {
  type: string;
  note: string;
}

export interface AdmissionDocsTableContent {
  title?: string;
  subtitle?: string;
  rows: AdmissionDocsTableRow[];
  footnotes: string[];
  phones: string[];
  pdfTitleKey?: string;
}

export interface AdmissionLocationItem {
  region: string;
  venue: string;
  address: string;
  mapUrl?: string;
}

export interface AdmissionLocationsContent {
  intro?: string;
  bannerImage?: string;
  heading?: string;
  locations: AdmissionLocationItem[];
  alerts: string[];
  portalUrl?: string;
  portalLabel?: string;
}

function extractPhones(text: string): string[] {
  return [...text.matchAll(/\+998[\d\s()-]{7,}/g)].map((m) => m[0].replace(/\s+/g, " ").trim());
}

export function parseAdmissionDocsTable(html: string, pdfUrl?: string | null): AdmissionDocsTableContent {
  const empty: AdmissionDocsTableContent = {
    rows: [],
    footnotes: [],
    phones: [],
    pdfTitleKey: inferOrdinaturaPdfTitleKey(pdfUrl),
  };
  if (!html?.trim() || typeof DOMParser === "undefined") return empty;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  const rows: AdmissionDocsTableRow[] = [];

  body.querySelectorAll("table tr").forEach((tr, index) => {
    const cells = tr.querySelectorAll("td");
    if (cells.length < 2 || index === 0) return;
    const type = cleanText(cells[0].innerHTML);
    const note = cleanText(cells[1].innerHTML);
    if (type && note) rows.push({ type, note });
  });

  const paragraphs = [...body.querySelectorAll("p")].map((el) => cleanText(el.textContent ?? "")).filter(Boolean);
  const title = paragraphs.find((p) => /HUJJATLAR RO[`']?YXATI/i.test(p));
  const subtitle = paragraphs.find(
    (p) => /2025-2026|klinik ordinatura.*qabul/i.test(p) && !/HUJJATLAR/i.test(p),
  );

  const phones = extractPhones(body.innerHTML);
  const footnotes = paragraphs.filter(
    (p) =>
      p !== title &&
      p !== subtitle &&
      !phones.some((phone) => p.includes(phone)) &&
      !/^\+998/.test(p) &&
      (p.includes("Masalan:") ||
        p.includes("foto.jpg") ||
        p.includes("Tasdiqlash xati") ||
        p.includes("fjsti.uz") ||
        p.includes("Fayllar nomlarini") ||
        p.includes("Hujjatlarni") ||
        p.includes("Qo`shimcha")),
  );

  return {
    title,
    subtitle: subtitle && subtitle !== title ? subtitle : undefined,
    rows,
    footnotes,
    phones: [...new Set(phones)],
    pdfTitleKey: inferOrdinaturaPdfTitleKey(pdfUrl),
  };
}

export function parseAdmissionLocations(html: string): AdmissionLocationsContent {
  const empty: AdmissionLocationsContent = { locations: [], alerts: [] };
  if (!html?.trim() || typeof DOMParser === "undefined") return empty;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  const banner = body.querySelector("img")?.getAttribute("src") ?? undefined;

  const introEl = [...body.querySelectorAll("p")].find(
    (p) => !p.querySelector("img") && /avgust|imtihonlari/i.test(p.textContent ?? ""),
  );
  const intro = introEl ? cleanText(introEl.textContent ?? "") : undefined;

  const headingEl = [...body.querySelectorAll("p, strong")].find((el) =>
    /manzillarda o['']?tkaziladi|imtihonlar quyidagi/i.test(cleanText(el.textContent ?? "")),
  );
  const heading = headingEl ? cleanText(headingEl.textContent ?? "") : undefined;

  const locations: AdmissionLocationItem[] = [];
  const seen = new Set<string>();
  const chunks = html.split(/<hr\s*\/?>/i);

  for (const chunk of chunks) {
    if (!/uchun:/i.test(chunk)) continue;
    const part = new DOMParser().parseFromString(chunk, "text/html");
    const text = cleanText(part.body.textContent ?? "");
    const regionMatch = text.match(/(.+?uchun):/i);
    if (!regionMatch) continue;
    const region = regionMatch[1].trim();
    if (seen.has(region)) continue;
    seen.add(region);

    const link = part.body.querySelector('a[href*="maps"], a[href*="yandex"]');
    const mapUrl = link?.getAttribute("href") ?? undefined;
    const address = link ? cleanText(link.textContent ?? "") : "";
    const afterRegion = text.slice(text.indexOf(":") + 1).trim();
    const venue = afterRegion.replace(address, "").trim();

    locations.push({ region, venue, address, mapUrl });
  }

  const portalLink = body.querySelector('a[href*="tmbm.ssv"]');
  const alerts = [...body.querySelectorAll("p, div")]
    .map((el) => cleanText(el.textContent ?? ""))
    .filter((text) => text.length > 30 && /DIQQAT|Eslatma|tanlov|kechikkan|ruxsatnoma|kirmaydi/i.test(text));

  return {
    intro,
    bannerImage: banner,
    heading,
    locations,
    alerts: [...new Set(alerts)],
    portalUrl: portalLink?.getAttribute("href") ?? undefined,
    portalLabel: portalLink ? cleanText(portalLink.textContent ?? "") : undefined,
  };
}
