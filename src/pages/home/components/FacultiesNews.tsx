import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHomeData } from "@/api/home";
import { aiFaculty } from "@/api/ai";
import type { FacultyListItem } from "@/types/content";
import { Reveal } from "@/components/Animation";
import AiPanel from "@/components/ai/AiPanel";

function facultyDescKey(title: string, index: number): string {
  const s = title.toLowerCase();
  if (/davolash|лечеб|treatment|general/.test(s)) return "faculties.descDavolash";
  if (/profilakt|jamoat|обществен|public|prevention/.test(s)) return "faculties.descProfilaktika";
  if (/xalqaro|международ|international/.test(s)) return "faculties.descXalqaro";
  if (/pediatr|педиатр|child/.test(s)) return "faculties.descPediatriya";
  return `faculties.desc${index + 1}`;
}

function facultyIcon(title: string, index: number): string {
  const s = title.toLowerCase();
  if (/davolash|лечеб|treatment|general/.test(s)) return "ri-heart-pulse-line";
  if (/profilakt|jamoat|обществен|public|prevention/.test(s)) return "ri-shield-cross-line";
  if (/xalqaro|международ|international/.test(s)) return "ri-global-line";
  if (/pediatr|педиатр|child/.test(s)) return "ri-user-heart-line";
  if (index === 0) return "ri-stethoscope-line";
  return "ri-hospital-line";
}

type Row = {
  id: string;
  title: string;
  descKey: string;
  href: string;
  icon: string;
  index: number;
};

