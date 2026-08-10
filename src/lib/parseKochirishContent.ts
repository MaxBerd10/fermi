import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface TransferPortal {
  url: string;
  label: string;
  description: string;
}

export interface TransferRestoreContent {
  bannerImage?: string;
  headline?: string;
  intro?: string;
  portals: TransferPortal[];
  deadline?: string;
  rejectionTitle?: string;
  rejectionReasons: string[];
  videoUrl?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface AdmissionFaqContent {
  bannerImage?: string;
  items: FaqItem[];
  mapUrl?: string;
  videoUrl?: string;
}

function cleanText(value: string): string {
  return decodeAndCleanCmsText(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function parseTransferRestore(html: string): TransferRestoreContent {
  const empty: TransferRestoreContent = { portals: [], rejectionReasons: [] };
  if (!html?.trim() || typeof DOMParser === "undefined") return empty;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  const fullText = cleanText(body.textContent ?? "");
  const bannerImage = body.querySelector("img")?.getAttribute("src") ?? undefined;

  const headline = [...body.querySelectorAll("p strong, p")]
    .map((el) => cleanText(el.textContent ?? ""))
    .find((t) => /onlayn ariza yuborish boshlandi/i.test(t));

  const intro = [...body.querySelectorAll("p")]
    .map((el) => cleanText(el.textContent ?? ""))
    .find((t) => /2025\/2026.*elektron tizimlar/i.test(t));

  const portals: TransferPortal[] = [];
  if (/transfer\.edu\.uz/i.test(html)) {
    portals.push({
      url: "https://transfer.edu.uz",
      label: "transfer.edu.uz",
      description: "admission.kochirish.portal.internal",
    });
  }
  if (/transfer\.dtm\.uz|xorijiy va nodavlat/i.test(html)) {
    portals.push({
      url: "https://transfer.dtm.uz",
      label: "transfer.dtm.uz",
      description: "admission.kochirish.portal.foreign",
    });
  }

  const deadlineMatch = fullText.match(/(\d{1,2}\s+\w+\dan\s+\d{1,2}\s+\w+gacha)/i);
  const deadline = deadlineMatch?.[1];

  const rejectionTitle = fullText.match(/RAD ETILISHIGA ASOSIY SABABLAR/i)?.[0];
  const rejectionReasons: string[] = [];
  html.split(/<hr\s*\/?>/i).forEach((chunk) => {
    const text = cleanText(chunk);
    if (!/^\d+\./.test(text) || text.length < 30) return;
    rejectionReasons.push(text.replace(/^\d+\.\s*/, ""));
  });

  const videoUrl = html.match(/<iframe[^>]+src=["']([^"']*youtube[^"']*)["']/i)?.[1];

  return {
    bannerImage,
    headline,
    intro,
    portals,
    deadline,
    rejectionTitle,
    rejectionReasons,
    videoUrl,
  };
}

export function parseAdmissionFaq(html: string): AdmissionFaqContent {
  const empty: AdmissionFaqContent = { items: [] };
  if (!html?.trim() || typeof DOMParser === "undefined") return empty;

  const bannerImage = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  const mapUrl = html.match(/<iframe[^>]+src=["']([^"']*google\.com\/maps[^"']*)["']/i)?.[1];
  const videoUrl = html.match(/<iframe[^>]+src=["']([^"']*youtube[^"']*)["']/i)?.[1];

  const items: FaqItem[] = [];
  html.split(/<hr\s*\/?>/i).forEach((chunk) => {
    const doc = new DOMParser().parseFromString(chunk, "text/html");
    const paragraphs = [...doc.body.querySelectorAll("p")]
      .map((p) => cleanText(p.textContent ?? ""))
      .filter(Boolean);
    if (paragraphs.length < 2) return;

    const questionIdx = paragraphs.findIndex((p) => p.includes("?") && p.length < 220);
    if (questionIdx === -1) return;

    const question = paragraphs[questionIdx];
    const answer = paragraphs.slice(questionIdx + 1).join("\n\n");
    if (answer) items.push({ question, answer });
  });

  return {
    bannerImage,
    items,
    mapUrl,
    videoUrl,
  };
}
