import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseQoshmaProgram } from "@/lib/parseQoshmaContent";

export default function AdmissionQoshmaProgramContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const content = useMemo(() => parseQoshmaProgram(html), [html]);

  return (
    <div className="cms-science cms-science--qoshma-program">
      {content.bannerImage && (
        <figure className="cms-qoshma-program__banner">
          <img src={content.bannerImage} alt="" loading="lazy" />
        </figure>
      )}

      {(content.title || content.subtitle) && (
        <header className="cms-qoshma-program__head">
          {content.title && <h3 className="cms-qoshma-program__title">{content.title}</h3>}
          {content.subtitle && <p className="cms-qoshma-program__subtitle">{content.subtitle}</p>}
        </header>
      )}

      {content.partner && (
        <p className="cms-qoshma-program__partner">
          <i className="ri-global-line" aria-hidden />
          {content.partner}
        </p>
      )}

      {content.programName && (
        <div className="cms-qoshma-program__name">
          <span className="cms-qoshma-program__name-label">{t("admission.qoshma.program")}</span>
          <span className="cms-qoshma-program__name-value">{content.programName}</span>
        </div>
      )}

      {content.stats.length > 0 && (
        <div className="cms-qoshma-program__stats">
          {content.stats.map((stat) => (
            <div key={stat.labelKey} className="cms-qoshma-program__stat">
              <span className="cms-qoshma-program__stat-icon" aria-hidden>
                <i className={stat.icon} />
              </span>
              <div>
                <span className="cms-qoshma-program__stat-label">{t(stat.labelKey)}</span>
                <span className="cms-qoshma-program__stat-value">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
