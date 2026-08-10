import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getFaculty } from "@/api/faculty";
import type { FacultyDetail } from "@/types/content";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";
import PageHeader from "@/components/shared/PageHeader";
import MenuSectionNav from "@/components/shared/MenuSectionNav";
import FacultyPageContent from "@/components/shared/FacultyPageContent";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { stripHtml } from "@/lib/html";
import { FACULTY_MENU_ID } from "@/lib/facultySection";

export default function FacultyPage() {
  const { t } = useTranslation();
  const { menuId, slug } = useParams<{ menuId: string; slug: string }>();
  const [faculty, setFaculty] = useState<FacultyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getFaculty(slug, menuId ? Number(menuId) : undefined)
      .then(setFaculty)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("common.genericError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, menuId]);

  usePageMeta(faculty?.title, faculty ? stripHtml(faculty.content).slice(0, 160) : null);

  if (loading) return <LoadingState />;
  if (error || !faculty) return <ErrorState message={error ?? undefined} />;

  return (
    <div className="text-foreground-950">
      <PageHeader title={faculty.title} breadcrumb={t("nav.section.fakultetlar")} compact />

      <section className="section-container section-pad pb-16 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8 min-w-0">
            <Reveal>
              <FacultyPageContent faculty={faculty} slug={slug ?? ""} />
            </Reveal>
          </div>

          <aside className="lg:col-span-4 min-w-0">
            <Reveal delay={80}>
              <MenuSectionNav menuId={FACULTY_MENU_ID} currentSlug={slug} />
            </Reveal>
          </aside>
        </div>
      </section>
    </div>
  );
}
