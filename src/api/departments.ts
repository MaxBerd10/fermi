import { apiClient } from "./client";
import type { DepartmentDetail, DepartmentListItem } from "../types/content";

export async function listDepartments() {
  const { data } = await apiClient.get<DepartmentListItem[]>("departments");
  return data;
}

export async function getDepartment(slug: string, menuId?: number) {
  const { data } = await apiClient.get<DepartmentDetail>(`departments/${slug}`, { menuId });
  return data;
}
