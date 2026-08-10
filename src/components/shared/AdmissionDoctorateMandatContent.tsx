import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { DOKTORANTURA_MENU_ID, DOKTORANTURA_SPECIALTY_LINKS, getDoktoranturaPdfTitleKey } from "@/lib/doktoranturaSection";

export default function AdmissionDoctorateMandatContent({
  pdfUrl,
  slug,
}: {
  pdfUrl: string;
  slug: string;
}) {
  const { t } = useTranslation();
  const pdfLabel = t(getDoktoranturaPdfTitleKey(pdfUrl, slug));

  return (
    <div className="cms-science cms-science--admission-doctorate-mandat">
      <p className="cms-admission-doc-mandat__intro">{t("admission.doktorantura.mandatLead")}</p>

      <div className="cms-admission-doc-mandat__pdf">
        <div className="cms-admission-gallery__pdf-head">
          <h3 className="cms-admission-gallery__pdf-title">{pdfLabel}</h3>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn cms-science-btn--primary">
            <i className="ri-download-2-line" aria-hidden />
            {t("science.downloadDocument")}
          </a>
        </div>
        <PdfDocumentViewer pdfUrl={pdfUrl} title={pdfLabel} interactive />
      </div>

      <section className="cms-admission-doc-mandat__specialties">
        <h3 className="cms-admission-related__title">{t("admission.doktorantura.examProgramsTitle")}</h3>
        <p className="cms-admission-doc-mandat__specialties-lead">{t("admission.doktorantura.examProgramsLead")}</p>
        <div className="cms-doc-specialties cms-doc-specialties--exams">
          {DOKTORANTURA_SPECIALTY_LINKS.map((item) => (
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
    </div>
  );
}
