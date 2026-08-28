import type { NewsArticle } from "@/types/content";
import { isTelegramNewsSlug } from "@/lib/telegramNews";
import { stripHtml } from "@/lib/html";

const memory = new Map<string, string>();

function cacheKey(lang: string, text: string) {
  return `${lang.slice(0, 2)}:${text}`;
}

function readStore(key: string) {
  try {
    return sessionStorage.getItem(`fermi-tr:${key.slice(0, 180)}`) || "";
  } catch {
    return "";
  }
}

function writeStore(key: string, value: string) {
  try {
    sessionStorage.setItem(`fermi-tr:${key.slice(0, 180)}`, value);
  } catch {
    /* quota */
  }
}

async function translateChunk(text: string, lang: string): Promise<string> {
  const source = String(text || "").trim();
  const code = lang.slice(0, 2);
  if (!source || code === "uz") return source;
  const key = cacheKey(code, source);
  if (memory.has(key)) return memory.get(key) || source;
  const stored = readStore(key);
  if (stored) {
    memory.set(key, stored);
    return stored;
  }

  const tryUrls = [
    `/telegram-feed/translate?lang=${encodeURIComponent(code)}&q=${encodeURIComponent(source.slice(0, 450))}`,
    `https://api.mymemory.translated.net/get?langpair=${encodeURIComponent(`uz|${code}`)}&q=${encodeURIComponent(source.slice(0, 450))}`,
  ];

  for (const url of tryUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const payload = await response.json();
      const translated = String(
        payload?.success === false ? "" : payload?.data || payload?.responseData?.translatedText || "",
      ).trim();
      if (!translated || /MYMEMORY WARNING/i.test(translated) || translated === source) continue;
      memory.set(key, translated);
      writeStore(key, translated);
      return translated;
    } catch {
      /* next */
    }
  }
  return source;
}

async function translateLong(text: string, lang: string): Promise<string> {
  const source = String(text || "").trim();
  if (source.length <= 450) return translateChunk(source, lang);
  const parts = [];
  for (let index = 0; index < source.length; index += 420) {
    parts.push(await translateChunk(source.slice(index, index + 420), lang));
  }
  return parts.join(" ");
}

export async function localizeTelegramCards(items: NewsArticle[], lang: string): Promise<NewsArticle[]> {
  const code = lang.slice(0, 2);
  if (code === "uz") return items;
  const out = [];
  for (const item of items) {
    if (!isTelegramNewsSlug(item.slug)) {
      out.push(item);
      continue;
    }
    const title = await translateChunk(item.title, code);
    out.push({ ...item, title, translated: title !== item.title });
  }
  return out;
}

export async function localizeTelegramArticle(article: NewsArticle, lang: string): Promise<NewsArticle> {
  const code = lang.slice(0, 2);
  if (code === "uz" || !isTelegramNewsSlug(article.slug)) return article;
  const title = await translateChunk(article.title, code);
  const body = await translateLong(stripHtml(article.content), code);
  return {
    ...article,
    title,
    content: body
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${paragraph.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
      .join("") || article.content,
    translated: title !== article.title,
  };
}
