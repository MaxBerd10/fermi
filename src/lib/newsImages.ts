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
  // Unlike real uploaded content (which lives on the API/CMS server, hence the
  // API_ORIGIN prefixing below), the document placeholder is this frontend's own
  // static asset — same file the navbar/footer already use. Leave it relative so
  // it resolves against fermi.uz itself, not the API's separate domain, whether
  // this function sees it directly or via a second getNewsArticleImage() pass
  // over an already-enriched article (enrichNewsArticle prefills img).
  if (src.trim() === DOCUMENT_PLACEHOLDER_IMAGE) return DOCUMENT_PLACEHOLDER_IMAGE;
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
  article: Pick<NewsArticle, "img" | "content" | "hasDocument" | "category">,
  fallbackIndex = 0,
): string {
  const fromField = article.img?.trim();
  if (fromField) {
    const resolved = resolveNewsImageUrl(fromField);
    if (resolved) return resolved;
  }

  const fromContent = extractFirstImageFromHtml(article.content);
  if (fromContent) return fromContent;

  // Telegram posts with no real photo at all — document-only, or plain text — have
  // no image of their own. A random decorative stock photo (the generic per-index
  // rotation below) reads as arbitrary/wrong for auto-imported content with no
  // editorial control over it. Prefer the institute logo instead; CMS-authored
  // articles (a real editor picked the category/content) keep the rotation.
  if (article.hasDocument || article.category?.slug === "telegram") return DOCUMENT_PLACEHOLDER_IMAGE;

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
