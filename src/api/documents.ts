import { apiClient } from "./client";
import type { DocumentDetail } from "../types/content";

export async function getDocuments(slug: string, menuId?: number) {
  const { data } = await apiClient.get<DocumentDetail>(`documents/${slug}`, { menuId });
  return data;
}
