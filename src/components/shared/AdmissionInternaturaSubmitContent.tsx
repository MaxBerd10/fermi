import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseInternaturaSubmit } from "@/lib/parseInternaturaContent";

const DEFAULT_PORTALS = [
  {
    url: "https://medtoifa.ssv.uz",
    label: "medtoifa.ssv.uz",
    descriptionKey: "admission.internatura.portal.medtoifa",
  },
  {
    url: "https://tmbm.ssv.uz",
    label: "tmbm.ssv.uz",
    descriptionKey: "admission.internatura.portal.tmbm",
  },
] as const;

export default function AdmissionInternaturaSubmitContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseInternaturaSubmit(html), [html]);
  const useFallback = parsed.paragraphs.length === 0;
  const portals = parsed.portals.length > 0 ? parsed.portals : DEFAULT_PORTALS;

  return (
    <div className="cms-science cms-science--internatura-submit">
      {useFallback ? (
        <>
          <div className="cms-admission-docs__deadline cms-admission-internatura__deadline">
            <i className="ri-calendar-check-line" aria-hidden />
            <div>
              <span className="cms-admission-docs__deadline-label">{t("admission.internatura.submit.periodLabel")}</span>
              <span className="cms-admission-docs__deadline-value">{t("admission.internatura.submit.period")}</span>
            </div>
          </div>

          <section className="cms-admission-internatura__block">
            <h3 className="cms-admission-docs__section-title">{t("admission.internatura.submit.docsTitle")}</h3>
            <p className="cms-admission-internatura__text">{t("admission.internatura.submit.docsText")}</p>
          </section>

          <section className="cms-admission-internatura__block">
            <h3 className="cms-admission-docs__section-title">{t("admission.internatura.submit.testTitle")}</h3>
            <p className="cms-admission-internatura__text">{t("admission.internatura.submit.testText")}</p>
          </section>
        </>
      ) : (
        parsed.paragraphs.map((paragraph) => (
          <p key={paragraph} className="cms-admission-internatura__text">
            {paragraph}
          </p>
        ))
      )}

      <div className="cms-admission-internatura__portals">
        {portals.map((portal) => (
          <a
            key={portal.url}
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-admission-cta cms-admission-internatura__portal"
          >
            <span className="cms-admission-cta__icon" aria-hidden>
              <i className="ri-external-link-line" />
            </span>
            <span className="cms-admission-cta__body">
              <span className="cms-admission-cta__title">{portal.label}</span>
              <span className="cms-admission-cta__url">{t(portal.descriptionKey)}</span>
            </span>
            <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  );
}
