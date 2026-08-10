import { apiClient } from "./client";
import type { ConnectLeader, District, Quarter, Region } from "../types/content";

export async function getRegions() {
  const { data } = await apiClient.get<Region[]>("regions");
  return data;
}

export async function getDistricts(regionId: number) {
  const { data } = await apiClient.get<District[]>("districts", { regionId });
  return data;
}

export async function getQuarters(districtId: number) {
  const { data } = await apiClient.get<Quarter[]>("quarters", { districtId });
  return data;
}

export async function getConnectLeaders() {
  const { data } = await apiClient.get<ConnectLeader[]>("connect-leaders");
  return data;
}
