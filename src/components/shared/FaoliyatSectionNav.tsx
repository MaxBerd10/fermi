import { Link, useLocation } from "react-router-dom";
import { useFaoliyatSectionNav } from "@/hooks/useFaoliyatSectionNav";
import { isFaoliyatNavItemActive, resolveFaoliyatNavHref } from "@/lib/faoliyatSection";
import { normalizeYearLabels } from "@/lib/siteConstants";

export default function FaoliyatSectionNav({
  menuId,
  currentSlug,
}: {
  menuId: number;
  currentSlug?: string;
}) {
  const { pathname } = useLocation();
  const { title, items } = useFaoliyatSectionNav(menuId);

  return (
    <nav
      className="cms-sidebar faoliyat-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      aria-label={title}
    >
      <div className="cms-sidebar__head">{normalizeYearLabels(title)}</div>
      <ul>
        {items.map((item) => {
          const href = resolveFaoliyatNavHref(item, menuId);
          if (!href || href === "#" || href.endsWith("/#")) return null;

          const active = isFaoliyatNavItemActive(href, pathname, currentSlug);
          return (
            <li key={item.id}>
              <Link to={href} className={`cms-sidebar__link ${active ? "cms-sidebar__link--active" : ""}`}>
                {normalizeYearLabels(item.title)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
