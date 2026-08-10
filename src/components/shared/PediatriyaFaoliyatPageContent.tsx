import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { getFacultyPageConfig } from "@/lib/facultySection";
import { parsePediatriyaFaoliyatContent } from "@/lib/parsePediatriyaFaoliyatContent";

export default function PediatriyaFaoliyatPageContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parsePediatriyaFaoliyatContent(html), [html]);
  const facultyStats = getFacultyPageConfig("pediatriya-fakulteti").stats;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="cms-science cms-science--pediatriya-faoliyat">
      {facultyStats.length > 0 && (
        <div className="cms-ped-faoliyat-stats" role="list">
          {facultyStats.map((stat) => (
            <div key={stat.labelKey} className="cms-ped-faoliyat-stat" role="listitem">
              <span className="cms-ped-faoliyat-stat__icon" aria-hidden>
                <i className={stat.icon} />
              </span>
              <div className="cms-ped-faoliyat-stat__body">
                <span className="cms-ped-faoliyat-stat__value">{stat.value}</span>
                <span className="cms-ped-faoliyat-stat__label">{t(stat.labelKey)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cms-ped-faoliyat-grid">
        {parsed.sections.map((section) => (
          <article key={section.title} className="cms-ped-faoliyat-card">
            <header className="cms-ped-faoliyat-card__head">
              <span className="cms-ped-faoliyat-card__icon" aria-hidden>
                <i className={section.icon} />
              </span>
              <h3 className="cms-ped-faoliyat-card__title">{section.title}</h3>
            </header>
            <p className="cms-ped-faoliyat-card__body">{section.body}</p>
            {section.document && (
              <div className="cms-ped-faoliyat-card__doc">
                <p className="cms-ped-faoliyat-card__doc-title">
                  <i className="ri-file-pdf-line" aria-hidden />
                  {section.document.title}
                </p>
                <div className="cms-ped-faoliyat-card__actions">
                  <button
                    type="button"
                    className="cms-science-btn cms-science-btn--primary"
                    onClick={() => setPreviewUrl(section.document!.url)}
                  >
                    <i className="ri-eye-line" aria-hidden />
                    {t("science.viewDocument")}
                  </button>
                  <a
                    href={section.document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cms-science-btn"
                  >
                    <i className="ri-download-2-line" aria-hidden />
                    {t("science.downloadDocument")}
                  </a>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

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
    </div>
  );
}
