import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { parseScienceDocumentsContent, type ScienceDocument } from "@/lib/parseScienceDocumentsContent";

function DocumentRow({
  doc,
  index,
  onPreview,
}: {
  doc: ScienceDocument;
  index: number;
  onPreview: (url: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <li className="cms-science-doc">
      <div className="cms-science-doc__icon" aria-hidden>
        <i className={doc.isPdf ? "ri-file-pdf-line" : "ri-links-line"} />
      </div>
      <div className="cms-science-doc__body">
        <span className="cms-science-doc__num">{index + 1}</span>
        <p className="cms-science-doc__title">{doc.title}</p>
        <div className="cms-science-doc__actions">
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

export default function ScienceDocumentsPageContent({
  html,
  pdfUrl,
}: {
  html: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseScienceDocumentsContent(html), [html]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInList = Boolean(pdfUrl && parsed.documents.some((d) => d.url === pdfUrl));

  return (
    <div className="cms-science cms-science--documents">
      {parsed.coverImage && (
        <figure className="cms-science__cover">
          <img src={parsed.coverImage} alt="" loading="lazy" />
        </figure>
      )}

      {parsed.preamble.length > 0 && (
        <div className="cms-science-preamble">
          {parsed.preamble.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="cms-science-preamble__text">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {parsed.documents.length > 0 && (
        <>
          <div className="cms-science__head">
            <span className="cms-science__badge">
              <i className="ri-folder-3-line" aria-hidden />
              {t("science.documentsBadge")}
            </span>
            <span className="cms-science__count">{t("science.documentsCount", { count: parsed.documents.length })}</span>
          </div>
          <ul className="cms-science-docs">
            {parsed.documents.map((doc, index) => (
              <DocumentRow key={doc.url} doc={doc} index={index} onPreview={setPreviewUrl} />
            ))}
          </ul>
        </>
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

      {pdfUrl && !fileInList && (
        <div className="cms-science__primary">
          <h3 className="cms-science__primary-title">{t("science.primaryDocument")}</h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("science.primaryDocument")} interactive />
        </div>
      )}
    </div>
  );
}
