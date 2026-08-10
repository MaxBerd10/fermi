import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RichContent from "@/components/shared/RichContent";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { enhanceStudentHtml } from "@/lib/enhanceStudentHtml";
import {
  STUDENT_DORM_PORTAL,
  getBakalavriatStudentPdfTitleKey,
} from "@/lib/bakalavriatStudentSection";
import { extractStudentDormPortalUrl } from "@/lib/parseBakalavriatStudentContent";

export default function StudentDormContent({
  html,
  pdfUrl,
  slug,
}: {
  html: string;
  pdfUrl?: string | null;
  slug: string;
}) {
  const { t } = useTranslation();
  const articleHtml = useMemo(() => enhanceStudentHtml(html), [html]);
  const portalUrl = useMemo(() => extractStudentDormPortalUrl(html, STUDENT_DORM_PORTAL), [html]);
  const pdfLabel = pdfUrl ? t(getBakalavriatStudentPdfTitleKey(pdfUrl, slug)) : undefined;

  return (
    <div className="cms-science cms-science--student-dorm">
      <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="cms-admission-cta cms-student__cta">
        <span className="cms-admission-cta__icon" aria-hidden>
          <i className="ri-government-line" />
        </span>
        <span className="cms-admission-cta__body">
          <span className="cms-admission-cta__title">{t("student.bakalavriat.cta.dormPortal")}</span>
          <span className="cms-admission-cta__url">my.gov.uz</span>
        </span>
        <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
      </a>

      <div className="cms-admission-docs__deadline cms-student__deadline">
        <i className="ri-calendar-check-line" aria-hidden />
        <div>
          <span className="cms-admission-docs__deadline-label">{t("student.bakalavriat.dorm.periodLabel")}</span>
          <span className="cms-admission-docs__deadline-value">{t("student.bakalavriat.dorm.period")}</span>
        </div>
      </div>

      {articleHtml.trim() && (
        <RichContent html={articleHtml} slug={slug} className="cms-article cms-article--rich cms-article--student" />
      )}

      {pdfUrl && pdfLabel && (
        <div className="cms-student__pdf">
          <div className="cms-student-gallery__pdf-head">
            <h3 className="cms-student-gallery__pdf-title">{pdfLabel}</h3>
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
