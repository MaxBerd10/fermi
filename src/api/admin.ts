import { apiClient } from "./client";
import type { ApiMeta } from "../types/api";

export interface AdminListResult<T> {
  items: T[];
  meta?: ApiMeta;
}

export interface AdminListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

/** Generic CRUD bound to one /v1/admin/<resource> endpoint (see api/controllers/BaseAdminController.php). */
export function adminResource<T extends { id: number }>(resource: string) {
  return {
    list: async (params?: AdminListParams): Promise<AdminListResult<T>> => {
      const { data, meta } = await apiClient.get<T[]>(`admin/${resource}`, params, true);
      return { items: data, meta };
    },
    get: async (id: number): Promise<T> => {
      const { data } = await apiClient.get<T>(`admin/${resource}/${id}`, undefined, true);
      return data;
    },
    create: async (payload: Partial<T>): Promise<T> => {
      const { data } = await apiClient.post<T>(`admin/${resource}`, payload, true);
      return data;
    },
    update: async (id: number, payload: Partial<T>): Promise<T> => {
      const { data } = await apiClient.put<T>(`admin/${resource}/${id}`, payload, true);
      return data;
    },
    remove: async (id: number): Promise<void> => {
      await apiClient.del(`admin/${resource}/${id}`, true);
    },
  };
}

export interface UploadResult {
  path: string;
  url: string;
}

export async function uploadMedia(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.postForm<UploadResult>("admin/media/upload", formData, true);
  return data;
}
