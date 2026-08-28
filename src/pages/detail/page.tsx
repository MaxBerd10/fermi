import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNewsArticle } from "@/api/news";
import type { NewsArticle } from "@/types/content";
import { ApiError } from "@/types/api";
import PageHeader from "@/components/shared/PageHeader";
import RichContent from "@/components/shared/RichContent";
import NewsSectionLayout from "@/components/shared/NewsSectionLayout";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { stripHtml } from "@/lib/html";
import { formatLongDate } from "@/lib/date";
import { Reveal } from "@/components/Animation";
import AiSummaryBlock from "@/components/ai/AiSummaryBlock";
import { NEWS_DEFAULT_MENU_ID } from "@/lib/newsSection";
import { getNewsArticleImage } from "@/lib/newsImages";

export default function DetailPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const menuIdParam = searchParams.get("menuId");
  const menuId = menuIdParam ? Number(menuIdParam) : NEWS_DEFAULT_MENU_ID;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getNewsArticle(slug, menuId)
      .then(setArticle)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("detail.loadError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, menuId, i18n.language]);

  usePageMeta(article?.title, article ? stripHtml(article.content).slice(0, 160) : null);

  if (loading) return <LoadingState />;
  if (error || !article) return <ErrorState message={error ?? undefined} />;

  const categorySlug = article.category?.slug;
  const heroImage = getNewsArticleImage(article);

  return (
    <div className="text-foreground-950">
      <PageHeader title={article.title} breadcrumb={t("detail.breadcrumb")} compact />

      <NewsSectionLayout currentSlug={categorySlug}>
        <Reveal>
          <article className="news-article">
            <div className="news-article__content">
              <div className="news-article__meta">
                {article.category && (
                  <span className="news-article__chip">
                    {article.category.slug === "telegram" ? t("news.telegram") : article.category.title}
                  </span>
                )}
                <span className="news-article__meta-item">
                  <i className="ri-calendar-line" aria-hidden />
                  {formatLongDate(article.date, i18n.language)}
                </span>
                {article.seen > 0 && (
                  <span className="news-article__meta-item">
                    <i className="ri-eye-line" aria-hidden />
                    {article.seen} {t("news.viewsSuffix")}
                  </span>
                )}
              </div>

              {heroImage && (
                <div className="news-article__hero">
                  <img src={heroImage} alt={article.title} />
                </div>
              )}

              <AiSummaryBlock title={article.title} content={article.content} className="mb-5" />

              <RichContent
                html={article.content}
                className="cms-article cms-article--rich cms-article--news"
              />

              {article.file && (
                <a
                  href={article.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-article__download"
                >
                  <i className="ri-file-download-line" aria-hidden />
                  {t("common.downloadFile")}
                </a>
              )}

              {article.telegramUrl && (
                <a
                  href={article.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-article__download"
                >
                  <i className="ri-telegram-fill" aria-hidden />
                  {t("news.openInTelegram")}
                </a>
              )}
            </div>
          </article>
        </Reveal>

        {categorySlug && categorySlug !== "telegram" && (
          <Reveal delay={120}>
            <Link
              to={`/news/${menuId}/${categorySlug}`}
              className="news-back-link"
            >
              <i className="ri-arrow-left-line" aria-hidden />
              {article.category?.title ?? t("news.title")}
            </Link>
          </Reveal>
        )}
      </NewsSectionLayout>
    </div>
  );
}
