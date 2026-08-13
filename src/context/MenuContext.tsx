import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMenu } from "../api/menu";
import type { MenuNode } from "../types/menu";
import i18n from "../i18n";

interface MenuContextValue {
  menu: MenuNode[];
  loading: boolean;
}

const MenuContext = createContext<MenuContextValue>({ menu: [], loading: true });

const SUPPORTED_LANGS = ["uz", "ru", "en"];

function menuCacheKey(lang: string) {
  return `fjsti_menu_cache_${lang}`;
}

function currentLang() {
  return i18n.language?.slice(0, 2) || "uz";
}

// Language switches reload the whole page (see Navbar's changeLanguage), so reading this
// once at module load — rather than re-deriving it per render — is enough to seed state.
function readMenuCache(lang: string): MenuNode[] | null {
  try {
    const raw = localStorage.getItem(menuCacheKey(lang));
    return raw ? (JSON.parse(raw) as MenuNode[]) : null;
  } catch {
    return null;
  }
}

function writeMenuCache(lang: string, data: MenuNode[]) {
  try {
    localStorage.setItem(menuCacheKey(lang), JSON.stringify(data));
  } catch {
    // Storage full or unavailable — the cache is just a speed optimization.
  }
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const lang = currentLang();
  const cached = readMenuCache(lang);
  // Seeding from cache means the navbar renders its links immediately on repeat visits
  // instead of sitting empty for the length of the /menu request; the fetch below still
  // runs in the background so the cache — and the menu shown — stays current.
  const [menu, setMenu] = useState<MenuNode[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    let cancelled = false;
    getMenu()
      .then((data) => {
        if (cancelled) return;
        setMenu(data);
        writeMenuCache(lang, data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    // Language switches do a full page reload (see Navbar's changeLanguage), so the first
    // switch to a language with no cache yet sits on an empty navbar for the request's
    // duration. Quietly warm the other languages' caches in the background so that by the
    // time someone switches, the menu is already there.
    let cancelled = false;
    for (const otherLang of SUPPORTED_LANGS) {
      if (otherLang === lang || readMenuCache(otherLang)) continue;
      getMenu(otherLang).then((data) => {
        if (!cancelled) writeMenuCache(otherLang, data);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return <MenuContext.Provider value={{ menu, loading }}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  return useContext(MenuContext);
}
