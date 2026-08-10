import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { listVideo } from "@/api/video";
import type { VideoItem } from "@/types/content";
import { Reveal } from "@/components/Animation";
import PageHeader from "@/components/shared/PageHeader";
import NewsSectionLayout from "@/components/shared/NewsSectionLayout";
import NewsPagination from "@/components/shared/NewsPagination";
import { LoadingState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function VideoPage() {
  const { t } = useTranslation();
  usePageMeta(t("video.title"));
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const [items, setItems] = useState<VideoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listVideo(page)
      .then((res) => {
        setItems(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="text-foreground-950">
      <PageHeader title={t("video.title")} breadcrumb={t("news.title")} compact />

      <NewsSectionLayout intro={t("video.intro")}>
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <Reveal>
              <div className="news-video-grid">
                {items.map((v) => (
                  <div key={v.id} className="news-video-card">
                    {v.url ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${v.url}`}
                        title={`Video ${v.id}`}
                        allowFullScreen
                      />
                    ) : v.video ? (
                      <video src={v.video} controls className="w-full h-full object-cover" />
                    ) : null}
                  </div>
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
