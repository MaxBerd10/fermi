import { apiClient } from "./client";
import type { MenuNode } from "../types/menu";

export async function getMenu() {
  const { data } = await apiClient.get<MenuNode[]>("menu");
  return data;
}
