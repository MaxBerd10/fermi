import { apiClient } from "./client";
import type { VideoItem } from "../types/content";

export async function listVideo(page = 1) {
  return apiClient.get<VideoItem[]>("video", { page });
}
