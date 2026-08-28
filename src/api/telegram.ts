import type { NewsArticle } from "../types/content";
import { ApiError } from "../types/api";
import i18n from "../i18n";

function activeLang() {
  return i18n.language?.slice(0, 2) || "uz";
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
  const response = await fetch(`/telegram-feed?lang=${encodeURIComponent(activeLang())}`);
  return readEnvelope<NewsArticle[]>(response);
}

export async function getTelegramArticle(slug: string): Promise<NewsArticle> {
  const response = await fetch(`/telegram-feed/${encodeURIComponent(slug)}?lang=${encodeURIComponent(activeLang())}`);
  return readEnvelope<NewsArticle>(response);
}
