import { useTranslation } from "react-i18next";
import type { AdmissionHeroConfig } from "@/lib/admissionSection";

export default function AdmissionHero({
  title,
  config,
}: {
  title: string;
  config: AdmissionHeroConfig;
}) {
  const { t } = useTranslation();

  return (
    <header className={`admission-hero admission-hero--${config.accent}`}>
      <div className="admission-hero__glow" aria-hidden />
      <div className="admission-hero__inner">
        <div className="admission-hero__meta">
          <span className="admission-hero__icon" aria-hidden>
            <i className={config.icon} />
          </span>
          <span className="admission-hero__eyebrow">{t(config.eyebrowKey)}</span>
        </div>
        <h2 className="admission-hero__title">{title}</h2>
        <p className="admission-hero__intro">{t(config.introKey)}</p>
      </div>
    </header>
  );
}
