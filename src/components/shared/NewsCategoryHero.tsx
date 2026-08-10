import { useTranslation } from "react-i18next";
import type { NewsCategoryHeroConfig } from "@/lib/newsCategorySection";

export default function NewsCategoryHero({
  title,
  config,
  count,
}: {
  title: string;
  config: NewsCategoryHeroConfig;
  count?: number;
}) {
  const { t } = useTranslation();

  return (
    <header className={`news-category-hero news-category-hero--${config.accent}`}>
      <div className="news-category-hero__glow" aria-hidden />
      <div className="news-category-hero__inner">
        <div className="news-category-hero__meta">
          <span className="news-category-hero__icon" aria-hidden>
            <i className={config.icon} />
          </span>
          <span className="news-category-hero__eyebrow">{t(config.eyebrowKey)}</span>
        </div>
        <h2 className="news-category-hero__title">{title}</h2>
        <p className="news-category-hero__intro">{t(config.introKey)}</p>
        {count !== undefined && count > 0 && (
          <span className="news-category-hero__badge">
            <i className="ri-stack-line" aria-hidden />
            {t("news.category.articleCount", { count })}
          </span>
        )}
      </div>
    </header>
  );
}
