import { apiClient } from "./client";
import type { SiteSettings } from "../types/content";

export async function getSettings() {
  const { data } = await apiClient.get<SiteSettings>("settings");
  return data;
}
