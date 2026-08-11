import type { TFunction } from "i18next";
import type { Region } from "@/types/content";

/**
 * The /regions API ignores `lang` and always returns Uzbek names, so the
 * fixed list of 14 Uzbekistan regions is translated here by id instead.
 * Any region id without a matching key (e.g. a future 15th region) just
 * falls back to whatever the API sent.
 */
export function translateRegionName(region: Region, t: TFunction): string {
  const key = `region.${region.id}`;
  const translated = t(key);
  return translated === key ? region.name : translated;
}
