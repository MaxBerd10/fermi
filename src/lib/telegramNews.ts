import type { NewsArticle } from "@/types/content";

export const TELEGRAM_SLUG_PREFIX = "tg-";

export function isTelegramNewsSlug(slug: string | undefined): boolean {
  return Boolean(slug?.startsWith(TELEGRAM_SLUG_PREFIX));
}

export function mergeNewsByDate(telegram: NewsArticle[], cms: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return [...telegram, ...cms]
    .filter((article) => {
      const key = article.slug || String(article.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
