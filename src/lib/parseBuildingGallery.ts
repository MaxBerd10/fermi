import { decodeAndCleanCmsText, normalizeCmsOrthography } from "@/lib/normalizeCmsText";

export interface BuildingPhoto {
  src: string;
  caption: string;
  alt: string;
}

const CAPTION_HINTS: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /kutubxona/i, key: "buildings.caption.library" },
  { pattern: /holl|hol/i, key: "buildings.caption.hall" },
  { pattern: /uquv xona|oquv xona/i, key: "buildings.caption.classroom" },
  { pattern: /uquv bino|oquv bino/i, key: "buildings.caption.building" },
  { pattern: /yotoqxona|turar joy/i, key: "buildings.caption.dormRoom" },
  { pattern: /oshxona/i, key: "buildings.caption.canteen" },
  { pattern: /vivariy/i, key: "buildings.caption.vivarium" },
  { pattern: /jihoz/i, key: "buildings.caption.equipment" },
  { pattern: /simulatsiya/i, key: "buildings.caption.simulation" },
  { pattern: /kongress|konsert/i, key: "buildings.caption.congress" },
  { pattern: /sport/i, key: "buildings.caption.sport" },
  { pattern: /rektorat/i, key: "buildings.caption.rectorate" },
];

function captionFromSrc(src: string, index: number): string {
  try {
    const decoded = decodeURIComponent(src);
    const filename = decoded.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
    const lower = filename.toLowerCase();

    for (const { pattern, key } of CAPTION_HINTS) {
      if (pattern.test(decoded) || pattern.test(lower)) return key;
    }

    const cleaned = normalizeCmsOrthography(
      filename.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim(),
    );
    if (cleaned.length >= 3 && !/^\d+$/.test(cleaned)) return cleaned;

    return `buildings.caption.photo|${index + 1}`;
  } catch {
    return `buildings.caption.photo|${index + 1}`;
  }
}

/** CMS fotogalereya HTML dan rasmlarni ajratish */
export function parseBuildingGallery(html: string): BuildingPhoto[] {
  if (!html?.trim()) return [];

  const items: BuildingPhoto[] = [];
  const seen = new Set<string>();
  const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRe.exec(html)) !== null) {
    const src = match[1].trim();
    if (!src || seen.has(src)) continue;
    seen.add(src);

    const captionKey = captionFromSrc(src, items.length);
    const altFromCms = match[2] ? decodeAndCleanCmsText(match[2]) : "";

    items.push({
      src,
      caption: captionKey,
      alt: altFromCms || captionKey,
    });
  }

  return items;
}
