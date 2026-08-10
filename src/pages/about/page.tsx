import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAbout } from "@/api/pages";
import type { About } from "@/types/content";
import { ApiError } from "@/types/api";
import PageHeader from "@/components/shared/PageHeader";
import RichContent from "@/components/shared/RichContent";
import { Reveal } from "@/components/Animation";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { stripHtml } from "@/lib/html";
import { normalizeYearLabels } from "@/lib/siteConstants";

export default function AboutPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getAbout(slug)
      .then(setAbout)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("common.genericError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  usePageMeta(about?.title, about ? stripHtml(about.content).slice(0, 160) : null);

  if (loading) return <LoadingState />;
  if (error || !about) return <ErrorState message={error ?? undefined} />;

  const displayTitle = normalizeYearLabels(about.title);

  return (
    <div className="text-foreground-950">
      <PageHeader title={displayTitle} breadcrumb={t("footer.institutHaqida")} />
      <section className="section-pad bg-transparent">
        <div className="section-container max-w-4xl">
          {about.img && (
            <Reveal>
              <img
                src={about.img}
                alt={displayTitle}
                className="w-full h-56 md:h-72 object-cover object-center rounded-2xl mb-6 border border-slate-200 shadow-lg"
              />
            </Reveal>
          )}
          <Reveal delay={about.img ? 80 : 0}>
            <article className="page-card p-5 md:p-7 lg:p-8 cms-article">
              <RichContent html={about.content} className="cms-article" />
            </article>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
