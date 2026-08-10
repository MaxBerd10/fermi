import { apiClient } from "./client";
import type { HomeData } from "../types/content";

export async function getHomeData() {
  const { data } = await apiClient.get<HomeData>("home");
  return data;
}
