import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";
import {
  FOREIGN_BACHELOR_CONTRACT_ROWS,
  FOREIGN_MASTER_CONTRACT_ROWS,
  type ForeignContractRow,
} from "@/lib/xorijiyQabulSection";

export interface ForeignContractTable {
  title: string;
  subtitle?: string;
  rows: ForeignContractRow[];
}

function cleanText(value: string): string {
  return decodeAndCleanCmsText(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseNumberedSections(html: string): string[][] {
  const groups: string[][] = [];
  if (!html?.trim() || typeof DOMParser === "undefined") return groups;

  html.split(/<hr\s*\/?>/i).forEach((chunk) => {
    const text = cleanText(chunk);
    const items = [...text.matchAll(/\d+\.\s*([^]+?)(?=\d+\.\s|$)/g)].map((m) => m[1].trim()).filter(Boolean);
    if (items.length > 0) groups.push(items);
  });

  return groups;
}

export function parseForeignDocs(html: string): {
  intro?: string;
  notice?: string;
  electronic: string[];
  interview: string[];
} {
  if (!html?.trim()) return { electronic: [], interview: [] };

  const intro = cleanText(html.split(/<hr\s*\/?>/i)[0] ?? "");
  const groups = parseNumberedSections(html);

  return {
    intro: intro.length > 30 ? intro : undefined,
    electronic: groups[0] ?? [],
    interview: groups[1] ?? [],
  };
}

export function parseForeignContractTables(html: string): ForeignContractTable[] {
  if (!html?.trim() || typeof DOMParser === "undefined") return [];

  const doc = new DOMParser().parseFromString(html, "text/html");
  const tables = [...doc.querySelectorAll("table")];
  if (tables.length === 0) return [];

  return tables.map((table, index) => {
    const rows: ForeignContractRow[] = [];
    table.querySelectorAll("tr").forEach((tr, rowIndex) => {
      if (rowIndex === 0) return;
      const cells = [...tr.querySelectorAll("td, th")].map((c) => cleanText(c.textContent ?? ""));
      if (cells.length < 3) return;
      rows.push({
        num: Number.parseInt(cells[0], 10) || rowIndex,
        direction: cells[1],
        cisAmount: cells[2] ?? "—",
        foreignAmount: cells[3] ?? cells[2] ?? "—",
      });
    });
    return {
      title: index === 0 ? "admission.xorijiy.contract.bachelorTitle" : "admission.xorijiy.contract.masterTitle",
      subtitle: "admission.xorijiy.contract.subtitle",
      rows,
    };
  });
}

export function getForeignContractFallback(): ForeignContractTable[] {
  return [
    {
      title: "admission.xorijiy.contract.bachelorTitle",
      subtitle: "admission.xorijiy.contract.subtitle",
      rows: FOREIGN_BACHELOR_CONTRACT_ROWS,
    },
    {
      title: "admission.xorijiy.contract.masterTitle",
      subtitle: "admission.xorijiy.contract.subtitle",
      rows: FOREIGN_MASTER_CONTRACT_ROWS,
    },
  ];
}

export function getForeignDocsFallback(): {
  intro: string;
  notice: string;
  electronic: string[];
  interview: string[];
} {
  return {
    intro: "admission.xorijiy.docs.intro",
    notice: "admission.xorijiy.docs.notice",
    electronic: [
      "admission.xorijiy.docs.electronic.1",
      "admission.xorijiy.docs.electronic.2",
      "admission.xorijiy.docs.electronic.3",
      "admission.xorijiy.docs.electronic.4",
      "admission.xorijiy.docs.electronic.5",
      "admission.xorijiy.docs.electronic.6",
      "admission.xorijiy.docs.electronic.7",
    ],
    interview: [
      "admission.xorijiy.docs.interview.1",
      "admission.xorijiy.docs.interview.2",
      "admission.xorijiy.docs.interview.3",
      "admission.xorijiy.docs.interview.4",
    ],
  };
}

export function parseForeignPdfLead(html: string): string | undefined {
  if (!html?.trim() || typeof DOMParser === "undefined") return undefined;
  const text = cleanText(new DOMParser().parseFromString(html, "text/html").body.textContent ?? "");
  return text.length > 20 ? text.slice(0, 500) : undefined;
}
