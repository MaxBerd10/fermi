import { decodeAndCleanCmsText } from "@/lib/normalizeCmsText";

export interface KamTaminlanganSection {
  title: string;
  body: string;
  icon: string;
}

export interface KamTaminlanganStat {
  value: string;
  labelKey: string;
  icon: string;
}

export interface ParsedKamTaminlangan {
  intro: string;
  stats: KamTaminlanganStat[];
  sections: KamTaminlanganSection[];
}

const SECTION_ICONS = [
  "ri-book-open-line",
  "ri-wallet-3-line",
  "ri-lightbulb-line",
  "ri-presentation-line",
  "ri-global-line",
  "ri-heart-pulse-line",
  "ri-basketball-line",
  "ri-community-line",
];

function stripParaHtml(html: string): string {
  return decodeAndCleanCmsText(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function dedupeIntro(text: string): string {
  const marker = /Farg['']?ona jamoat salomatligi tibbiyot institutida kam ta['']?minlangan/i;
  const matches = [...text.matchAll(new RegExp(marker.source, "gi"))];
  if (matches.length < 2 || matches[1].index == null) return text.trim();
  return text.slice(matches[1].index).trim();
}

function extractStats(intro: string): KamTaminlanganStat[] {
  const stats: KamTaminlanganStat[] = [];

  const total = intro.match(/(\d+)\s*nafardan\s*ortiq/i);
  if (total) {
    stats.push({ value: `${total[1]}+`, labelKey: "faoliyat.kamTaminlangan.statTotal", icon: "ri-group-line" });
  }

  const supported = intro.match(/(\d+)\s*nafar\s*talabalarga\s*bir qancha/i);
  if (supported) {
    stats.push({
      value: supported[1],
      labelKey: "faoliyat.kamTaminlangan.statSupported",
      icon: "ri-hand-heart-line",
    });
  }

  const freeDorm = intro.match(/nogironligi bor\s*(\d+)\s*nafar/i);
  if (freeDorm) {
    stats.push({
      value: freeDorm[1],
      labelKey: "faoliyat.kamTaminlangan.statFreeDorm",
      icon: "ri-home-heart-line",
    });
  }

  const discount = intro.match(/Qolgan\s*(\d+)\s*nafar/i);
  if (discount) {
    stats.push({
      value: discount[1],
      labelKey: "faoliyat.kamTaminlangan.statDiscount",
      icon: "ri-percent-line",
    });
  }

  const orphans = intro.match(/(\d+)\s*nafar\s*ota ona qaramog/i);
  if (orphans) {
    stats.push({
      value: orphans[1],
      labelKey: "faoliyat.kamTaminlangan.statOrphans",
      icon: "ri-shield-user-line",
    });
  }

  return stats;
}

function isHeadingBlock(innerHtml: string, text: string): boolean {
  if (text.length > 220 || text.length < 8) return false;
  if (!/<strong\b/i.test(innerHtml)) return false;
  const hasAccent = /#0000CD|rgb\(\s*0\s*,\s*0\s*,\s*205\s*\)/i.test(innerHtml);
  const strongOnly =
    stripParaHtml(innerHtml.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "$1")) === text ||
    text.endsWith(":");
  return hasAccent || (strongOnly && text.length <= 160);
}

function cleanTitle(text: string): string {
  return text.replace(/:\s*$/, "").replace(/\s+/g, " ").trim();
}

export function parseKamTaminlanganContent(html: string): ParsedKamTaminlangan {
  if (!html?.trim()) {
    return { intro: "", stats: [], sections: [] };
  }

  const blocks: { html: string; text: string }[] = [];
  const blockRe = /<(p|div)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(html)) !== null) {
    const inner = match[2];
    const text = stripParaHtml(inner);
    if (text.length >= 8) blocks.push({ html: inner, text });
  }

  let intro = "";
  const sections: KamTaminlanganSection[] = [];
  let current: KamTaminlanganSection | null = null;
  let sectionIndex = 0;

  for (const block of blocks) {
    if (!intro && !isHeadingBlock(block.html, block.text)) {
      intro = dedupeIntro(block.text);
      continue;
    }

    if (isHeadingBlock(block.html, block.text)) {
      if (current) sections.push(current);
      current = {
        title: cleanTitle(block.text),
        body: "",
        icon: SECTION_ICONS[sectionIndex % SECTION_ICONS.length],
      };
      sectionIndex += 1;
      continue;
    }

    if (current) {
      current.body = current.body ? `${current.body} ${block.text}` : block.text;
    } else if (!intro) {
      intro = dedupeIntro(block.text);
    }
  }

  if (current) sections.push(current);

  const orphanStats = extractStats(intro);
  for (const section of sections) {
    if (!orphanStats.some((s) => s.labelKey === "faoliyat.kamTaminlangan.statOrphans")) {
      const orphanInSection = section.body.match(/(\d+)\s*nafar\s*ota ona qaramog/i);
      if (orphanInSection) {
        orphanStats.push({
          value: orphanInSection[1],
          labelKey: "faoliyat.kamTaminlangan.statOrphans",
          icon: "ri-shield-user-line",
        });
        break;
      }
    }
  }

  return {
    intro,
    stats: orphanStats,
    sections: sections.filter((s) => s.title && s.body),
  };
}
