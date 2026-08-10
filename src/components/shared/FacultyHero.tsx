import { useTranslation } from "react-i18next";
import type { FacultyPageConfig } from "@/lib/facultySection";

export default function FacultyHero({
  title,
  logoUrl,
  config,
}: {
  title: string;
  logoUrl?: string | null;
  config: FacultyPageConfig;
}) {
  const { t } = useTranslation();

  return (
    <header className={`faculty-hero faculty-hero--${config.theme}`}>
      <div className="faculty-hero__inner">
        <div className="faculty-hero__brand">
          {logoUrl && (
            <div className="faculty-hero__logo-wrap">
              <img src={logoUrl} alt={title} className="faculty-hero__logo" loading="eager" />
            </div>
          )}
          <div className="faculty-hero__titles">
            <span className="faculty-hero__eyebrow">{t("nav.section.fakultetlar")}</span>
            <h2 className="faculty-hero__title">{title}</h2>
          </div>
        </div>

        <p className="faculty-hero__intro">{t(config.introKey)}</p>

        {config.missionKey && (
          <blockquote className="faculty-hero__mission">{t(config.missionKey)}</blockquote>
        )}

        {config.stats.length > 0 && (
          <ul className="faculty-hero__stats">
            {config.stats.map((stat) => (
              <li key={stat.labelKey + stat.value} className="faculty-hero__stat">
                <i className={stat.icon} aria-hidden />
                <span className="faculty-hero__stat-value">{stat.value}</span>
                <span className="faculty-hero__stat-label">{t(stat.labelKey)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
