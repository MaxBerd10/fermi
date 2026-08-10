import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdmissionSupplementaryPdf from "@/components/shared/AdmissionSupplementaryPdf";
import {
  FOREIGN_BACHELOR_FORM_URL,
  getXorijiyQabulDocsHref,
  getXorijiyQabulPdfTitleKey,
} from "@/lib/xorijiyQabulSection";

export default function AdmissionForeignBachelorContent({
  pdfUrl,
  slug,
}: {
  pdfUrl?: string | null;
  slug: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="cms-science cms-science--foreign-bachelor">
      <p className="cms-admission-foreign__badge">{t("admission.xorijiy.bachelor.badge")}</p>
      <p className="cms-admission-foreign__greeting">{t("admission.xorijiy.bachelor.greeting")}</p>
      <p className="cms-admission-foreign__text">{t("admission.xorijiy.bachelor.intro")}</p>

      <a
        href={FOREIGN_BACHELOR_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-admission-cta cms-admission-foreign__cta"
      >
        <span className="cms-admission-cta__icon" aria-hidden>
          <i className="ri-file-edit-line" />
        </span>
        <span className="cms-admission-cta__body">
          <span className="cms-admission-cta__title">{t("admission.xorijiy.cta.applyForm")}</span>
          <span className="cms-admission-cta__url">docs.google.com</span>
        </span>
        <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
      </a>

      <div className="cms-admission-docs__deadline cms-admission-foreign__deadline">
        <i className="ri-calendar-check-line" aria-hidden />
        <div>
          <span className="cms-admission-docs__deadline-label">{t("admission.xorijiy.bachelor.startLabel")}</span>
          <span className="cms-admission-docs__deadline-value">{t("admission.xorijiy.bachelor.startDate")}</span>
        </div>
      </div>

      <div className="cms-admission-docs__deadline cms-admission-foreign__deadline">
        <i className="ri-time-line" aria-hidden />
        <div>
          <span className="cms-admission-docs__deadline-label">{t("admission.xorijiy.bachelor.deadlineLabel")}</span>
          <span className="cms-admission-docs__deadline-value">{t("admission.xorijiy.bachelor.deadline")}</span>
        </div>
      </div>

      <div className="cms-admission-foreign__languages">
        <span className="cms-admission-foreign__languages-label">{t("admission.xorijiy.languagesLabel")}</span>
        <span>{t("admission.xorijiy.languages")}</span>
      </div>

      <Link to={getXorijiyQabulDocsHref()} className="cms-fundamental-link cms-admission-foreign__docs-link">
        <span className="cms-fundamental-link__icon" aria-hidden>
          <i className="ri-folder-3-line" />
        </span>
        <span className="cms-fundamental-link__body">
          <span className="cms-fundamental-link__title">{t("admission.xorijiy.link.hujjatlar")}</span>
        </span>
        <i className="ri-arrow-right-s-line cms-fundamental-link__arrow" aria-hidden />
      </Link>

      <section className="cms-admission-foreign__programs">
        <h3 className="cms-admission-docs__section-title">{t("admission.xorijiy.bachelor.programsTitle")}</h3>
        <div className="cms-admission-foreign__program-cards">
          <article className="cms-admission-foreign__program">
            <h4>{t("admission.xorijiy.bachelor.program1Title")}</h4>
            <p>{t("admission.xorijiy.bachelor.program1Text")}</p>
          </article>
          <article className="cms-admission-foreign__program">
            <h4>{t("admission.xorijiy.bachelor.program2Title")}</h4>
            <p>{t("admission.xorijiy.bachelor.program2Text")}</p>
          </article>
        </div>
      </section>

      <p className="cms-admission-foreign__note">{t("admission.xorijiy.bachelor.examNote")}</p>

      {pdfUrl && (
        <AdmissionSupplementaryPdf pdfUrl={pdfUrl} titleKey={getXorijiyQabulPdfTitleKey(pdfUrl, slug)} />
      )}
    </div>
  );
}
