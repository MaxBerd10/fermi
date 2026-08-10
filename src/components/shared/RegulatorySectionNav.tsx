import { Link, useLocation } from "react-router-dom";
import { useRegulatorySectionNav } from "@/hooks/useRegulatorySectionNav";
import { isRegulatoryNavItemActive } from "@/lib/regulatorySection";
import { normalizeMenuHref, normalizeYearLabels } from "@/lib/siteConstants";

export default function RegulatorySectionNav({ currentSlug }: { currentSlug?: string }) {
  const { pathname } = useLocation();
  const { title, items } = useRegulatorySectionNav();

  return (
    <nav
      className="cms-sidebar regulatory-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      aria-label={title}
    >
      <div className="cms-sidebar__head">{normalizeYearLabels(title)}</div>
      <ul>
        {items.map((item) => {
          const href = normalizeMenuHref(item.href);
          const active = isRegulatoryNavItemActive(href, pathname, currentSlug);
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
