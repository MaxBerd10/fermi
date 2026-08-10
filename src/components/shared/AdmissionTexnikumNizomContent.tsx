import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RichContent from "@/components/shared/RichContent";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { enhanceAdmissionHtml } from "@/lib/enhanceAdmissionHtml";
import { parseTexnikumRegulation } from "@/lib/parseTexnikumBitiruvContent";
import { getTexnikumBitiruvPdfTitleKey } from "@/lib/texnikumBitiruvSection";

export default function AdmissionTexnikumNizomContent({
  html,
  pdfUrl,
  slug,
}: {
  html: string;
  pdfUrl?: string | null;
  slug: string;
}) {
  const { t } = useTranslation();
  const paragraphs = useMemo(() => parseTexnikumRegulation(html), [html]);
  const articleHtml = useMemo(() => enhanceAdmissionHtml(html), [html]);
  const pdfLabel = t(getTexnikumBitiruvPdfTitleKey(pdfUrl, slug));
  const useFallback = paragraphs.length === 0 && !articleHtml.trim();

  return (
    <div className="cms-science cms-science--texnikum-nizom">
      {useFallback ? (
        <>
          <p className="cms-admission-texnikum__text">{t("admission.texnikum.nizom.lead")}</p>
          <ul className="cms-admission-texnikum__summary">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n}>{t(`admission.texnikum.nizom.point${n}`)}</li>
            ))}
          </ul>
        </>
      ) : articleHtml.trim() ? (
        <RichContent html={articleHtml} slug={slug} className="cms-article cms-article--rich cms-article--admission" />
      ) : (
        paragraphs.map((p) => (
          <p key={p} className="cms-admission-texnikum__text">
            {p}
          </p>
        ))
      )}

      {pdfUrl && (
        <div className="cms-admission-texnikum__pdf">
          <div className="cms-admission-gallery__pdf-head">
            <h3 className="cms-admission-gallery__pdf-title">{pdfLabel}</h3>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn cms-science-btn--primary">
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
