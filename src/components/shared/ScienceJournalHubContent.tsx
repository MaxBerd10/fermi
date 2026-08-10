import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";

function extractJournalCover(html: string): { image: string | null; issueUrl: string | null } {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const linkMatch = html.match(/<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>[\s\S]*?<img/i);
  return {
    image: imgMatch?.[1] ?? null,
    issueUrl: linkMatch?.[1] ?? null,
  };
}

export default function ScienceJournalHubContent({
  html,
  pdfUrl,
}: {
  html: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const { image, issueUrl } = useMemo(() => extractJournalCover(html), [html]);

  return (
    <div className="cms-science cms-science--journal">
      {image && (
        <figure className="cms-science-journal__cover">
          {issueUrl ? (
            <a href={issueUrl} target="_blank" rel="noopener noreferrer">
              <img src={image} alt={t("science.journalCoverAlt")} loading="lazy" />
            </a>
          ) : (
            <img src={image} alt={t("science.journalCoverAlt")} loading="lazy" />
          )}
        </figure>
      )}

      <div className="cms-science-journal__links">
        {issueUrl && (
          <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="cms-science-journal__cta">
            <i className="ri-book-2-line" aria-hidden />
            {t("science.openLatestIssue")}
          </a>
        )}
        <Link to="/blog/283/jurnal-xaqida" className="cms-science-journal__cta cms-science-journal__cta--secondary">
          <i className="ri-arrow-right-line" aria-hidden />
          {t("science.journalSectionLink")}
        </Link>
      </div>

      {pdfUrl && (
        <div className="cms-science__primary">
          <h3 className="cms-science__primary-title">{t("science.journalAccreditation")}</h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("science.journalAccreditation")} interactive />
        </div>
      )}
    </div>
  );
}
