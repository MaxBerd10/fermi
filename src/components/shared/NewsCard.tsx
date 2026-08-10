import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { NewsArticle } from "@/types/content";
import { stripHtml } from "@/lib/html";
import { formatShortDate } from "@/lib/date";
import { buildNewsDetailHref, newsCategoryTagStyle, NEWS_DEFAULT_MENU_ID } from "@/lib/newsSection";
import { getNewsArticleImage } from "@/lib/newsImages";
import { useMemo, useState, useEffect } from "react";

export default function NewsCard({
  article,
  menuId = NEWS_DEFAULT_MENU_ID,
  index = 0,
}: {
  article: NewsArticle;
  menuId?: number;
  index?: number;
}) {
  const { t, i18n } = useTranslation();
  const tag = newsCategoryTagStyle(article.category?.title);
  const excerpt = stripHtml(article.content).trim() || t("news.cardFallback");
  const href = buildNewsDetailHref(article.slug, menuId);
  const imageSrc = useMemo(() => getNewsArticleImage(article, index), [article, index]);
  const [imgSrc, setImgSrc] = useState(imageSrc);
  const isBannerLike = /flayer|flyer|banner|\.png$/i.test(imgSrc);

  useEffect(() => {
    setImgSrc(imageSrc);
  }, [imageSrc]);

  return (
    <article
      className="news-card group h-full flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link to={href} className="news-card__media block overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={article.title}
            className={`news-card__img${isBannerLike ? " news-card__img--contain" : ""}`}
            loading="lazy"
            onError={() => {
              const fallback = getNewsArticleImage({ img: "", content: article.content }, index + 1);
              if (fallback !== imgSrc) setImgSrc(fallback);
            }}
          />
        ) : (
          <div className="news-card__placeholder" aria-hidden>
            <i className="ri-newspaper-line" />
          </div>
        )}
        {article.category && (
          <span className={`news-tag ${tag.bg}`}>{tag.label}</span>
        )}
      </Link>

      <div className="news-card__body">
        <div className="news-card__meta">
          <span className="news-card__date">
            <i className="ri-calendar-line" aria-hidden />
            {formatShortDate(article.date, i18n.language)}
          </span>
          {article.seen > 0 && (
            <span className="news-card__views">
              <i className="ri-eye-line" aria-hidden />
              {article.seen}
            </span>
          )}
        </div>

        <h3 className="news-card__title">
          <Link to={href}>{article.title}</Link>
        </h3>

        <p className="news-card__excerpt">{excerpt}</p>

        <Link to={href} className="news-card__more">
          {t("news.continueReading")}
          <i className="ri-arrow-right-line" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
