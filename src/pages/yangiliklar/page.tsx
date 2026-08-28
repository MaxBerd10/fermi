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
    let retryTimer: number | undefined;
    listNews(page)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setTotal(res.meta?.total ?? res.data.length);
        setLoading(false);
        if (page !== 1) return;
        const applyTelegram = (telegramNews: NewsArticle[]) => {
          if (cancelled) return;
          setItems(mergeNewsByDate(telegramNews, res.data));
          setTotal((res.meta?.total ?? res.data.length) + telegramNews.length);
        };
        listTelegramNews().then(applyTelegram).catch(() => {});
        let tries = 0;
        retryTimer = window.setInterval(() => {
          tries += 1;
          listTelegramNews().then(applyTelegram).catch(() => {});
          if (tries >= 4) window.clearInterval(retryTimer);
        }, 4000);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      window.clearInterval(retryTimer);
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
