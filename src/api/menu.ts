import { apiClient } from "./client";
import type { MenuNode } from "../types/menu";
import i18n from "../i18n";

// CMS content gap: menu item id 442 ("Green university 2021-2026") has Uzbek and
// English titles filled in but was never given a Russian one, so the API falls
// back to the English text for lang=ru. Override here until it's filled in via
// the admin panel's menu editor (/admin/menu-tree) — remove this once that's done.
const RU_TITLE_OVERRIDES: Record<number, string> = {
  442: "Зелёный университет 2021-2026",
};

export async function getMenu(lang?: string) {
  const { data } = await apiClient.get<MenuNode[]>("menu", lang ? { lang } : undefined);
  const effectiveLang = (lang || i18n.language)?.slice(0, 2);
  if (effectiveLang !== "ru") return data;
  return data.map((node) => (RU_TITLE_OVERRIDES[node.id] ? { ...node, title: RU_TITLE_OVERRIDES[node.id] } : node));
}
