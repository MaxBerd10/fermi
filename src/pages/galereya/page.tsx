import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { listGallery } from "@/api/gallery";
import type { GalleryImage } from "@/types/content";
import { Reveal } from "@/components/Animation";
import PageHeader from "@/components/shared/PageHeader";
import NewsSectionLayout from "@/components/shared/NewsSectionLayout";
import NewsPagination from "@/components/shared/NewsPagination";
import { LoadingState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function GaleryaPage() {
  const { t } = useTranslation();
  usePageMeta(t("gallery.eyebrow"));
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listGallery(page)
      .then((res) => {
        setItems(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="text-foreground-950">
      <PageHeader title={t("gallery.eyebrow")} breadcrumb={t("news.title")} compact />

      <NewsSectionLayout intro={t("gallery.intro")}>
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <Reveal>
              <div className="news-gallery-grid">
                {items.map((img) => (
                  <Link
                    key={img.id}
                    to={`/full-gallery/${img.id}`}
                    className="news-gallery-item group"
                  >
                    <img
                      src={img.img}
                      alt={img.title || t("gallery.altText")}
                      loading="lazy"
                    />
                    <div className="news-gallery-item__overlay">
                      <i className="ri-zoom-in-line opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
                    </div>
                  </Link>
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
