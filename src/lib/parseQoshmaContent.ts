import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface QoshmaProgramStat {
  icon: string;
  labelKey: string;
  value: string;
}

export interface QoshmaProgramContent {
  bannerImage?: string;
  title?: string;
  subtitle?: string;
  partner?: string;
  programName?: string;
  stats: QoshmaProgramStat[];
}

export interface QoshmaDocsContent {
  bannerImage?: string;
  intro: string[];
  checklistTitle?: string;
  checklistItems: string[];
  phones: string[];
  schedule?: string;
  address?: string;
  mapUrl?: string;
  emails: string[];
}

function cleanText(value: string): string {
  return decodeAndCleanCmsText(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractPhones(text: string): string[] {
  return [...text.matchAll(/\+998[\d\s()-]{7,}/g)].map((m) => m[0].replace(/\s+/g, " ").trim());
}

function extractEmails(text: string): string[] {
  return [...text.matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)].map((m) => m[0]);
}

function parseContractAmount(text: string): string | undefined {
  const match = text.match(/(\d[\d\s.,]*)\s*USD/i);
  if (!match) return undefined;
  return `${match[1].replace(/\s/g, "").replace(",", ".")} USD`;
}

function parseQuota(text: string): string | undefined {
  const match = text.match(/(\d+)\s*o[`']?rin/i);
  return match ? match[1] : undefined;
}

function parseDuration(text: string): string | undefined {
  const match = text.match(/(\d+)\s*yil\s*\(\d+\+\d+\)/i);
  return match ? match[0] : undefined;
}

function parseLanguage(text: string): string | undefined {
  const match = text.match(/Ta[`']?lim tili[^a-z]*(.+?)\./i);
  return match?.[1]?.trim();
}

function parseExamBlocks(text: string): string | undefined {
  const match = text.match(/Kirish imtihon bloklari:\s*(.+?)\./i);
  return match?.[1]?.trim();
}

export function parseQoshmaProgram(html: string): QoshmaProgramContent {
  const empty: QoshmaProgramContent = { stats: [] };
  if (!html?.trim() || typeof DOMParser === "undefined") return empty;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  const fullText = cleanText(body.textContent ?? "");

  const bannerImage = body.querySelector("img")?.getAttribute("src") ?? undefined;
  const titleEl = body.querySelector("h2, p strong, p span strong");
  const title = body.querySelector("h2")
    ? cleanText(body.querySelector("h2")!.textContent ?? "")
    : undefined;

  const subtitle = [...body.querySelectorAll("p")].map((p) => cleanText(p.textContent ?? "")).find((t) =>
    /shartnoma puli|kurs bo/i.test(t),
  );

  const partner = fullText.match(/Rossiya Federatsiyasining[^"]+hamkorlikda/i)?.[0];
  const programMatch = fullText.match(/[«""]([^»""]+)[»""][^]*?qoʻshma/i);
  const programName = programMatch?.[1] ?? "Davolash ishi";

  const stats: QoshmaProgramStat[] = [];
  const quota = parseQuota(fullText);
  if (quota) stats.push({ icon: "ri-group-line", labelKey: "admission.qoshma.stat.quota", value: quota });

  const duration = parseDuration(fullText);
  if (duration) stats.push({ icon: "ri-time-line", labelKey: "admission.qoshma.stat.duration", value: duration });

  const language = parseLanguage(fullText);
  if (language) stats.push({ icon: "ri-translate-2", labelKey: "admission.qoshma.stat.language", value: language });

  const exams = parseExamBlocks(fullText);
  if (exams) stats.push({ icon: "ri-book-read-line", labelKey: "admission.qoshma.stat.exams", value: exams });

  const contract = parseContractAmount(fullText);
  if (contract) stats.push({ icon: "ri-money-dollar-circle-line", labelKey: "admission.qoshma.stat.contract", value: contract });

  return {
    bannerImage,
    title: title || undefined,
    subtitle,
    partner,
    programName,
    stats,
  };
}

export function parseQoshmaDocs(html: string): QoshmaDocsContent {
  const empty: QoshmaDocsContent = { intro: [], checklistItems: [], phones: [], emails: [] };
  if (!html?.trim() || typeof DOMParser === "undefined") return empty;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  const bannerImage = body.querySelector("img")?.getAttribute("src") ?? undefined;

  const intro: string[] = [];
  const checklistItems: string[] = [];
  let checklistTitle: string | undefined;
  let schedule: string | undefined;
  let address: string | undefined;

  body.querySelectorAll("p, div").forEach((el) => {
    if (el.querySelector("iframe, img")) return;
    const text = cleanText(el.textContent ?? "");
    if (!text || text.length < 20) return;

    if (/XALQARO QO[`']?SHMA TA[`']?LIM DASTURIGA ABITURIYENTLARDAN/i.test(text)) {
      checklistTitle = text;
      return;
    }
    if (/Farg[`']?ona jamoat salomatligi tibbiyot instituti 2025/i.test(text)) {
      intro.push(text);
      return;
    }
    if (/ikki davlat|Kursk davlat tibbiyot universitetining/i.test(text)) {
      intro.push(text);
      return;
    }
    if (/soat 9:00 dan 18:00/i.test(text)) {
      schedule = text;
    }
    if (/Qabul komissiyasi joylashgan manzil/i.test(text)) {
      address = text.replace(/Qabul komissiyasi joylashgan manzil:\s*/i, "");
    }
  });

  html.split(/<hr\s*\/?>/i).forEach((chunk) => {
    const text = cleanText(chunk);
    if (!text || text.length > 220 || text.length < 10) return;
    if (
      /rektori nomiga|pasport|Diplom|attestat|Fotosurat|Forma 086|Forma 063|OITS|Abituriyent to[`']?g[`']?risida/i.test(
        text,
      ) &&
      !/Murojaat uchun|elektron platforma/i.test(text)
    ) {
      checklistItems.push(text);
    }
  });

  const phones = extractPhones(body.innerHTML);
  const emails = extractEmails(body.innerHTML);
  const mapUrl = body.querySelector("iframe")?.getAttribute("src") ?? undefined;

  return {
    bannerImage,
    intro: [...new Set(intro)],
    checklistTitle,
    checklistItems: [...new Set(checklistItems)],
    phones: [...new Set(phones)],
    schedule,
    address,
    mapUrl,
    emails: [...new Set(emails)],
  };
}
