import { apiClient } from "./client";
import type { MenuNode } from "../types/menu";

export async function getMenu(lang?: string) {
  const { data } = await apiClient.get<MenuNode[]>("menu", lang ? { lang } : undefined);
  return data;
}
