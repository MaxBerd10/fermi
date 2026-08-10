import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLeaders } from "@/api/leaders";
import type { LeadersResponse } from "@/types/content";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";
import PageHeader from "@/components/shared/PageHeader";
import LeaderSectionNav from "@/components/shared/LeaderSectionNav";
import LeaderFeaturedProfile from "@/components/shared/LeaderFeaturedProfile";
import LeaderProrectorCard from "@/components/shared/LeaderProrectorCard";
import LeaderDepartmentCard from "@/components/shared/LeaderDepartmentCard";
import LeaderListToolbar from "@/components/shared/LeaderListToolbar";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  getLeaderPageIntroKey,
  isLeaderFeaturedPage,
  isVacantLeader,
  LEADER_SECTION_MENU_ID,
} from "@/lib/leaderSection";

export default function LeaderPage() {
  const { t, i18n } = useTranslation();
  const { menuId, slug } = useParams<{ menuId: string; slug: string }>();
  const [data, setData] = useState<LeadersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const resolvedMenuId = menuId ? Number(menuId) : undefined;
  const isLeaderSection = resolvedMenuId === LEADER_SECTION_MENU_ID;
  const isProrectorPage = slug === "prorektorlar";
  const isDepartmentPage = slug === "kafedra-mudirlari";

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setQuery("");
    setOpenId(null);
    getLeaders(slug, resolvedMenuId)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("common.genericError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, menuId, i18n.language]);

  const leaders = useMemo(
    () => (data?.leaders ?? []).filter((l) => !isVacantLeader(l.name)),
    [data?.leaders],
  );

  const filteredLeaders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leaders;
    return leaders.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.position.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q),
    );
  }, [leaders, query]);

  usePageMeta(data?.category.title);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? undefined} />;

  const introKey = getLeaderPageIntroKey(slug);
  const featured = isLeaderFeaturedPage(slug, leaders.length);
  const showToolbar = isProrectorPage || isDepartmentPage;

  const toggleOpen = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={data.category.title}
        breadcrumb={isLeaderSection ? t("leader.breadcrumb") : data.category.title}
        compact
      />

      <section className="section-container section-pad pb-16 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8 min-w-0">
            {introKey && (
              <Reveal>
                <p className="leader-section__intro">{t(introKey)}</p>
              </Reveal>
            )}

            {leaders.length === 0 && (
              <Reveal>
                <div className="page-card px-5 py-8 text-center">
                  <p className="text-foreground-500">{t("leader.empty")}</p>
                </div>
              </Reveal>
            )}

            {featured && leaders[0] && (
              <Reveal>
                <LeaderFeaturedProfile leader={leaders[0]} slug={slug!} />
              </Reveal>
            )}

            {!featured && leaders.length > 0 && (
              <>
                {showToolbar && (
                  <Reveal>
                    <LeaderListToolbar
                      query={query}
                      onQueryChange={setQuery}
                      total={leaders.length}
                      filtered={filteredLeaders.length}
                      showSearch={isDepartmentPage || leaders.length > 4}
                    />
                  </Reveal>
                )}

                {filteredLeaders.length === 0 ? (
                  <Reveal>
                    <p className="leader-empty-search">{t("leader.noSearchResults")}</p>
                  </Reveal>
                ) : isProrectorPage ? (
                  <div className="leader-prorector-list">
                    {filteredLeaders.map((leader, index) => (
                      <Reveal key={leader.id} delay={Math.min(index * 50, 250)}>
                        <LeaderProrectorCard
                          leader={leader}
                          open={openId === leader.id}
                          onToggle={() => toggleOpen(leader.id)}
                        />
                      </Reveal>
                    ))}
                  </div>
                ) : isDepartmentPage ? (
                  <div className="leader-dept-list">
                    {filteredLeaders.map((leader, index) => (
                      <Reveal key={leader.id} delay={Math.min(index * 30, 300)}>
                        <LeaderDepartmentCard
                          leader={leader}
                          index={index}
                          open={openId === leader.id}
                          onToggle={() => toggleOpen(leader.id)}
                        />
                      </Reveal>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {isLeaderSection && (
            <aside className="lg:col-span-4 min-w-0">
              <Reveal delay={100}>
                <LeaderSectionNav currentSlug={slug} />
              </Reveal>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}
