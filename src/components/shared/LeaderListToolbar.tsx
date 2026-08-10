import { useTranslation } from "react-i18next";

export default function LeaderListToolbar({
  query,
  onQueryChange,
  total,
  filtered,
  showSearch = true,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  total: number;
  filtered: number;
  showSearch?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="leader-toolbar">
      <div className="leader-toolbar__meta">
        <span className="leader-toolbar__badge">
          <i className="ri-team-line" aria-hidden />
          {t("leader.count", { count: total })}
        </span>
        {query.trim() && filtered !== total && (
          <span className="leader-toolbar__filtered">
            {t("leader.filteredCount", { count: filtered })}
          </span>
        )}
      </div>

      {showSearch && (
        <div className="leader-search leader-search--toolbar">
          <label htmlFor="leader-search" className="sr-only">
            {t("leader.searchPlaceholder")}
          </label>
          <input
            id="leader-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("leader.searchPlaceholder")}
            className="leader-search__input"
          />
        </div>
      )}
    </div>
  );
}
