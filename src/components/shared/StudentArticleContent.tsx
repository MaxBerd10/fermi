import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RichContent from "@/components/shared/RichContent";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { enhanceStudentHtml } from "@/lib/enhanceStudentHtml";
import { getStudentPdfTitleKey, getStudentPageMeta } from "@/lib/studentSection";

export default function StudentArticleContent({
  menuId,
  html,
  pdfUrl,
  slug,
  pdfFirst,
}: {
  menuId: number;
  html: string;
  pdfUrl?: string | null;
  slug: string;
  pdfFirst?: boolean;
}) {
  const { t } = useTranslation();
  const meta = getStudentPageMeta(menuId, slug);
  const articleHtml = useMemo(() => enhanceStudentHtml(html), [html]);
  const pdfLabel = pdfUrl ? t(getStudentPdfTitleKey(menuId, pdfUrl, slug)) : undefined;
  const showPdfFirst = pdfFirst ?? meta.pdfFirst ?? false;

  const pdfBlock =
    pdfUrl && pdfLabel ? (
      <div className="cms-student__pdf">
        <div className="cms-student-gallery__pdf-head">
          <h3 className="cms-student-gallery__pdf-title">{pdfLabel}</h3>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn cms-science-btn--primary">
            <i className="ri-download-2-line" aria-hidden />
            {t("science.downloadDocument")}
          </a>
        </div>
        <PdfDocumentViewer pdfUrl={pdfUrl} title={pdfLabel} interactive />
      </div>
    ) : null;

  return (
    <div className="cms-science cms-science--student-article">
      {showPdfFirst && pdfBlock}
      {articleHtml.trim() && (
        <RichContent html={articleHtml} slug={slug} className="cms-article cms-article--rich cms-article--student" />
      )}
      {!showPdfFirst && pdfBlock}
    </div>
  );
}
