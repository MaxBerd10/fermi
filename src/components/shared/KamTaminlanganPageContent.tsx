import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseKamTaminlanganContent } from "@/lib/parseKamTaminlanganContent";

export default function KamTaminlanganPageContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseKamTaminlanganContent(html), [html]);

  return (
    <div className="cms-science cms-science--kam-taminlangan">
      {parsed.intro && <p className="cms-kam-intro">{parsed.intro}</p>}

      {parsed.stats.length > 0 && (
        <div className="cms-kam-stats" role="list">
          {parsed.stats.map((stat) => (
            <div key={stat.labelKey} className="cms-kam-stat" role="listitem">
              <span className="cms-kam-stat__icon" aria-hidden>
                <i className={stat.icon} />
              </span>
              <div className="cms-kam-stat__body">
                <span className="cms-kam-stat__value">{stat.value}</span>
                <span className="cms-kam-stat__label">{t(stat.labelKey)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {parsed.sections.length > 0 && (
        <div className="cms-kam-sections">
          <h3 className="cms-kam-sections__title">{t("faoliyat.kamTaminlangan.sectionsTitle")}</h3>
          <div className="cms-kam-sections__grid">
            {parsed.sections.map((section) => (
              <article key={section.title} className="cms-kam-section">
                <header className="cms-kam-section__head">
                  <span className="cms-kam-section__icon" aria-hidden>
                    <i className={section.icon} />
                  </span>
                  <h4 className="cms-kam-section__title">{section.title}</h4>
                </header>
                <p className="cms-kam-section__body">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
