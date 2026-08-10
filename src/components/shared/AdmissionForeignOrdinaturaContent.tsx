import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FOREIGN_BACHELOR_FORM_URL,
  getXorijiyQabulDocsHref,
} from "@/lib/xorijiyQabulSection";

export default function AdmissionForeignOrdinaturaContent() {
  const { t } = useTranslation();

  return (
    <div className="cms-science cms-science--foreign-ordinatura">
      <p className="cms-admission-foreign__greeting">{t("admission.xorijiy.ordinatura.greeting")}</p>
      <p className="cms-admission-foreign__text">{t("admission.xorijiy.ordinatura.intro")}</p>

      <a
        href={FOREIGN_BACHELOR_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-admission-cta cms-admission-foreign__cta"
      >
        <span className="cms-admission-cta__icon" aria-hidden>
          <i className="ri-global-line" />
        </span>
        <span className="cms-admission-cta__body">
          <span className="cms-admission-cta__title">{t("admission.xorijiy.cta.applyOnline")}</span>
          <span className="cms-admission-cta__url">docs.google.com</span>
        </span>
        <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
      </a>

      <div className="cms-admission-foreign__languages">
        <span className="cms-admission-foreign__languages-label">{t("admission.xorijiy.languagesLabel")}</span>
        <span>{t("admission.xorijiy.languagesOrdinatura")}</span>
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

      <p className="cms-admission-foreign__note">{t("admission.xorijiy.ordinatura.examNote")}</p>
    </div>
  );
}
