import { useEffect, useState } from "react";

import { useParams, useSearchParams } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { getNewsCategory, listNews } from "@/api/news";

import type { NewsArticle, NewsCategoryRef } from "@/types/content";

import PageHeader from "@/components/shared/PageHeader";

import NewsSectionLayout from "@/components/shared/NewsSectionLayout";

import NewsCard from "@/components/shared/NewsCard";

import NewsPagination from "@/components/shared/NewsPagination";

import { LoadingState, ErrorState } from "@/components/shared/LoadingState";

import { usePageMeta } from "@/hooks/usePageMeta";

import { Reveal } from "@/components/Animation";

import { NEWS_DEFAULT_MENU_ID } from "@/lib/newsSection";

import { getNewsCategoryConfig } from "@/lib/newsCategorySection";

import NewsCategoryHero from "@/components/shared/NewsCategoryHero";



export default function NewsCategoryPage() {

  const { t } = useTranslation();

  const { menuId, slug } = useParams<{ menuId: string; slug: string }>();

  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || "1");

  const [category, setCategory] = useState<NewsCategoryRef | null>(null);

  const [items, setItems] = useState<NewsArticle[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  const resolvedMenuId = menuId ? Number(menuId) : NEWS_DEFAULT_MENU_ID;

  const categoryConfig = getNewsCategoryConfig(slug);



  useEffect(() => {

    if (!slug) return;

    setLoading(true);

    setError(null);



    getNewsCategory(slug, page, resolvedMenuId)

      .then((res) => {

        setCategory(res.data.category);

        setItems(res.data.items);

        setTotal(res.meta?.total ?? res.data.items.length);

      })

      .catch(() => {

        if (categoryConfig?.fallback === "menu-list") {

          return listNews(page, resolvedMenuId)

            .then((res) => {

              setCategory({

                id: 0,

                title: t(categoryConfig.titleKey ?? "news.title"),

                slug,

              });

              setItems(res.data);

              setTotal(res.meta?.total ?? res.data.length);

            })

            .catch(() => setError(t("news.categoryLoadError")));

        }

        setError(t("news.categoryLoadError"));

      })

      .finally(() => setLoading(false));

  }, [slug, menuId, page, resolvedMenuId, categoryConfig?.fallback, categoryConfig?.titleKey, t]);



  const pageTitle = category?.title || t(categoryConfig?.titleKey ?? "news.title");

  usePageMeta(pageTitle);



  if (loading) return <LoadingState />;

  if (error) return <ErrorState message={error} />;



  const pageSize = 9;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const breadcrumb = categoryConfig?.menuSectionId

    ? t("nav.section.xorijiy")

    : t("news.title");



  return (

    <div className="text-foreground-950">

      <PageHeader title={pageTitle} breadcrumb={breadcrumb} compact />



      <NewsSectionLayout

        currentSlug={slug}

        intro={categoryConfig ? undefined : t("news.intro")}

        theme={categoryConfig?.theme}

        menuSectionId={categoryConfig?.menuSectionId}

        showAllNews={!categoryConfig?.menuSectionId}

        hero={

          categoryConfig && category ? (

            <NewsCategoryHero title={category.title} config={categoryConfig} count={total} />

          ) : undefined

        }

      >

        {items.length === 0 ? (

          <Reveal>

            <p className="news-empty">{t("news.empty")}</p>

          </Reveal>

        ) : (

          <Reveal>

            <div className="news-grid">

              {items.map((n, i) => (

                <NewsCard key={n.id} article={n} menuId={resolvedMenuId} index={i} />

              ))}

            </div>

          </Reveal>

        )}



        <Reveal delay={200}>

          <NewsPagination page={page} totalPages={totalPages} />

        </Reveal>

      </NewsSectionLayout>

    </div>

  );

}
