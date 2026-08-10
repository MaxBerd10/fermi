import { Link, useLocation } from "react-router-dom";
import { useLeaderSectionNav } from "@/hooks/useLeaderSectionNav";
import { isLeaderNavItemActive } from "@/lib/leaderSection";
import { normalizeMenuHref, normalizeYearLabels } from "@/lib/siteConstants";

export default function LeaderSectionNav({ currentSlug }: { currentSlug?: string }) {
  const { pathname } = useLocation();
  const { title, items } = useLeaderSectionNav();

  if (items.length === 0) return null;

  return (
    <nav
      className="cms-sidebar leader-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      aria-label={title}
    >
      <div className="cms-sidebar__head">{normalizeYearLabels(title)}</div>
      <ul>
        {items.map((item) => {
          const href = normalizeMenuHref(item.href);
          const active = isLeaderNavItemActive(item, pathname, currentSlug);
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
