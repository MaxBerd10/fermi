import { useTranslation } from "react-i18next";
import type { StudentHeroConfig } from "@/lib/studentSection";

export default function StudentHero({
  title,
  config,
}: {
  title: string;
  config: StudentHeroConfig;
}) {
  const { t } = useTranslation();

  return (
    <header className={`student-hero student-hero--${config.accent}`}>
      <div className="student-hero__glow" aria-hidden />
      <div className="student-hero__inner">
        <div className="student-hero__meta">
          <span className="student-hero__icon" aria-hidden>
            <i className={config.icon} />
          </span>
          <span className="student-hero__eyebrow">{t(config.eyebrowKey)}</span>
        </div>
        <h2 className="student-hero__title">{title}</h2>
        <p className="student-hero__intro">{t(config.introKey)}</p>
      </div>
    </header>
  );
}
