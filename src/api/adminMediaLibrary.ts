import { apiClient } from "./client";

export interface MediaFolder {
  name: string;
  path: string;
}

export interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  isImage: boolean;
}

export interface MediaListing {
  currentPath: string;
  parentPath: string | null;
  folders: MediaFolder[];
  files: MediaFile[];
}

export async function listMedia(path = ""): Promise<MediaListing> {
  const { data } = await apiClient.get<MediaListing>("admin/media/list", { path }, true);
  return data;
}
