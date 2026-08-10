import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMenu } from "@/context/MenuContext";
import {
  isMenuSectionLinkActive,
  resolveMenuSection,
  type MenuSectionLink,
} from "@/lib/menuSection";
import { normalizeYearLabels } from "@/lib/siteConstants";

export default function MenuSectionNav({
  menuId,
  currentSlug,
}: {
  menuId: number;
  currentSlug?: string;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { menu } = useMenu();
  const [query, setQuery] = useState("");

  const section = useMemo(
    () => resolveMenuSection(menu, menuId, currentSlug),
    [menu, menuId, currentSlug],
  );

  const filteredLinks = useMemo(() => {
    if (!section) return [];
    const q = query.trim().toLowerCase();
    if (!q) return section.links;
    return section.links.filter((l) => l.title.toLowerCase().includes(q));
  }, [section, query]);

  if (!section) return null;

  const showSearch = section.links.length >= 12;

  return (
    <nav
      className={`cms-sidebar menu-sidebar menu-sidebar--${section.theme} sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden flex flex-col`}
      aria-label={section.title}
    >
      <div className="cms-sidebar__head">{normalizeYearLabels(section.title)}</div>

      {showSearch && (
        <div className="menu-sidebar__search-wrap">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("nav.menuSearchPlaceholder")}
            className="menu-sidebar__search"
            aria-label={t("nav.menuSearchPlaceholder")}
          />
        </div>
      )}

      <ul className="menu-sidebar__list overflow-y-auto flex-1 min-h-0">
        {filteredLinks.map((link) => (
          <MenuLinkItem
            key={link.id}
            link={link}
            active={isMenuSectionLinkActive(link, pathname, currentSlug)}
          />
        ))}
        {filteredLinks.length === 0 && (
          <li className="menu-sidebar__empty">{t("leader.noSearchResults")}</li>
        )}
      </ul>
    </nav>
  );
}

function MenuLinkItem({ link, active }: { link: MenuSectionLink; active: boolean }) {
  return (
    <li>
      <Link
        to={link.href}
        className={`cms-sidebar__link menu-sidebar__link ${active ? "cms-sidebar__link--active" : ""}`}
        style={{ paddingLeft: `calc(1.25rem + ${link.depth * 0.65}rem)` }}
      >
        {normalizeYearLabels(link.title)}
      </Link>
    </li>
  );
}
