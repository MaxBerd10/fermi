import { Link, useLocation } from "react-router-dom";
import { useCouncilSectionNav } from "@/hooks/useCouncilSectionNav";
import {
  isCouncilNavItemActive,
  isValidCouncilNavHref,
  resolveCouncilNavHref,
} from "@/lib/councilSection";
import { normalizeYearLabels } from "@/lib/siteConstants";

export default function CouncilSectionNav({ currentSlug }: { currentSlug?: string }) {
  const { pathname } = useLocation();
  const { title, items } = useCouncilSectionNav();

  return (
    <nav
      className="cms-sidebar council-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      aria-label={title}
    >
      <div className="cms-sidebar__head">{normalizeYearLabels(title)}</div>
      <ul>
        {items.map((item) => {
          const href = resolveCouncilNavHref(item);
          if (!isValidCouncilNavHref(item.href) && item.id !== 579) return null;

          const active =
            item.id === 579
              ? pathname.startsWith("/news/") && pathname.includes("tadbirlar")
              : isCouncilNavItemActive(href, pathname, currentSlug);

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
