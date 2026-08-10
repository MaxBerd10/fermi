import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

function buildGviewUrl(pdfUrl: string): string {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
}

export default function PdfDocumentViewer({
  pdfUrl,
  title,
  compact = false,
  interactive = false,
}: {
  pdfUrl: string;
  title?: string;
  compact?: boolean;
  interactive?: boolean;
}) {
  const { t } = useTranslation();
  const [useDirect, setUseDirect] = useState(false);

  const embedSrc = useMemo(
    () => (useDirect ? `${pdfUrl}#toolbar=1&navpanes=0&view=FitH` : buildGviewUrl(pdfUrl)),
    [pdfUrl, useDirect],
  );

  const openPdf = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`cms-council-pdf${compact ? " cms-council-pdf--compact" : ""}${interactive ? " cms-council-pdf--interactive" : ""}`}>
      <div className="cms-council-pdf__actions">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cms-council-pdf__download"
        >
          <i className="ri-file-pdf-line" aria-hidden />
          {t("journal.openPdfNewTab")}
        </a>
        {!useDirect && (
          <button type="button" className="cms-council-pdf__switch" onClick={() => setUseDirect(true)}>
            {t("journal.pdfAltViewer")}
          </button>
        )}
      </div>

      <div className="cms-council-pdf__frame">
        <iframe src={embedSrc} title={title ?? t("council.pdfViewerTitle")} className="cms-council-pdf__iframe" />
        {interactive && (
          <button type="button" className="cms-council-pdf__overlay" onClick={openPdf} aria-label={t("journal.openPdfNewTab")}>
            <i className="ri-fullscreen-line" aria-hidden />
            <span>{t("journal.pdfClickToView")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
