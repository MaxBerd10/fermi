import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import {
  parseCouncilDecisionsContent,
  type CouncilDecisionItem,
} from "@/lib/parseCouncilDecisionsContent";

function DecisionRow({
  item,
  index,
  onPreview,
}: {
  item: CouncilDecisionItem;
  index: number;
  onPreview: (url: string) => void;
}) {
  const { t } = useTranslation();
  const clickable = Boolean(item.url);

  return (
    <li className="cms-science-decision">
      <span className="cms-science-decision__num">{index + 1}</span>
      <div className="cms-science-decision__body">
        {clickable ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="cms-science-decision__title">
            {item.title}
          </a>
        ) : (
          <p className="cms-science-decision__title">{item.title}</p>
        )}
        {item.isPdf && item.url && (
          <div className="cms-science-decision__actions">
            <button type="button" className="cms-science-btn cms-science-btn--primary" onClick={() => onPreview(item.url!)}>
              <i className="ri-eye-line" aria-hidden />
              {t("science.viewDocument")}
            </button>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
              <i className="ri-download-2-line" aria-hidden />
              {t("science.downloadDocument")}
            </a>
          </div>
        )}
      </div>
    </li>
  );
}

export default function CouncilDecisionsPageContent({
  html,
  pdfUrl,
}: {
  html: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseCouncilDecisionsContent(html), [html]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="cms-science cms-science--decisions">
      {parsed.coverImage && (
        <figure className="cms-science__cover">
          <img src={parsed.coverImage} alt={t("science.councilCoverAlt")} loading="lazy" />
        </figure>
      )}

      {parsed.items.length > 0 && (
        <div className="cms-science__head">
          <span className="cms-science__badge">
            <i className="ri-file-list-3-line" aria-hidden />
            {t("science.decisionsBadge")}
          </span>
          <span className="cms-science__count">{t("science.decisionsCount", { count: parsed.items.length })}</span>
        </div>
      )}

      {parsed.items.length > 0 && (
        <ul className="cms-science-decisions">
          {parsed.items.map((item, index) => (
            <DecisionRow key={`${item.title}-${index}`} item={item} index={index} onPreview={setPreviewUrl} />
          ))}
        </ul>
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

      {pdfUrl && (
        <div className="cms-science__primary">
          <h3 className="cms-science__primary-title">{t("science.latestDecision")}</h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("science.latestDecision")} interactive />
        </div>
      )}
    </div>
  );
}
