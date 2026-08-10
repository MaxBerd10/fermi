import { apiClient } from "./client";
import type { About, Page } from "../types/content";

export async function getAbout(slug: string) {
  const { data } = await apiClient.get<About>(`about/${slug}`);
  return data;
}

export async function getPage(slug: string, menuId?: number) {
  const { data } = await apiClient.get<Page>(`pages/${slug}`, { menuId });
  return data;
}
