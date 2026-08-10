import { apiClient } from "./client";
import type { CourseSchedule } from "../types/content";

export async function getSchedule() {
  const { data } = await apiClient.get<CourseSchedule[]>("schedule");
  return data;
}
