import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface AdmissionDocsHighlight {
  text: string;
  icon: string;
}

export interface AdmissionDocsContent {
  portalUrl?: string;
  headline?: string;
  introParagraphs: string[];
  highlights: AdmissionDocsHighlight[];
  checklistTitle?: string;
  checklistItems: string[];
  notes: string[];
  deadline?: string;
  pdfTitleKey?: string;
}

const HIGHLIGHT_ICONS = ["ri-global-line", "ri-focus-3-line", "ri-book-read-line"];

function cleanText(html: string): string {
  return decodeAndCleanCmsText(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function nodeText(el: Element): string {
  return cleanText(el.innerHTML);
}

function splitHighlightLines(el: Element): string[] {
  const html = el.innerHTML.replace(/<br\s*\/?>/gi, "\n");
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const text = doc.body.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[—–-]\s*/, "").trim())
    .filter((line) => line.length > 12);
}

function extractListItems(root: ParentNode): string[] {
  const items: string[] = [];
  root.querySelectorAll("ul > li").forEach((li) => {
    const heading = li.querySelector(":scope > h1, :scope > h2, :scope > h3");
    const text = heading ? nodeText(heading) : nodeText(li);
    if (text.length > 3) items.push(text);
  });
  return items;
}

function inferPdfTitleKey(pdfUrl?: string | null): string | undefined {
  if (!pdfUrl) return undefined;
  if (/til.?sertifikat|sertifikat/i.test(decodeURIComponent(pdfUrl))) {
    return "admission.magistratura.pdf.tilSertifikati";
  }
  return undefined;
}

export function parseAdmissionDocsContent(html: string, pdfUrl?: string | null): AdmissionDocsContent {
  const empty: AdmissionDocsContent = {
    introParagraphs: [],
    highlights: [],
    checklistItems: [],
    notes: [],
    pdfTitleKey: inferPdfTitleKey(pdfUrl),
  };
  if (!html?.trim() || typeof DOMParser === "undefined") return empty;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  const portalLink = body.querySelector('a[href*="magistr.edu"], a[href*="my.uzbmb"], a[href*="my.edu"]');
  const portalUrl = portalLink?.getAttribute("href") ?? undefined;

  const list = body.querySelector("ul");
  const beforeList: Element[] = [];
  const afterList: Element[] = [];

  let seenList = false;
  for (const el of [...body.children]) {
    if (el.tagName === "UL") {
      seenList = true;
      continue;
    }
    if (!seenList) beforeList.push(el);
    else afterList.push(el);
  }

  const headline = beforeList.length ? nodeText(beforeList[0]) : undefined;
  const introParagraphs: string[] = [];
  const highlights: AdmissionDocsHighlight[] = [];
  let checklistTitle: string | undefined;

  beforeList.slice(1).forEach((el) => {
    const text = nodeText(el);
    if (!text || /eslatib o['']?t(amiz|moqda)/i.test(text)) return;

    const brLines = splitHighlightLines(el);
    if (brLines.length >= 2) {
      brLines.forEach((line, index) => {
        highlights.push({
          text: line,
          icon: HIGHLIGHT_ICONS[index] ?? "ri-information-line",
        });
      });
      return;
    }

    if (/quyidagi hujjatlarni|hujjatlarni taqdim|talab qilinadi/i.test(text)) {
      checklistTitle = text;
      return;
    }

    introParagraphs.push(text);
  });

  const checklistItems = list ? extractListItems(body) : [];
  const notes: string[] = [];
  let deadline: string | undefined;

  afterList.forEach((el) => {
    const text = nodeText(el);
    if (!text) return;
    const em = el.querySelector("em");
    if (em && /iyul|deadline|muddat|gacha/i.test(text)) {
      deadline = cleanText(em.textContent ?? text);
      return;
    }
    notes.push(text);
  });

  return {
    portalUrl,
    headline,
    introParagraphs,
    highlights,
    checklistTitle,
    checklistItems,
    notes,
    deadline,
    pdfTitleKey: inferPdfTitleKey(pdfUrl),
  };
}

export function getAdmissionDocsPdfTitleKey(pdfUrl?: string | null, fallbackKey?: string): string {
  return inferPdfTitleKey(pdfUrl) ?? fallbackKey ?? "admission.downloadPdf";
}
