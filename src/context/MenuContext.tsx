import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMenu } from "../api/menu";
import type { MenuNode } from "../types/menu";
import i18n from "../i18n";

interface MenuContextValue {
  menu: MenuNode[];
  loading: boolean;
}

const MenuContext = createContext<MenuContextValue>({ menu: [], loading: true });

function menuCacheKey() {
  return `fjsti_menu_cache_${i18n.language?.slice(0, 2) || "uz"}`;
}

// Language switches reload the whole page (see Navbar's changeLanguage), so reading this
// once at module load — rather than re-deriving it per render — is enough to seed state.
function readMenuCache(): MenuNode[] | null {
  try {
    const raw = localStorage.getItem(menuCacheKey());
    return raw ? (JSON.parse(raw) as MenuNode[]) : null;
  } catch {
    return null;
  }
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const cached = readMenuCache();
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
        try {
          localStorage.setItem(menuCacheKey(), JSON.stringify(data));
        } catch {
          // Storage full or unavailable — the cache is just a speed optimization.
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <MenuContext.Provider value={{ menu, loading }}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  return useContext(MenuContext);
}
