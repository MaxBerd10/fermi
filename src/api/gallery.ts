import { apiClient } from "./client";
import type { GalleryImage } from "../types/content";

export async function listGallery(page = 1) {
  return apiClient.get<GalleryImage[]>("gallery", { page });
}

export async function getFullGallery(id: number) {
  const { data } = await apiClient.get<GalleryImage>(`gallery/full/${id}`);
  return data;
}
