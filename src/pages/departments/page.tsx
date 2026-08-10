import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getDepartment, listDepartments } from "@/api/departments";
import { getLeaders } from "@/api/leaders";
import type { DepartmentDetail, Leader } from "@/types/content";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";
import PageHeader from "@/components/shared/PageHeader";
import MenuSectionNav from "@/components/shared/MenuSectionNav";
import DepartmentPageContent from "@/components/shared/DepartmentPageContent";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { stripHtml } from "@/lib/html";
import { normalizeYearLabels } from "@/lib/siteConstants";
import {
  DEPARTMENT_LEADERS_MENU_ID,
  DEPARTMENT_LEADERS_SLUG,
  DEPARTMENT_MENU_ID,
  matchDepartmentLeader,
} from "@/lib/departmentSection";

export default function DepartmentPage() {
  const { t } = useTranslation();
  const { menuId, slug } = useParams<{ menuId: string; slug: string }>();
  const [dept, setDept] = useState<DepartmentDetail | null>(null);
  const [head, setHead] = useState<Leader | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedMenuId = menuId ? Number(menuId) : undefined;

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setIsFallback(false);

    async function load() {
      const [leadersResult, listResult] = await Promise.allSettled([
        getLeaders(DEPARTMENT_LEADERS_SLUG, DEPARTMENT_LEADERS_MENU_ID),
        listDepartments(),
      ]);

      const leaders =
        leadersResult.status === "fulfilled" ? leadersResult.value.leaders : [];
      const list = listResult.status === "fulfilled" ? listResult.value : [];
      const matchedHead = matchDepartmentLeader(slug!, leaders);

      if (cancelled) return;
      setHead(matchedHead);

      try {
        const detail = await getDepartment(slug!, resolvedMenuId);
        if (cancelled) return;
        setDept(detail);
        if (!matchedHead && detail.leaders?.[0]) {
          setHead(detail.leaders[0]);
        }
        return;
      } catch (e) {
        const meta = list.find((item) => item.slug === slug);
        if (!meta) {
          if (!cancelled) {
            setError(e instanceof ApiError ? e.message : t("common.genericError"));
          }
          return;
        }

        if (cancelled) return;

        setDept({
          id: 0,
          title: meta.title,
          img: meta.img,
          slug: meta.slug,
          content: "",
          menu: null,
          leaders: matchedHead ? [matchedHead] : [],
        });
        setIsFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, menuId, t]);

  usePageMeta(dept?.title, dept ? stripHtml(dept.content).slice(0, 160) : null);

  if (loading) return <LoadingState />;
  if (error || !dept) return <ErrorState message={error ?? undefined} />;

  const isHistory = slug === "institut-tarixi";
  const displayTitle = normalizeYearLabels(dept.title.trim());

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={displayTitle}
        breadcrumb={isHistory ? t("footer.institutHaqida") : t("nav.section.kafedralar")}
        compact
      />

      <section className="section-pad !pt-3 md:!pt-4 bg-transparent pb-16 md:pb-20">
        <div className="section-container grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8 min-w-0">
            <Reveal>
              <DepartmentPageContent
                department={dept}
                slug={slug ?? ""}
                head={head}
                isFallback={isFallback}
              />
            </Reveal>
          </div>

          <aside className="lg:col-span-4 min-w-0">
            <Reveal delay={100}>
              <MenuSectionNav menuId={DEPARTMENT_MENU_ID} currentSlug={slug} />
            </Reveal>
          </aside>
        </div>
      </section>
    </div>
  );
}
