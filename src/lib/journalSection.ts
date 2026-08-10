import type { MenuNode } from "@/types/menu";
import { normalizeMenuHref } from "@/lib/siteConstants";

export const JOURNAL_SECTION_MENU_ID = 283;

export const JOURNAL_ARCHIVE_SLUGS = new Set(["jcpm-2023", "jcpm-2024", "jcpm-2025"]);

export const JOURNAL_PDF_SLUGS = new Set([
  "klinik-va-profilaktik-tibbiyot-jurnali",
  "jurnal-xaqida",
  "tahrir-hayati-kengashi",
  "maqola-namunasi",
]);

export function isJournalArchivePage(slug?: string): boolean {
  return Boolean(slug && JOURNAL_ARCHIVE_SLUGS.has(slug));
}

export function isJournalPdfPage(slug?: string): boolean {
  return Boolean(slug && JOURNAL_PDF_SLUGS.has(slug));
}

export function findJournalSectionMenu(menu: MenuNode[]): { title: string; items: MenuNode[] } | null {
  for (const top of menu) {
    for (const section of top.children ?? []) {
      if (section.id === JOURNAL_SECTION_MENU_ID) {
        return { title: section.title, items: section.children ?? [] };
      }
    }
  }
  return null;
}

export function isJournalNavItemActive(href: string, pathname: string, slug?: string): boolean {
  const normalized = normalizeMenuHref(href);
  if (pathname === normalized) return true;
  if (slug && normalized.endsWith(`/${slug}`)) return true;
  return false;
}

export function getJournalPageIntroKey(slug?: string): string | null {
  switch (slug) {
    case "klinik-va-profilaktik-tibbiyot-jurnali":
      return "journal.intro.main";
    case "tahrir-hayati-kengashi":
      return "journal.intro.editorial";
    case "jurnal-xaqida":
      return "journal.intro.about";
    case "maqola-namunasi":
      return "journal.intro.sample";
    case "jcpm-2023":
      return "journal.intro.archive2023";
    case "jcpm-2024":
      return "journal.intro.archive2024";
    case "jcpm-2025":
      return "journal.intro.archive2025";
    default:
      return null;
  }
}

export function getJournalArchiveYear(slug?: string): string | null {
  if (!slug?.startsWith("jcpm-")) return null;
  return slug.replace("jcpm-", "");
}

export function isJournalCompactPdf(_slug?: string): boolean {
  return false;
}

export function isJournalAboutFallback(slug?: string): boolean {
  return slug === "jurnal-xaqida";
}
