import { apiClient } from "./client";
import type { SitemapNode } from "../types/content";

export async function getSitemap() {
  const { data } = await apiClient.get<SitemapNode[]>("sitemap");
  return data;
}
