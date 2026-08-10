export interface AdminMenuNode {
  id: number;
  titleUz: string;
  titleRu: string | null;
  titleEn: string | null;
  urlType: string;
  urlValue: string | null;
  status: number;
  active: number;
  disabled: number;
  lvl: number;
  children: AdminMenuNode[];
}
