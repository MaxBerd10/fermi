import { useTranslation } from "react-i18next";
import type { XorijiyHeroConfig } from "@/lib/xorijiySection";

export default function XorijiyHero({
  title,
  config,
}: {
  title: string;
  config: XorijiyHeroConfig;
}) {
  const { t } = useTranslation();

  return (
    <header className={`xorijiy-hero xorijiy-hero--${config.accent}`}>
      <div className="xorijiy-hero__glow" aria-hidden />
      <div className="xorijiy-hero__inner">
        <div className="xorijiy-hero__meta">
          <span className="xorijiy-hero__icon" aria-hidden>
            <i className={config.icon} />
          </span>
          <span className="xorijiy-hero__eyebrow">{t(config.eyebrowKey)}</span>
        </div>
        <h2 className="xorijiy-hero__title">{title}</h2>
        <p className="xorijiy-hero__intro">{t(config.introKey)}</p>
      </div>
    </header>
  );
}
