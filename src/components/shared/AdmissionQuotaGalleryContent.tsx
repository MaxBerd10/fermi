import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { parseAdmissionImages } from "@/lib/parseAdmissionContent";

export default function AdmissionQuotaGalleryContent({
  html,
  pdfUrl,
  title,
  pdfTitleKey,
}: {
  html: string;
  pdfUrl?: string | null;
  title?: string;
  pdfTitleKey?: string;
}) {
  const { t } = useTranslation();
  const images = useMemo(() => parseAdmissionImages(html), [html]);
  const pdfLabel = pdfTitleKey ? t(pdfTitleKey) : (title ?? t("admission.downloadPdf"));

  return (
    <div className="cms-science cms-science--admission-gallery">
      {images.length > 0 && (
        <div className="cms-admission-gallery">
          {images.map((img) => (
            <figure key={img.url} className="cms-admission-gallery__item">
              <img src={img.url} alt={img.alt || title || ""} loading="lazy" className="cms-admission-gallery__img" />
            </figure>
          ))}
        </div>
      )}

      {pdfUrl && (
        <div className="cms-admission-gallery__pdf">
          <div className="cms-admission-gallery__pdf-head">
            <h3 className="cms-admission-gallery__pdf-title">{pdfLabel}</h3>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
              <i className="ri-download-2-line" aria-hidden />
              {t("science.downloadDocument")}
            </a>
          </div>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={pdfLabel} interactive />
        </div>
      )}
    </div>
  );
}
