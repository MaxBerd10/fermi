import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import {
  DOKTORANTURA_MENU_ID,
  DOKTORANTURA_SPECIALTY_LINKS,
  getDoktoranturaPdfTitleKey,
} from "@/lib/doktoranturaSection";
import { parseDoktoranturaSpecialtyTitle } from "@/lib/parseDoktoranturaAdmissionContent";

export default function AdmissionDoctorateExamContent({
  slug,
  pdfUrl,
  title,
}: {
  slug: string;
  pdfUrl: string;
  title?: string;
}) {
  const { t } = useTranslation();
  const specialty = useMemo(() => parseDoktoranturaSpecialtyTitle(title ?? ""), [title]);
  const pdfLabel = t(getDoktoranturaPdfTitleKey(pdfUrl, slug));
  const related = DOKTORANTURA_SPECIALTY_LINKS.filter((item) => item.slug !== slug);

  return (
    <div className="cms-science cms-science--admission-doctorate-exam">
      <div className="cms-admission-doc-exam__head">
        {specialty.code && <span className="cms-admission-doc-exam__code">{specialty.code}</span>}
        <h3 className="cms-admission-doc-exam__title">{specialty.name || title}</h3>
        <span className="cms-science__badge cms-doc-badge">
          <i className="ri-file-edit-line" aria-hidden />
          {t("admission.doktorantura.examBadge")}
        </span>
      </div>

      <div className="cms-admission-doc-exam__pdf">
        <div className="cms-admission-gallery__pdf-head">
          <h4 className="cms-admission-gallery__pdf-title">{pdfLabel}</h4>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
            <i className="ri-download-2-line" aria-hidden />
            {t("science.downloadDocument")}
          </a>
        </div>
        <PdfDocumentViewer pdfUrl={pdfUrl} title={pdfLabel} interactive />
      </div>

      {related.length > 0 && (
        <section className="cms-admission-doc-exam__related">
          <h3 className="cms-admission-related__title">{t("admission.doktorantura.relatedSpecialties")}</h3>
          <div className="cms-doc-specialties cms-doc-specialties--exams">
            {related.map((item) => (
              <Link
                key={item.slug}
                to={`/blog/${DOKTORANTURA_MENU_ID}/${item.slug}`}
                className="cms-doc-specialty cms-doc-specialty--link"
              >
                <span className="cms-doc-specialty__code">{item.code}</span>
                <span className="cms-doc-specialty__title">{item.title}</span>
                <i className="ri-arrow-right-s-line" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
