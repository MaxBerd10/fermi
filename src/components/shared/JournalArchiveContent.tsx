import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseJournalArchiveTitles } from "@/lib/parseJournalArchive";

export default function JournalArchiveContent({
  html,
  year,
}: {
  html: string;
  year: string;
}) {
  const { t } = useTranslation();
  const titles = useMemo(() => parseJournalArchiveTitles(html), [html]);
  const countLabel = t("journal.articlesCount", { count: titles.length });

  return (
    <div className="cms-article cms-article--journal-archive">
      <div className="cms-journal-archive__head">
        <span className="cms-journal-archive__year">{year}</span>
        <span className="cms-journal-archive__count">{countLabel}</span>
      </div>

      <p className="cms-journal-archive__note">{t("journal.archiveLanguageNote")}</p>

      <ul className="cms-journal-archive__list">
        {titles.map((title, i) => (
          <li key={`${i}-${title.slice(0, 40)}`} className="cms-journal-archive__item">
            <span className="cms-journal-archive__num">{i + 1}</span>
            <span className="cms-journal-archive__title">{title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
