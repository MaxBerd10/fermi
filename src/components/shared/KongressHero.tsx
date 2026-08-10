import { useTranslation } from "react-i18next";
import type { KongressHeroConfig } from "@/lib/kongressSection";

export default function KongressHero({
  title,
  config,
}: {
  title: string;
  config: KongressHeroConfig;
}) {
  const { t } = useTranslation();

  return (
    <header className={`kongress-hero kongress-hero--${config.accent}`}>
      <div className="kongress-hero__glow" aria-hidden />
      <div className="kongress-hero__inner">
        <div className="kongress-hero__meta">
          <span className="kongress-hero__icon" aria-hidden>
            <i className={config.icon} />
          </span>
          <span className="kongress-hero__eyebrow">{t(config.eyebrowKey)}</span>
        </div>
        <h2 className="kongress-hero__title">{title}</h2>
        <p className="kongress-hero__intro">{t(config.introKey)}</p>
      </div>
    </header>
  );
}
