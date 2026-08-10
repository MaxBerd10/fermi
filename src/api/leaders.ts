import { apiClient } from "./client";
import type { LeadersResponse } from "../types/content";

export async function getLeaders(categorySlug: string, menuId?: number) {
  const { data } = await apiClient.get<LeadersResponse>(`leaders/${categorySlug}`, { menuId });
  return data;
}
