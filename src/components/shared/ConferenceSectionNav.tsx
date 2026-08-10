import { Link, useLocation } from "react-router-dom";
import { useConferenceSectionNav } from "@/hooks/useConferenceSectionNav";
import { isConferenceNavItemActive } from "@/lib/conferenceSection";
import { normalizeMenuHref, normalizeYearLabels } from "@/lib/siteConstants";

export default function ConferenceSectionNav({ currentSlug }: { currentSlug?: string }) {
  const { pathname } = useLocation();
  const { title, items } = useConferenceSectionNav();

  return (
    <nav
      className="cms-sidebar conference-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      aria-label={title}
    >
      <div className="cms-sidebar__head">{normalizeYearLabels(title)}</div>
      <ul>
        {items.map((item) => {
          const href = normalizeMenuHref(item.href);
          const active = isConferenceNavItemActive(href, pathname, currentSlug);
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
