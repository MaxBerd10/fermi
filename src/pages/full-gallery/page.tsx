import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getFullGallery } from "@/api/gallery";
import type { GalleryImage } from "@/types/content";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";
import PageHeader from "@/components/shared/PageHeader";
import RichContent from "@/components/shared/RichContent";
import NewsSectionLayout from "@/components/shared/NewsSectionLayout";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function FullGalleryPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [img, setImg] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getFullGallery(Number(id))
      .then(setImg)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("common.genericError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  usePageMeta(t("gallery.eyebrow"));

  if (loading) return <LoadingState />;
  if (error || !img) return <ErrorState message={error ?? undefined} />;

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={img.title || t("gallery.altText")}
        breadcrumb={t("gallery.altText")}
        compact
      />

      <NewsSectionLayout>
        <Reveal>
          <div className="news-full-gallery">
            <img src={img.img} alt={img.title || t("gallery.altText")} />
          </div>
        </Reveal>

        {img.content && (
          <Reveal delay={80} className="mt-5">
            <article className="news-article">
              <div className="news-article__content">
                <RichContent html={img.content} className="cms-article cms-article--rich cms-article--news" />
              </div>
            </article>
          </Reveal>
        )}

        <Reveal delay={120}>
          <Link to="/galereya" className="news-back-link">
            <i className="ri-arrow-left-line" aria-hidden />
            {t("gallery.backToGallery")}
          </Link>
        </Reveal>
      </NewsSectionLayout>
    </div>
  );
}
