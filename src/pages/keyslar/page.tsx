import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getImentorKeyStats, getImentorCaseScenarios } from "@/api/imentor";
import type { ImentorSubjectStat, ImentorCaseScenario } from "@/types/imentor";

type Stage = "picking" | "loading" | "list";

const SUBJECT_ICONS = ["ri-file-list-3-line", "ri-first-aid-kit-line", "ri-heart-pulse-line", "ri-mental-health-line", "ri-syringe-line", "ri-hospital-line"];

export default function KeyslarPage() {
  const { t, i18n } = useTranslation();
  usePageMeta(t("nav.keyslar"));

  const [stage, setStage] = useState<Stage>("picking");
  const [subjects, setSubjects] = useState<ImentorSubjectStat[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<ImentorSubjectStat | null>(null);
  const [cases, setCases] = useState<ImentorCaseScenario[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subjectQuery, setSubjectQuery] = useState("");
  const [subjectSort, setSubjectSort] = useState<"cases" | "name">("cases");

  useEffect(() => {
    let cancelled = false;
    getImentorKeyStats()
      .then((data) => {
        if (!cancelled) setSubjects(data);
      })
      .catch(() => {
        if (!cancelled) setError(t("test.loadError"));
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  function openSubject(s: ImentorSubjectStat) {
    setSubject(s);
    setStage("loading");
    setError(null);
    getImentorCaseScenarios({ subjectCode: s.subject_code, count: 50 })
      .then((data) => {
        if (data.results.length === 0) {
          setError(t("keyslar.noContent"));
          setStage("picking");
          return;
        }
        setCases(data.results);
        setOpenIndex(null);
        setStage("list");
      })
      .catch(() => {
        setError(t("test.loadError"));
        setStage("picking");
      });
  }

  function backToSubjects() {
    setStage("picking");
    setSubject(null);
    setCases([]);
    setError(null);
  }

  const visibleSubjects = useMemo(() => {
    if (!subjects) return [];
    const validSubjects = subjects.filter((item) => item.subject_name?.trim());
    const query = subjectQuery.trim().toLocaleLowerCase();
    const filtered = query
      ? validSubjects.filter((item) =>
          [item.subject_name, item.department_name, item.subject_code].some((value) =>
            value?.toLocaleLowerCase().includes(query),
          ),
        )
      : validSubjects;

    return [...filtered].sort((a, b) =>
      subjectSort === "name"
        ? a.subject_name.localeCompare(b.subject_name, i18n.language)
        : ((b.case_count || 0) - (a.case_count || 0)) || a.subject_name.localeCompare(b.subject_name, i18n.language),
    );
  }, [subjects, subjectQuery, subjectSort, i18n.language]);

  const subjectCount = subjects?.filter((item) => item.subject_name?.trim()).length ?? 0;
  const caseTotal = subjects?.reduce((total, item) => total + (item.case_count || 0), 0) ?? 0;

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={t("nav.keyslar")}
        compact
        aside={
          <div className="relative flex min-h-36 items-center overflow-hidden rounded-[1.35rem] bg-[#0a1158] px-6 py-5 text-white shadow-[0_14px_30px_rgba(10,17,88,0.18)] sm:px-7 sm:py-6 lg:px-10 xl:px-12">
            <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border border-white/10" aria-hidden />
            <div className="relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-5">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ffd600]"><i className="ri-stethoscope-line text-sm" />{t("keyslar.libraryEyebrow")}</span>
                <p className="mt-1.5 font-heading text-[clamp(1.55rem,2.15vw,2.25rem)] font-bold leading-tight">{t("keyslar.headerBannerTitle")}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{t("keyslar.pickSubjectHint")}</p>
              </div>
              <div className="hidden shrink-0 grid-cols-3 gap-2 lg:grid">
                <div className="min-w-24 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center"><i className="ri-file-text-line text-lg text-[#ffd600]" /><strong className="mt-1 block text-xl leading-none">{subjects ? subjectCount : "—"}</strong><span className="mt-1 block text-[10px] text-white/70">{t("keyslar.availableSubjects")}</span></div>
                <div className="min-w-24 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center"><i className="ri-heart-pulse-line text-lg text-[#ffd600]" /><strong className="mt-1 block text-xl leading-none">{subjects ? caseTotal : "—"}</strong><span className="mt-1 block text-[10px] text-white/70">{t("keyslar.caseScenarios")}</span></div>
                <div className="min-w-24 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center"><i className="ri-file-search-line text-lg text-[#ffd600]" /><strong className="mt-1 block text-xl leading-none">✓</strong><span className="mt-1 block text-[10px] text-white/70">{t("keyslar.answerAnalysis")}</span></div>
              </div>
            </div>
          </div>
        }
      />

      <div className="section-container section-pad !pt-2 md:!pt-3">
        <div className={stage === "picking" ? "mx-auto max-w-none" : "page-card mx-auto max-w-3xl p-5 md:p-6"}>
          {stage === "picking" && (
            <>
              <section className="rounded-[1.35rem] border border-[#e5e8f1] bg-white p-3 shadow-[0_8px_28px_rgba(20,32,86,0.05)] sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative block flex-1">
                    <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#64709c]" aria-hidden />
                    <input
                      value={subjectQuery}
                      onChange={(event) => setSubjectQuery(event.target.value)}
                      placeholder={t("keyslar.searchPlaceholder")}
                      className="h-12 w-full rounded-xl border border-[#e4e7f0] bg-[#fafbfe] pl-11 pr-4 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-[#0a1158] focus:bg-white focus:ring-2 focus:ring-[#dfe5ff]"
                    />
                  </label>
                  <div className="flex rounded-xl border border-[#e4e7f0] bg-[#fafbfe] p-1 sm:w-auto">
                    <button type="button" onClick={() => setSubjectSort("cases")} className={`h-10 rounded-lg px-3 text-xs font-semibold transition-colors ${subjectSort === "cases" ? "bg-[#0a1158] text-white shadow-sm" : "text-foreground-500 hover:text-[#0a1158]"}`}>
                      <i className="ri-file-list-3-line mr-1.5" />
                      {t("keyslar.sortCases")}
                    </button>
                    <button type="button" onClick={() => setSubjectSort("name")} className={`h-10 rounded-lg px-3 text-xs font-semibold transition-colors ${subjectSort === "name" ? "bg-[#0a1158] text-white shadow-sm" : "text-foreground-500 hover:text-[#0a1158]"}`}>
                      <i className="ri-sort-alphabet-asc mr-1.5" />
                      {t("test.sortName")}
                    </button>
                  </div>
                </div>
              </section>

              {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

              {subjects === null && !error && (
                <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-foreground-500">
                  <i className="ri-loader-4-line animate-spin" />
                  {t("test.loading")}
                </div>
              )}

              {subjects && subjects.length === 0 && <p className="mt-5 text-sm text-foreground-500">{t("keyslar.noContent")}</p>}

              {subjects && subjects.length > 0 && (
                <>
                  <div className="mt-6 mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground-500">{t("keyslar.showingSubjects", { visible: visibleSubjects.length, total: subjectCount })}</p>
                    {subjectQuery && <button type="button" onClick={() => setSubjectQuery("")} className="text-xs font-semibold text-[#0a1158] hover:underline">{t("test.clearSearch")}</button>}
                  </div>
                  {visibleSubjects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#d9dfec] bg-white px-5 py-14 text-center">
                      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff2fb] text-[#0a1158]"><i className="ri-search-eye-line text-xl" /></span>
                      <p className="font-semibold text-foreground-800">{t("keyslar.noSearchResults")}</p>
                    </div>
                  ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleSubjects.map((s) => {
                    const iconIndex = subjects.findIndex((item) => item.subject_code === s.subject_code);
                    return (
                    <button
                      key={s.subject_code}
                      type="button"
                      onClick={() => openSubject(s)}
                      className="group relative flex min-h-48 flex-col overflow-hidden rounded-2xl border border-[#e4e7f0] bg-white p-4 text-left shadow-[0_6px_18px_rgba(20,32,86,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#b8c5f4] hover:shadow-[0_14px_28px_rgba(20,32,86,0.10)] focus:outline-none focus:ring-2 focus:ring-[#ffd600] focus:ring-offset-2 cursor-pointer"
                    >
                      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[4rem] bg-[#f6f8ff] transition-colors group-hover:bg-[#edf1ff]" aria-hidden />
                      <div className="relative flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8edff] text-[#0a1158] transition-colors group-hover:bg-[#0a1158] group-hover:text-white">
                          <i className={`${SUBJECT_ICONS[iconIndex % SUBJECT_ICONS.length]} text-lg`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-heading text-[15px] font-bold leading-snug text-foreground-900 line-clamp-3">{s.subject_name}</div>
                          {s.department_name && <div className="mt-1 text-xs text-foreground-500 line-clamp-1">{s.department_name}</div>}
                        </div>
                      </div>
                      <div className="relative mt-auto flex items-end justify-between gap-3 pt-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#0a1158]">
                          <i className="ri-file-text-line" />
                          {t("keyslar.casesCount", { count: s.case_count || 0 })}
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e1e5ef] text-foreground-400 transition-all group-hover:border-[#0a1158] group-hover:bg-[#0a1158] group-hover:text-white group-hover:translate-x-0.5">
                          <i className="ri-arrow-right-line" />
                        </span>
                      </div>
                    </button>
                    );
                  })}
                </div>
                  )}
                </>
              )}
            </>
          )}

          {stage === "loading" && (
            <div className="flex items-center justify-center gap-2 text-foreground-500 text-sm py-16">
              <i className="ri-loader-4-line animate-spin" />
              {t("test.loading")}
            </div>
          )}

          {stage === "list" && subject && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-heading font-bold text-foreground-900">{subject.subject_name}</div>
                  <div className="text-xs text-foreground-500">{t("keyslar.casesCount", { count: cases.length })}</div>
                </div>
                <button type="button" onClick={backToSubjects} className="text-xs text-foreground-400 hover:text-primary-700 cursor-pointer whitespace-nowrap">
                  <i className="ri-arrow-left-line mr-0.5" />
                  {t("keyslar.backToSubjects")}
                </button>
              </div>

              <div className="space-y-3">
                {cases.map((c, i) => {
                  const isOpen = openIndex === i;
                  return (
                    <div key={i} className="page-card p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-7 h-7 shrink-0 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-sm text-foreground-800 leading-relaxed whitespace-pre-line">{c.scenario}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        className="ml-10 text-xs font-semibold text-primary-700 hover:text-primary-900 cursor-pointer inline-flex items-center gap-1"
                      >
                        <i className={`ri-arrow-down-s-line transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        {isOpen ? t("keyslar.hideAnswer") : t("keyslar.viewAnswer")}
                      </button>
                      {isOpen && (
                        <div className="ml-10 mt-3 page-card !bg-primary-50/60 p-3.5 text-sm text-foreground-700 whitespace-pre-line">
                          <span className="font-semibold text-foreground-900">{t("keyslar.answerLabel")}: </span>
                          {c.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
