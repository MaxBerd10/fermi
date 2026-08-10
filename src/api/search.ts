import { apiClient } from "./client";
import type { SearchResults } from "../types/content";

export async function search(q: string, page = 1) {
  return apiClient.get<SearchResults>("search", { q, page });
}
