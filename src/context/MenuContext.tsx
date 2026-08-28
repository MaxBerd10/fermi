import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getMenu } from "../api/menu";
import type { MenuNode } from "../types/menu";
import i18n from "../i18n";
import { navItems } from "../mocks/homeData";

interface MenuContextValue {
  menu: MenuNode[];
  loading: boolean;
}

const MenuContext = createContext<MenuContextValue>({ menu: [], loading: true });

const SUPPORTED_LANGS = ["uz", "ru", "en"];

type FallbackMenuItem = {
  label: string;
  href: string;
  children?: FallbackMenuItem[];
};

let fallbackId = -1000;
function asMenuNodes(items: FallbackMenuItem[]): MenuNode[] {
  return items.map((item) => ({
    id: fallbackId--,
    title: item.label,
    urlType: "",
    urlValue: "",
    href: item.href,
    children: asMenuNodes(item.children ?? []),
  }));
}

// A navigation outage must not leave the header with only Test and Keyslar.
// The API remains the source of truth; this list is used only if it is unavailable.
const FALLBACK_MENU = asMenuNodes(navItems as FallbackMenuItem[]);

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
  const hasCachedMenu = useRef(cached !== null).current;
  // Seeding from cache means the navbar renders its links immediately on repeat visits
  // instead of sitting empty for the length of the /menu request; the fetch below still
  // runs in the background so the cache — and the menu shown — stays current.
  const [menu, setMenu] = useState<MenuNode[]>(cached ?? FALLBACK_MENU);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    let cancelled = false;
    getMenu()
      .then((data) => {
        if (cancelled) return;
        setMenu(data);
        writeMenuCache(lang, data);
      })
      .catch(() => {
        if (!cancelled && !hasCachedMenu) setMenu(FALLBACK_MENU);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, hasCachedMenu]);

  useEffect(() => {
    // Language switches do a full page reload (see Navbar's changeLanguage), so the first
    // switch to a language with no cache yet sits on an empty navbar for the request's
    // duration. Quietly warm the other languages' caches in the background so that by the
    // time someone switches, the menu is already there.
    let cancelled = false;
    for (const otherLang of SUPPORTED_LANGS) {
      if (otherLang === lang || readMenuCache(otherLang)) continue;
      getMenu(otherLang)
        .then((data) => {
          if (!cancelled) writeMenuCache(otherLang, data);
        })
        .catch(() => {
          // The active language already has a visible fallback. Other caches
          // can be refreshed once the menu endpoint is available again.
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
