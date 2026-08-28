import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { listNews } from "@/api/news";
import { listTelegramNews } from "@/api/telegram";
import type { NewsArticle } from "@/types/content";
import { mergeNewsByDate } from "@/lib/telegramNews";
import PageHeader from "@/components/shared/PageHeader";
import NewsSectionLayout from "@/components/shared/NewsSectionLayout";
import NewsCard from "@/components/shared/NewsCard";
import NewsPagination from "@/components/shared/NewsPagination";
import { LoadingState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Reveal } from "@/components/Animation";
import { NEWS_DEFAULT_MENU_ID } from "@/lib/newsSection";

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  usePageMeta(t("news.title"));
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const cmsPromise = listNews(page);
    const telegramPromise = page === 1 ? listTelegramNews().catch(() => [] as NewsArticle[]) : Promise.resolve([] as NewsArticle[]);

    Promise.all([cmsPromise, telegramPromise])
      .then(([res, telegramNews]) => {
        if (cancelled) return;
        const merged = page === 1 ? mergeNewsByDate(telegramNews, res.data) : res.data;
        setItems(merged);
        setTotal((res.meta?.total ?? res.data.length) + telegramNews.length);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    const retryTimer = window.setTimeout(() => {
      if (page !== 1) return;
      Promise.all([cmsPromise, listTelegramNews().catch(() => [] as NewsArticle[])])
        .then(([res, telegramNews]) => {
          if (cancelled) return;
          setItems(mergeNewsByDate(telegramNews, res.data));
          setTotal((res.meta?.total ?? res.data.length) + telegramNews.length);
        })
        .catch(() => {});
    }, 12000);

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
    };
  }, [page, i18n.language]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={t("yangiliklar.heading")}
        breadcrumb={t("news.title")}
        description={t("yangiliklar.description")}
        compact
      />

      <NewsSectionLayout intro={t("news.intro")}>
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <Reveal>
              <div className="news-grid">
                {items.map((item, i) => (
                  <NewsCard key={item.id} article={item} menuId={NEWS_DEFAULT_MENU_ID} index={i} />
                ))}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <NewsPagination page={page} totalPages={totalPages} />
            </Reveal>
          </>
        )}
      </NewsSectionLayout>
    </div>
  );
}
