import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getImentorKeyStats, getImentorCaseScenarios } from "@/api/imentor";
import type { ImentorSubjectStat, ImentorCaseScenario } from "@/types/imentor";

type Stage = "picking" | "loading" | "list";

const SUBJECT_ICONS = ["ri-file-list-3-line", "ri-first-aid-kit-line", "ri-heart-pulse-line", "ri-mental-health-line", "ri-syringe-line", "ri-hospital-line"];

export default function KeyslarPage() {
  const { t } = useTranslation();
  usePageMeta(t("nav.keyslar"));

  const [stage, setStage] = useState<Stage>("picking");
  const [subjects, setSubjects] = useState<ImentorSubjectStat[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<ImentorSubjectStat | null>(null);
  const [cases, setCases] = useState<ImentorCaseScenario[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  return (
    <div className="text-foreground-950">
      <PageHeader title={t("nav.keyslar")} compact />

      <div className="section-container section-pad">
        <div className="page-card p-5 md:p-6 max-w-3xl mx-auto">
          {stage === "picking" && (
            <>
              <h2 className="font-heading text-lg font-bold text-foreground-900 mb-1">{t("keyslar.pickSubject")}</h2>
              <p className="text-sm text-foreground-500 mb-5">{t("keyslar.pickSubjectHint")}</p>

              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              {subjects === null && !error && (
                <div className="flex items-center gap-2 text-foreground-500 text-sm">
                  <i className="ri-loader-4-line animate-spin" />
                  {t("test.loading")}
                </div>
              )}

              {subjects && subjects.length === 0 && <p className="text-sm text-foreground-500">{t("keyslar.noContent")}</p>}

              {subjects && subjects.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {subjects.map((s, i) => (
                    <button
                      key={s.subject_code}
                      type="button"
                      onClick={() => openSubject(s)}
                      className="group text-left page-card p-4 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                          <i className={`${SUBJECT_ICONS[i % SUBJECT_ICONS.length]} text-lg`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-heading font-semibold text-foreground-900 mb-0.5 leading-snug">{s.subject_name}</div>
                          {s.department_name && <div className="text-xs text-foreground-500 line-clamp-1">{s.department_name}</div>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-bold">
                          <i className="ri-folder-line" />
                          {t("keyslar.casesCount", { count: s.case_count || 0 })}
                        </span>
                        <i className="ri-arrow-right-line text-foreground-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
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
