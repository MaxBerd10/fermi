import type { NewsArticle } from "@/types/content";

const API_ORIGIN = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/v1\/?$/, "") ||
  "https://api.fermi.uz"
).replace(/\/$/, "");

const NEWS_FALLBACK_IMAGES = [
  "/images/news-fallback-1.png",
  "/images/news-fallback-2.png",
  "/images/news-fallback-3.png",
] as const;

const DOCUMENT_PLACEHOLDER_IMAGE = "/images/logo.png?v=2";

/** CMS menyu slug → API dagi haqiqiy kategoriya slug */
const NEWS_CATEGORY_SLUG_ALIASES: Record<string, string> = {
  "yoshlar-ittifoqi-tomonidan-otkazilgan-tadbirlar": "yoshlar-ittifoqi-tadbirlari",
};

export function normalizeNewsCategorySlug(slug: string): string {
  if (!slug) return slug;
  return NEWS_CATEGORY_SLUG_ALIASES[slug] ?? slug;
}

export function resolveNewsImageUrl(src: string): string {
  if (!src) return "";
  let url = src.trim().replace(/&amp;/g, "&");

  if (url.startsWith("//")) url = `https:${url}`;
  if (url.startsWith("/")) url = `${API_ORIGIN}${url}`;

  url = url.replace(/^https?:\/\/(?:www\.)?fjsti\.uz/i, API_ORIGIN);
  url = url.replace(/^https?:\/\/(?:www\.)?fermi\.uz/i, API_ORIGIN);

  return url;
}

export function extractFirstImageFromHtml(html: string): string | null {
  if (!html?.trim()) return null;

  const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw || raw.startsWith("data:")) continue;
    if (/spacer|pixel|1x1|blank\.gif/i.test(raw)) continue;
    const resolved = resolveNewsImageUrl(raw);
    if (resolved) return resolved;
  }

  return null;
}

export function getNewsArticleImage(
  article: Pick<NewsArticle, "img" | "content" | "hasDocument">,
  fallbackIndex = 0,
): string {
  const fromField = article.img?.trim();
  if (fromField) {
    const resolved = resolveNewsImageUrl(fromField);
    if (resolved) return resolved;
  }

  // Document-only Telegram posts (PDF attachments, no photo) have no real image of
  // their own — a random decorative stock photo next to a filename list reads as a
  // rendering bug. Prefer the institute logo, before falling through to the
  // generic per-index fallback used for everything else.
  if (article.hasDocument) return DOCUMENT_PLACEHOLDER_IMAGE;

  const fromContent = extractFirstImageFromHtml(article.content);
  if (fromContent) return fromContent;

  return NEWS_FALLBACK_IMAGES[fallbackIndex % NEWS_FALLBACK_IMAGES.length];
}

export function enrichNewsArticle(article: NewsArticle, index = 0): NewsArticle {
  return {
    ...article,
    img: getNewsArticleImage(article, index),
  };
}

export function enrichNewsArticles(articles: NewsArticle[]): NewsArticle[] {
  return articles.map((article, index) => enrichNewsArticle(article, index));
}
