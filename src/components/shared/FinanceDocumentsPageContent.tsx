import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { parseFinanceDocumentsContent, type FinanceDocument } from "@/lib/parseFinanceDocumentsContent";
import { isFinanceSpreadsheet } from "@/lib/parseFinanceDocumentsContent";

function FinanceDocRow({
  doc,
  index,
  onPreview,
}: {
  doc: FinanceDocument;
  index: number;
  onPreview: (url: string) => void;
}) {
  const { t } = useTranslation();
  const icon = doc.isExcel ? "ri-file-excel-2-line" : doc.isPdf ? "ri-file-pdf-line" : "ri-file-download-line";

  return (
    <li className="cms-finance-doc">
      <div className="cms-finance-doc__icon" aria-hidden>
        <i className={icon} />
      </div>
      <div className="cms-finance-doc__body">
        <span className="cms-finance-doc__num">{index + 1}</span>
        <p className="cms-finance-doc__title">{doc.title}</p>
        <div className="cms-finance-doc__actions">
          {doc.isPdf && (
            <button type="button" className="cms-science-btn cms-science-btn--primary" onClick={() => onPreview(doc.url)}>
              <i className="ri-eye-line" aria-hidden />
              {t("science.viewDocument")}
            </button>
          )}
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
            <i className="ri-download-2-line" aria-hidden />
            {t("science.downloadDocument")}
          </a>
        </div>
      </div>
    </li>
  );
}

export default function FinanceDocumentsPageContent({
  html,
  pdfUrl,
}: {
  html: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseFinanceDocumentsContent(html), [html]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInList = Boolean(pdfUrl && parsed.documents.some((d) => d.url === pdfUrl));

  return (
    <div className="cms-science cms-science--finance-docs">
      <div className="cms-finance-docs__head">
        <span className="cms-science__badge cms-finance-docs__badge">
          <i className="ri-folder-chart-line" aria-hidden />
          {t("faoliyat.finance.documentsBadge")}
        </span>
        <span className="cms-science__count">
          {t("faoliyat.finance.documentsCount", { count: parsed.documents.length })}
        </span>
      </div>

      {parsed.documents.length > 0 && (
        <ul className="cms-finance-docs">
          {parsed.documents.map((doc, index) => (
            <FinanceDocRow key={doc.url} doc={doc} index={index} onPreview={setPreviewUrl} />
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

      {pdfUrl && !fileInList && !isFinanceSpreadsheet(pdfUrl) && (
        <div className="cms-science__primary">
          <h3 className="cms-science__primary-title">{t("faoliyat.finance.primaryDocument")}</h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("faoliyat.finance.primaryDocument")} interactive />
        </div>
      )}
    </div>
  );
}
