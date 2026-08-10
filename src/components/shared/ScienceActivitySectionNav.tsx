import { Link, useLocation } from "react-router-dom";
import { useScienceActivitySectionNav } from "@/hooks/useScienceActivitySectionNav";
import {
  isScienceActivityNavItemActive,
  resolveScienceActivityNavHref,
} from "@/lib/scienceActivitySection";
import { normalizeYearLabels } from "@/lib/siteConstants";

export default function ScienceActivitySectionNav({ currentSlug }: { currentSlug?: string }) {
  const { pathname } = useLocation();
  const { title, items } = useScienceActivitySectionNav();

  return (
    <nav
      className="cms-sidebar science-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      aria-label={title}
    >
      <div className="cms-sidebar__head">{normalizeYearLabels(title)}</div>
      <ul>
        {items.map((item) => {
          const href = resolveScienceActivityNavHref(item);
          const active = isScienceActivityNavItemActive(href, pathname, currentSlug);
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
