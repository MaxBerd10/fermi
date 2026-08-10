import { apiClient } from "./client";
import type { AdminMenuNode } from "@/admin/menuTypes";

export async function getMenuTree(): Promise<AdminMenuNode[]> {
  const { data } = await apiClient.get<AdminMenuNode[]>("admin/menu-tree", undefined, true);
  return data;
}

export interface MenuNodeInput {
  parentId?: number | null;
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
  url_type?: string;
  url_value?: string;
  status?: number;
  active?: number;
  disabled?: number;
}

export async function createMenuNode(input: MenuNodeInput): Promise<AdminMenuNode> {
  const { data } = await apiClient.post<AdminMenuNode>("admin/menu-tree", input, true);
  return data;
}

export async function updateMenuNode(id: number, input: MenuNodeInput): Promise<AdminMenuNode> {
  const { data } = await apiClient.put<AdminMenuNode>(`admin/menu-tree/${id}`, input, true);
  return data;
}

export async function deleteMenuNode(id: number): Promise<void> {
  await apiClient.del(`admin/menu-tree/${id}`, true);
}

export type MovePosition = "before" | "after" | "child";

export async function moveMenuNode(id: number, targetId: number, position: MovePosition): Promise<void> {
  await apiClient.post(`admin/menu-tree/${id}/move`, { targetId, position }, true);
}
