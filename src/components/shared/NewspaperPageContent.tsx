import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { parseNewspaperContent } from "@/lib/parseNewspaperContent";
import {
  NEWSPAPER_MAIN_SLUG,
  getNewspaperArchiveYear,
} from "@/lib/newspaperSection";

export default function NewspaperPageContent({
  html,
  slug,
  pdfUrl,
}: {
  html: string;
  slug?: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseNewspaperContent(html), [html]);
  const year = getNewspaperArchiveYear(slug);
  const isMain = slug === NEWSPAPER_MAIN_SLUG;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const issueCountLabel = t("newspaper.issuesCount", { count: parsed.issues.length });

  const fileInIssues = Boolean(pdfUrl && parsed.issues.some((i) => i.url === pdfUrl));
  const showLatestPdf =
    Boolean(pdfUrl) && !fileInIssues && previewUrl === null && (isMain || parsed.issues.length === 0);

  return (
    <div className="cms-newspaper">
      {isMain && (
        <div className="cms-newspaper__about">
          <span className="cms-newspaper__badge">
            <i className="ri-newspaper-line" aria-hidden />
            {t("newspaper.badge")}
          </span>
          <h2 className="cms-newspaper__about-title">{t("newspaper.aboutTitle")}</h2>
          <p className="cms-newspaper__about-lead">{t("newspaper.aboutLead")}</p>
        </div>
      )}

      {parsed.coverImage && (
        <figure className="cms-newspaper__cover">
          <img src={parsed.coverImage} alt={t("newspaper.coverAlt")} loading="lazy" />
        </figure>
      )}

      {(year || parsed.issues.length > 0) && (
        <div className="cms-newspaper__head">
          {year && <span className="cms-newspaper__year">{year}</span>}
          {parsed.issues.length > 0 && (
            <span className="cms-newspaper__count">{issueCountLabel}</span>
          )}
        </div>
      )}

      {parsed.issues.length > 0 && (
        <ul className="cms-newspaper__grid">
          {parsed.issues.map((issue, i) => (
            <li key={issue.url} className="cms-newspaper__issue">
              <div className="cms-newspaper__issue-head">
                <span className="cms-newspaper__issue-num">
                  {issue.issueNo ? `№${issue.issueNo}` : i + 1}
                </span>
                {issue.date && (
                  <time className="cms-newspaper__issue-date" dateTime={issue.date}>
                    {issue.date}
                  </time>
                )}
              </div>
              <p className="cms-newspaper__issue-label">
                {issue.date
                  ? t("newspaper.issueShort", { date: issue.date, number: issue.issueNo ?? String(i + 1) })
                  : issue.label}
              </p>
              <div className="cms-newspaper__issue-actions">
                <button
                  type="button"
                  className="cms-newspaper__btn cms-newspaper__btn--primary"
                  onClick={() => setPreviewUrl(issue.url)}
                >
                  <i className="ri-eye-line" aria-hidden />
                  {t("newspaper.viewIssue")}
                </button>
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cms-newspaper__btn"
                >
                  <i className="ri-download-2-line" aria-hidden />
                  {t("newspaper.downloadIssue")}
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {previewUrl && (
        <div className="cms-newspaper__preview">
          <div className="cms-newspaper__preview-head">
            <h3 className="cms-newspaper__preview-title">{t("newspaper.previewTitle")}</h3>
            <button
              type="button"
              className="cms-newspaper__preview-close"
              onClick={() => setPreviewUrl(null)}
            >
              <i className="ri-close-line" aria-hidden />
              {t("a11y.close")}
            </button>
          </div>
          <PdfDocumentViewer pdfUrl={previewUrl} title={t("newspaper.previewTitle")} interactive />
        </div>
      )}

      {showLatestPdf && pdfUrl && (
        <div className="cms-newspaper__latest">
          <h3 className="cms-newspaper__latest-title">
            {isMain ? t("newspaper.latestIssue") : t("newspaper.previewTitle")}
          </h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("newspaper.latestIssue")} interactive />
        </div>
      )}
    </div>
  );
}
