import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdmissionSupplementaryPdf from "@/components/shared/AdmissionSupplementaryPdf";
import {
  TEXNIKUM_COLLEGES,
  TEXNIKUM_EDU_PORTAL,
  TEXNIKUM_MENU_ID,
  getTexnikumBitiruvPdfTitleKey,
} from "@/lib/texnikumBitiruvSection";

export default function AdmissionTexnikumNewsContent({
  pdfUrl,
  slug,
}: {
  pdfUrl?: string | null;
  slug: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="cms-science cms-science--texnikum-news">
      <p className="cms-admission-texnikum__headline">{t("admission.texnikum.news.headline")}</p>
      <p className="cms-admission-texnikum__text">{t("admission.texnikum.news.intro")}</p>

      <a
        href={TEXNIKUM_EDU_PORTAL}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-admission-cta cms-admission-texnikum__cta"
      >
        <span className="cms-admission-cta__icon" aria-hidden>
          <i className="ri-global-line" />
        </span>
        <span className="cms-admission-cta__body">
          <span className="cms-admission-cta__title">{t("admission.texnikum.cta.eduPortal")}</span>
          <span className="cms-admission-cta__url">my.edu.uz</span>
        </span>
        <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
      </a>

      <div className="cms-admission-docs__deadline cms-admission-texnikum__deadline">
        <i className="ri-calendar-check-line" aria-hidden />
        <div>
          <span className="cms-admission-docs__deadline-label">{t("admission.texnikum.news.deadlineLabel")}</span>
          <span className="cms-admission-docs__deadline-value">{t("admission.texnikum.news.deadline")}</span>
        </div>
      </div>

      <p className="cms-admission-texnikum__note">{t("admission.texnikum.news.autoNote")}</p>
      <p className="cms-admission-texnikum__notice">{t("admission.texnikum.news.exclusionNote")}</p>

      <section className="cms-admission-texnikum__colleges">
        <h3 className="cms-admission-docs__section-title">{t("admission.texnikum.news.collegesTitle")}</h3>
        <div className="cms-admission-texnikum__college-list">
          {TEXNIKUM_COLLEGES.map((college) => (
            <Link
              key={college.slug}
              to={`/blog/${TEXNIKUM_MENU_ID}/${college.slug}`}
              className="cms-doc-specialty cms-doc-specialty--link"
            >
              <span className="cms-doc-specialty__title">{t(college.labelKey)}</span>
              <i className="ri-arrow-right-s-line" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {pdfUrl && (
        <AdmissionSupplementaryPdf pdfUrl={pdfUrl} titleKey={getTexnikumBitiruvPdfTitleKey(pdfUrl, slug)} />
      )}
    </div>
  );
}
