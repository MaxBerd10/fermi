import type { NewsArticle } from "../types/content";
import { ApiError } from "../types/api";
import i18n from "../i18n";

function activeLang() {
  return (i18n.resolvedLanguage || i18n.language || "uz").slice(0, 2);
}

async function readEnvelope<T>(response: Response): Promise<T> {
  const envelope = (await response.json()) as {
    success: boolean;
    data?: T;
    error?: { message?: string; code?: string };
  };

  if (!envelope.success || envelope.data === undefined) {
    throw new ApiError(envelope.error?.message || "Telegram oqimi olinmadi", envelope.error?.code || "TELEGRAM", response.status);
  }

  return envelope.data;
}

export async function listTelegramNews(): Promise<NewsArticle[]> {
  const lang = activeLang();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), lang === "uz" ? 4000 : 20000);
  try {
    const response = await fetch(`/telegram-feed?lang=${encodeURIComponent(lang)}`, {
      signal: controller.signal,
      cache: lang === "uz" ? "default" : "no-store",
    });
    return await readEnvelope<NewsArticle[]>(response);
  } finally {
    window.clearTimeout(timer);
  }
}

export async function getTelegramArticle(slug: string): Promise<NewsArticle> {
  const lang = activeLang();
  const response = await fetch(`/telegram-feed/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`, {
    cache: "no-store",
  });
  return readEnvelope<NewsArticle>(response);
}
