import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { parseAutoreferatContent } from "@/lib/parseAutoreferatContent";

export default function AutoreferatPageContent({
  html,
  archivePdfUrl,
}: {
  html: string;
  archivePdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const entries = useMemo(() => parseAutoreferatContent(html), [html]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="cms-science cms-science--autoreferat">
      <div className="cms-science__head">
        <span className="cms-science__badge">
          <i className="ri-book-open-line" aria-hidden />
          {t("science.autoreferatBadge")}
        </span>
        <span className="cms-science__count">{t("science.autoreferatCount", { count: entries.length })}</span>
      </div>

      {entries.length > 0 ? (
        <div className="cms-autoreferat-grid">
          {entries.map((entry) => (
            <article key={entry.url} className="cms-autoreferat-card">
              {entry.council && <p className="cms-autoreferat-card__council">{entry.council}</p>}
              <h3 className="cms-autoreferat-card__author">{entry.author}</h3>
              <p className="cms-autoreferat-card__topic">{entry.topic}</p>
              <div className="cms-science-card__actions">
                <button type="button" className="cms-science-btn cms-science-btn--primary" onClick={() => setPreviewUrl(entry.url)}>
                  <i className="ri-eye-line" aria-hidden />
                  {t("science.viewDocument")}
                </button>
                <a href={entry.url} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
                  <i className="ri-download-2-line" aria-hidden />
                  {t("science.downloadDocument")}
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="cms-science__empty">
          <i className="ri-book-open-line cms-science__empty-icon" aria-hidden />
          <h3 className="cms-science__empty-title">{t("science.autoreferatEmptyTitle")}</h3>
          <p className="cms-science__empty-text">{t("science.autoreferatEmptyText")}</p>
        </div>
      )}

      {previewUrl && (
        <div className="cms-science__preview">
          <div className="cms-science__preview-head">
            <h3 className="cms-science__preview-title">{t("science.previewTitle")}</h3>
            <button type="button" className="cms-science__preview-close" onClick={() => setPreviewUrl(null)}>
              <i className="ri-close-line" aria-hidden />
              {t("a11y.close")}
            </button>
          </div>
          <PdfDocumentViewer pdfUrl={previewUrl} title={t("science.previewTitle")} interactive />
        </div>
      )}

      {archivePdfUrl && (
        <div className="cms-science__primary">
          <h3 className="cms-science__primary-title">{t("council.downloadAutoreferatArchive")}</h3>
          <PdfDocumentViewer pdfUrl={archivePdfUrl} title={t("council.downloadAutoreferatArchive")} interactive />
        </div>
      )}
    </div>
  );
}