export default function FacultiesNews() {
  const { t, i18n } = useTranslation();
  const [faculties, setFaculties] = useState<FacultyListItem[]>([]);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [firstDepartmentSlug, setFirstDepartmentSlug] = useState<string | null>(null);
  const [advisorQ, setAdvisorQ] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState("");
  const [advisor, setAdvisor] = useState<{
    faculty: string;
    why: string;
    alternatives: string[];
    next: string[];
    href?: string;
  } | null>(null);

  useEffect(() => {
    getHomeData().then((d) => {
      setFaculties(d.faculties);
      setDepartmentCount(d.departments.length);
      setFirstDepartmentSlug(d.departments[0]?.slug ?? null);
    });
  }, []);

  if (faculties.length === 0) return null;

  const facultyRows = faculties.slice(0, 4);
  const rows: Row[] = facultyRows.map((f, i) => ({
    id: String(f.id),
    title: f.title,
    descKey: facultyDescKey(f.title, i),
    href: `/faculty/0/${f.slug}`,
    icon: facultyIcon(f.title, i),
    index: i,
  }));

  if (firstDepartmentSlug) {
    rows.push({
      id: "departments",
      title: t("faculties.departmentsCount", { count: departmentCount }),
      descKey: "faculties.departmentsDesc",
      href: `/departments/0/${firstDepartmentSlug}`,
      icon: "ri-building-4-line",
      index: rows.length,
    });
  }

  rows.push({
    id: "pathfinder",
    title: t("faculties.pathFinderTitle"),
    descKey: "faculties.pathFinderDesc",
    href: "#pathfinder",
    icon: "ri-compass-3-line",
    index: rows.length,
  });

  // Keep a full 2×3 grid if departments are missing
  if (rows.length < 6) {
    rows.push({
      id: "clinical",
      title: t("faculties.clinicalTitle"),
      descKey: "faculties.clinicalDesc",
      href: "/institut",
      icon: "ri-hospital-line",
      index: rows.length,
    });
  }

  return (
    <section id="faculties-news" className="py-5 md:py-6 bg-transparent overflow-hidden border-t border-[#e5e5e5]/60">
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 lg:items-stretch">
          {/* Left: intro top + AI bottom (aligned with cards) */}
          <Reveal variant="left" className="lg:col-span-4 h-full flex flex-col gap-4">
            <div className="flex flex-col">
              <p className="section-eyebrow">{t("faculties.eyebrow")}</p>
              <h2 className="section-title mb-2.5">{t("faculties.heading")}</h2>
              <p className="text-sm text-foreground-600 leading-relaxed mb-2">
                {t("faculties.intro")}
              </p>
              <p className="text-sm text-foreground-500 leading-relaxed mb-4">
                {t("faculties.introMore")}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl border border-[#e5e5e5]/80 bg-white/75 backdrop-blur-md px-3 py-2.5">
                  <p className="font-heading text-lg font-bold text-[#0a1158] tabular-nums leading-none">
                    {facultyRows.length}+
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#555555]">
                    {t("faculties.eyebrow")}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e5e5e5]/80 bg-white/75 backdrop-blur-md px-3 py-2.5">
                  <p className="font-heading text-lg font-bold text-[#0a1158] tabular-nums leading-none">
                    {departmentCount || "—"}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#555555]">
                    {t("faculties.departmentsLabel")}
                  </p>
                </div>
              </div>

              <Link to="/institut" className="uni-btn self-start cursor-pointer">
                {t("faculties.viewAll")}
                <i className="ri-arrow-right-line" />
              </Link>
            </div>

            <AiPanel
              className="mt-auto"
              title={t("ai.facultyTitle")}
              subtitle={t("ai.facultySub")}
            >
              <textarea
                value={advisorQ}
                onChange={(e) => setAdvisorQ(e.target.value)}
                rows={2}
                placeholder={t("ai.facultyPlaceholder")}
                className="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] bg-white text-sm focus:outline-none focus:border-[#0a1158] resize-none"
              />
              <button
                type="button"
                disabled={advisorLoading || !advisorQ.trim()}
                onClick={async () => {
                  setAdvisorLoading(true);
                  setAdvisorError("");
                  try {
                    setAdvisor(await aiFaculty(advisorQ, i18n.language));
                  } catch (e) {
                    setAdvisorError(e instanceof Error ? e.message : t("ai.error"));
                  } finally {
                    setAdvisorLoading(false);
                  }
                }}
                className="mt-2 h-9 px-3 rounded-full bg-[#0a1158] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {advisorLoading ? t("ai.thinking") : t("ai.ask")}
              </button>
              {advisorError && <p className="mt-2 text-xs text-red-600">{advisorError}</p>}
              {advisor && (
                <div className="mt-3 text-sm space-y-1.5">
                  <p className="font-semibold text-[#0a1158]">{advisor.faculty}</p>
                  <p className="text-[#333333] leading-relaxed">
                    <span className="font-medium">{t("ai.why")}: </span>
                    {advisor.why}
                  </p>
                  {advisor.alternatives?.length > 0 && (
                    <p className="text-xs text-[#555555]">
                      {t("ai.alternatives")}: {advisor.alternatives.join(", ")}
                    </p>
                  )}
                  {advisor.next?.length > 0 && (
                    <ul className="text-xs text-[#0a0a0a] space-y-1 pt-1">
                      {advisor.next.map((n) => (
                        <li key={n} className="flex gap-1.5">
                          <i className="ri-arrow-right-s-line text-[#0a1158]" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </AiPanel>
          </Reveal>

          {/* Right: compact 2×3 cards */}
          <Reveal delay={60} variant="right" className="lg:col-span-8 h-full">
            <div className="grid sm:grid-cols-2 gap-2.5 h-full content-stretch">
              {rows.slice(0, 6).map((row) => {
                const cardClass =
                  "group flex flex-col gap-2 rounded-2xl border border-[#e5e5e5]/80 bg-white/80 backdrop-blur-md p-3.5 md:p-4 hover:border-[#ffd600] hover:shadow-[0_10px_28px_rgba(10,17,88,0.08)] transition-all cursor-pointer h-full min-h-0";
                const body = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex w-9 h-9 rounded-xl bg-[#0a1158]/[0.06] text-[#0a1158] items-center justify-center group-hover:bg-[#ffd600]/25 transition-colors">
                        <i className={`${row.icon} text-base`} />
                      </span>
                      <span className="font-heading text-base font-semibold text-[#0a1158]/25 tabular-nums leading-none group-hover:text-[#0a1158]/45 transition-colors">
                        {String(row.index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm font-semibold text-[#0a0a0a] group-hover:text-[#0a1158] transition-colors leading-snug">
                        {row.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#555555] leading-relaxed line-clamp-2">
                        {t(row.descKey)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a1158] opacity-70 group-hover:opacity-100 transition-opacity">
                      {t("common.readMore")}
                      <i className="ri-arrow-right-line text-sm group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </>
                );
                return row.href.startsWith("#") ? (
                  <a key={row.id} href={row.href} className={cardClass}>
                    {body}
                  </a>
                ) : (
                  <Link key={row.id} to={row.href} className={cardClass}>
                    {body}
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
