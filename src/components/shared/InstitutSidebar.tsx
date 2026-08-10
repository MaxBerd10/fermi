import { Link } from "react-router-dom";
import {
  buildSubMenuHref,
  isSamePageSlug,
  normalizeYearLabels,
} from "@/lib/siteConstants";

type SubMenu = { id: number; title: string; urlType: string; urlValue: string };

export default function InstitutSidebar({
  menuId,
  menuTitle,
  subMenus,
  currentSlug,
}: {
  menuId: number;
  menuTitle: string;
  subMenus: SubMenu[];
  currentSlug: string;
}) {
  return (
    <nav className="cms-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto" aria-label={menuTitle}>
      <div className="cms-sidebar__head">{normalizeYearLabels(menuTitle)}</div>
      <ul>
        {subMenus.map((s) => {
          const active = isSamePageSlug(s.urlValue, currentSlug);
          const href = buildSubMenuHref(menuId, s);
          return (
            <li key={s.id}>
              <Link to={href} className={`cms-sidebar__link ${active ? "cms-sidebar__link--active" : ""}`}>
                {normalizeYearLabels(s.title)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
