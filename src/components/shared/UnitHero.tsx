import { useTranslation } from "react-i18next";
import type { UnitTheme } from "@/lib/unitSection";

export default function UnitHero({
  title,
  theme,
  introKey,
  eyebrowKey,
  accent,
}: {
  title: string;
  theme: UnitTheme;
  introKey: string;
  eyebrowKey: string;
  accent?: string;
}) {
  const { t } = useTranslation();
  const variant = accent ?? theme;

  return (
    <header className={`unit-hero unit-hero--${variant}`}>
      <div className="unit-hero__inner">
        <span className="unit-hero__eyebrow">{t(eyebrowKey)}</span>
        <h2 className="unit-hero__title">{title}</h2>
        <p className="unit-hero__intro">{t(introKey)}</p>
      </div>
    </header>
  );
}
