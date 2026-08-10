import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useBuildingsSectionNav } from "@/hooks/useBuildingsSectionNav";
import {
  getBuildingsNavHref,
  getBuildingsSubView,
  isBuildingsNavItemActive,
} from "@/lib/buildingsSection";
import { normalizeYearLabels } from "@/lib/siteConstants";

export default function BuildingSectionNav({ currentSlug }: { currentSlug?: string }) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const subView = getBuildingsSubView(searchParams);
  const { title, items } = useBuildingsSectionNav();

  return (
    <nav
      className="cms-sidebar buildings-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      aria-label={title}
    >
      <div className="cms-sidebar__head">{normalizeYearLabels(title)}</div>
      <ul>
        {items.map((item) => {
          const href = getBuildingsNavHref(item);
          const active = isBuildingsNavItemActive(item, pathname, currentSlug, subView);
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
