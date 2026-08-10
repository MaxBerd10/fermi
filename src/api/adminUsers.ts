import { apiClient } from "./client";
import type { ApiMeta } from "../types/api";

export interface AdminUserItem {
  id: number;
  username: string;
  email: string;
  status: number;
  role: "user" | "admin";
  createdAt: string | null;
}

export interface AdminUserInput {
  username?: string;
  email?: string;
  status?: number;
  role?: "user" | "admin";
  password?: string;
}

export async function listUsers(params: { page?: number; pageSize?: number; search?: string }) {
  const { data, meta } = await apiClient.get<AdminUserItem[]>("admin/users", params, true);
  return { items: data, meta: meta as ApiMeta | undefined };
}

export async function getUser(id: number) {
  const { data } = await apiClient.get<AdminUserItem>(`admin/users/${id}`, undefined, true);
  return data;
}

export async function createUser(input: AdminUserInput) {
  const { data } = await apiClient.post<AdminUserItem>("admin/users", input, true);
  return data;
}

export async function updateUser(id: number, input: AdminUserInput) {
  const { data } = await apiClient.put<AdminUserItem>(`admin/users/${id}`, input, true);
  return data;
}

export async function deleteUser(id: number) {
  await apiClient.del(`admin/users/${id}`, true);
}
