import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { parseConferenceContent, type ConferenceItem } from "@/lib/parseConferenceContent";

function ConferenceCard({
  item,
  index,
  onPreview,
}: {
  item: ConferenceItem;
  index: number;
  onPreview: (url: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <li className="cms-conference__item">
      <div className="cms-conference__item-icon" aria-hidden>
        <i className={item.isPdf ? "ri-file-pdf-line" : "ri-links-line"} />
      </div>
      <div className="cms-conference__item-body">
        <div className="cms-conference__item-meta">
          <span className="cms-conference__item-num">{index + 1}</span>
          {item.year && <span className="cms-conference__item-year">{item.year}</span>}
        </div>
        <p className="cms-conference__item-title">{item.title}</p>
        <div className="cms-conference__item-actions">
          {item.isPdf && (
            <button
              type="button"
              className="cms-conference__btn cms-conference__btn--primary"
              onClick={() => onPreview(item.url)}
            >
              <i className="ri-eye-line" aria-hidden />
              {t("conference.viewMaterial")}
            </button>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-conference__btn"
          >
            <i className="ri-download-2-line" aria-hidden />
            {t("conference.downloadMaterial")}
          </a>
        </div>
      </div>
    </li>
  );
}

export default function ConferencePageContent({
  html,
  slug,
  pdfUrl,
}: {
  html: string;
  slug?: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseConferenceContent(html), [html]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInList = Boolean(pdfUrl && parsed.items.some((i) => i.url === pdfUrl));
  const showPrimaryPdf = Boolean(pdfUrl) && !fileInList && !previewUrl;
  const isEmpty = parsed.items.length === 0 && !parsed.coverImage && !pdfUrl;

  return (
    <div className="cms-conference">
      {parsed.coverImage && (
        <figure className="cms-conference__cover">
          <img src={parsed.coverImage} alt={t("conference.coverAlt")} loading="lazy" />
        </figure>
      )}

      {parsed.items.length > 0 && (
        <div className="cms-conference__head">
          <span className="cms-conference__badge">
            <i className="ri-presentation-line" aria-hidden />
            {t("conference.materialsBadge")}
          </span>
          <span className="cms-conference__count">
            {t("conference.materialsCount", { count: parsed.items.length })}
          </span>
        </div>
      )}

      {parsed.items.length > 0 && (
        <ul className="cms-conference__list">
          {parsed.items.map((item, index) => (
            <ConferenceCard key={item.url} item={item} index={index} onPreview={setPreviewUrl} />
          ))}
        </ul>
      )}

      {isEmpty && (
        <div className="cms-conference__empty">
          <i className="ri-trophy-line cms-conference__empty-icon" aria-hidden />
          <h3 className="cms-conference__empty-title">
            {slug === "fan-olimpiadalari"
              ? t("conference.emptyOlympiadsTitle")
              : t("conference.emptyTitle")}
          </h3>
          <p className="cms-conference__empty-text">
            {slug === "fan-olimpiadalari"
              ? t("conference.emptyOlympiadsText")
              : t("conference.emptyText")}
          </p>
        </div>
      )}

      {previewUrl && (
        <div className="cms-conference__preview">
          <div className="cms-conference__preview-head">
            <h3 className="cms-conference__preview-title">{t("conference.previewTitle")}</h3>
            <button type="button" className="cms-conference__preview-close" onClick={() => setPreviewUrl(null)}>
              <i className="ri-close-line" aria-hidden />
              {t("a11y.close")}
            </button>
          </div>
          <PdfDocumentViewer pdfUrl={previewUrl} title={t("conference.previewTitle")} interactive />
        </div>
      )}

      {showPrimaryPdf && pdfUrl && (
        <div className="cms-conference__primary">
          <h3 className="cms-conference__primary-title">{t("conference.latestMaterial")}</h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("conference.latestMaterial")} interactive />
        </div>
      )}
    </div>
  );
}
