import { useTranslation } from "react-i18next";
import type { FaoliyatHeroConfig } from "@/lib/faoliyatSection";

export default function FaoliyatHero({
  title,
  config,
}: {
  title: string;
  config: FaoliyatHeroConfig;
}) {
  const { t } = useTranslation();

  return (
    <header className={`faoliyat-hero faoliyat-hero--${config.accent}`}>
      <div className="faoliyat-hero__glow" aria-hidden />
      <div className="faoliyat-hero__inner">
        <div className="faoliyat-hero__meta">
          <span className="faoliyat-hero__icon" aria-hidden>
            <i className={config.icon} />
          </span>
          <span className="faoliyat-hero__eyebrow">{t(config.eyebrowKey)}</span>
        </div>
        <h2 className="faoliyat-hero__title">{title}</h2>
        <p className="faoliyat-hero__intro">{t(config.introKey)}</p>
      </div>
    </header>
  );
}
