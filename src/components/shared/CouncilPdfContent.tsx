import { useTranslation } from "react-i18next";

export default function CouncilPdfContent({
  pdfUrl,
  title,
  compact = false,
}: {
  pdfUrl: string;
  title?: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className={`cms-council-pdf${compact ? " cms-council-pdf--compact" : ""}`}>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-council-pdf__download"
      >
        <i className="ri-file-pdf-line" aria-hidden />
        {t("council.downloadPdf")}
      </a>
      <div className="cms-council-pdf__frame">
        <iframe src={pdfUrl} title={title ?? t("council.pdfViewerTitle")} className="cms-council-pdf__iframe" />
      </div>
    </div>
  );
}
