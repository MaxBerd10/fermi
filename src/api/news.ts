import { apiClient } from "./client";
import type { NewsArticle, NewsCategoryRef } from "../types/content";
import {
  enrichNewsArticle,
  enrichNewsArticles,
  normalizeNewsCategorySlug,
} from "@/lib/newsImages";

export async function listNews(page = 1, menuId?: number) {
  const res = await apiClient.get<NewsArticle[]>("news", { page, menuId });
  return { ...res, data: enrichNewsArticles(res.data) };
}

export async function getNewsCategory(slug: string, page = 1, menuId?: number) {
  const apiSlug = normalizeNewsCategorySlug(slug);
  const res = await apiClient.get<{
    category: NewsCategoryRef;
    menuId: number | null;
    items: NewsArticle[];
  }>(`news/category/${apiSlug}`, { page, menuId });

  return {
    ...res,
    data: {
      ...res.data,
      items: enrichNewsArticles(res.data.items),
    },
  };
}

export async function getNewsArticle(slug: string, menuId?: number) {
  const { data } = await apiClient.get<NewsArticle>(`news/${slug}`, { menuId });
  return enrichNewsArticle(data);
}
