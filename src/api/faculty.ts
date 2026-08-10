import { apiClient } from "./client";
import type { FacultyDetail, FacultyListItem } from "../types/content";

export async function listFaculty() {
  const { data } = await apiClient.get<FacultyListItem[]>("faculty");
  return data;
}

export async function getFaculty(slug: string, menuId?: number) {
  const { data } = await apiClient.get<FacultyDetail>(`faculty/${slug}`, { menuId });
  return data;
}
