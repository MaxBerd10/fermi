import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHomeData } from "@/api/home";
import { listNews } from "@/api/news";
import { listTelegramNews } from "@/api/telegram";
import type { NewsArticle } from "@/types/content";
import { stripHtml } from "@/lib/html";
import { formatShortDate } from "@/lib/date";
import { Reveal } from "@/components/Animation";
import { mergeNewsByDate } from "@/lib/telegramNews";

function newsHref(article: NewsArticle) {
  return `/detail/${article.slug}?menuId=71`;
}

function dedupeById(items: NewsArticle[]) {
  const seen = new Set<number>();
  return items.filter((n) => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
}

export default function NewsAnnouncements() {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;

    Promise.all([
      getHomeData()
        .then((d) => d.news ?? [])
        .catch(() => [] as NewsArticle[]),
      listNews(1)
        .then((r) => r.data ?? [])
        .catch(() => [] as NewsArticle[]),
    ]).then(([homeNews, allNews]) => {
      if (cancelled) return;
      const cms = dedupeById([...homeNews, ...allNews]);
      setNews(cms);
      const applyTelegram = (telegramNews: NewsArticle[]) => {
        if (!cancelled) setNews(mergeNewsByDate(telegramNews, cms));
      };
      listTelegramNews().then(applyTelegram).catch(() => {});
      retryTimer = window.setTimeout(() => {
        listTelegramNews().then(applyTelegram).catch(() => {});
      }, 12000);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
    };
  }, [i18n.language]);

  if (news.length === 0) return null;

  // Text-only announcements are still shown in the list, but the large card
  // should always prefer a usable image so it never renders as a blank block.
  const featured = news.find((article) => Boolean(article.img)) ?? news[0];
  const secondary = news.filter((article) => article.id !== featured.id).slice(0, 5);

  return (
    <section id="yangiliklar" className="py-5 md:py-6 bg-transparent">
      <div className="section-container">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-[#0a1158] mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0a1158]" aria-hidden />
                {t("news.eyebrow")}
              </p>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0a0a0a] tracking-tight leading-tight">
                {t("yangiliklar.heading")}
              </h2>
            </div>
            <Link
              to="/yangiliklar"
              className="inline-flex items-center gap-1.5 self-start md:self-auto h-9 px-3.5 rounded-full bg-white border border-[#e5e5e5] text-sm font-semibold text-[#0a1158] hover:border-[#ffd600] transition-colors cursor-pointer"
            >
              {t("news.viewAll")}
              <i className="ri-arrow-right-line" />
            </Link>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-4 lg:gap-5 lg:items-stretch">
          <Reveal className="lg:col-span-7 h-full">
            <Link
              to={newsHref(featured)}
              className="group flex flex-col h-full rounded-[1.35rem] overflow-hidden bg-white/80 backdrop-blur-md border border-[#e5e5e5]/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)] cursor-pointer"
            >
              <div className="aspect-[16/9] overflow-hidden bg-[#e5e5e5] shrink-0">
                {featured.img ? (
                  <img
                    src={featured.img}
                    alt={featured.title}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#555555]">
                    <i className="ri-newspaper-line text-4xl" />
                  </div>
                )}
              </div>
              <div className="p-4 md:p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e8eaf5] text-[#0a1158] text-[10px] font-bold uppercase tracking-wide">
                    {t("news.new")}
                  </span>
                  <span className="text-xs font-semibold text-[#555555] uppercase tracking-wide">
                    {formatShortDate(featured.date, i18n.language)}
                  </span>
                </div>
                <h3 className="font-heading text-lg md:text-xl font-bold text-[#0a0a0a] leading-snug group-hover:text-[#0a1158] transition-colors">
                  {featured.title}
                </h3>
                <p className="mt-2 text-sm text-[#333333] leading-relaxed line-clamp-2 flex-1">
                  {stripHtml(featured.content).slice(0, 180) || t("news.featuredFallback")}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#0a1158]">
                  {t("news.continueReading")}
                  <i className="ri-arrow-right-line" />
                </span>
              </div>
            </Link>
          </Reveal>

          <div className="lg:col-span-5 flex flex-col gap-2.5 h-full">
            {secondary.map((n, i) => (
              <Reveal key={n.id} delay={40 + i * 40} className="flex-1 min-h-0">
                <Link
                  to={newsHref(n)}
                  className="group flex gap-3 h-full min-h-[4.5rem] p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-[#e5e5e5]/80 shadow-sm hover:shadow-md hover:border-[#ffd600] transition-all cursor-pointer"
                >
                  <div className="w-20 h-full min-h-[4.25rem] max-h-24 rounded-xl overflow-hidden bg-[#e5e5e5] shrink-0 self-stretch">
                    {n.img ? (
                      <img src={n.img} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#555555]">
                        <i className="ri-file-text-line text-xl" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center py-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#0a1158] mb-1">
                      {formatShortDate(n.date, i18n.language)}
                    </p>
                    <h3 className="font-heading text-sm font-bold text-[#0a0a0a] leading-snug line-clamp-2 group-hover:text-[#0a1158] transition-colors">
                      {n.title}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}

            {secondary.length === 0 && (
              <Reveal delay={80}>
                <div className="rounded-2xl bg-white border border-dashed border-[#e5e5e5] p-6 text-center text-sm text-[#555555]">
                  {t("news.empty")}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
