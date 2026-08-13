import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getImentorTestStats, getImentorSampleQuestions } from "@/api/imentor";
import type { ImentorSubjectStat, ImentorSampleQuestion, ImentorQuestionLang } from "@/types/imentor";

const QUESTION_COUNT = 30;
const SUBJECT_ICONS = ["ri-stethoscope-line", "ri-microscope-line", "ri-capsule-line", "ri-pulse-line", "ri-heart-pulse-line", "ri-flask-line"];
const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function pickLang(q: ImentorSampleQuestion, lang: string): ImentorQuestionLang {
  return q.languages[lang] || q.languages[q.available_languages[0]] || Object.values(q.languages)[0];
}

type Stage = "picking" | "loading" | "study" | "quiz" | "result";

export default function TestPage() {
  const { t, i18n } = useTranslation();
  usePageMeta(t("nav.test"));
  const lang = i18n.language?.slice(0, 2) || "uz";

  const [stage, setStage] = useState<Stage>("picking");
  const [subjects, setSubjects] = useState<ImentorSubjectStat[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<ImentorSubjectStat | null>(null);
  const [questions, setQuestions] = useState<ImentorSampleQuestion[]>([]);
  const [openStudyIndex, setOpenStudyIndex] = useState<number | null>(null);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    let cancelled = false;
    getImentorTestStats()
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
    getImentorSampleQuestions({ subjectCode: s.subject_code, count: QUESTION_COUNT })
      .then((data) => {
        if (data.questions.length === 0) {
          setError(t("test.noContent"));
          setStage("picking");
          return;
        }
        setQuestions(data.questions);
        setOpenStudyIndex(null);
        setStage("study");
      })
      .catch(() => {
        setError(t("test.loadError"));
        setStage("picking");
      });
  }

  function startQuiz() {
    setIndex(0);
    setSelected(null);
    setAnswers({});
    setStage("quiz");
  }

  function selectOption(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setAnswers((prev) => ({ ...prev, [index]: i }));
  }

  function nextQuestion() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(answers[index + 1] ?? null);
    } else {
      setStage("result");
    }
  }

  function retry() {
    startQuiz();
  }

  function backToSubjects() {
    setStage("picking");
    setSubject(null);
    setQuestions([]);
    setError(null);
  }

  const score = questions.reduce((sum, q, i) => sum + (answers[i] === q.correctOptionIndex ? 1 : 0), 0);

  return (
    <div className="text-foreground-950">
      <PageHeader title={t("nav.test")} compact />

      <div className="section-container section-pad">
        <div className="page-card p-5 md:p-6 max-w-3xl mx-auto overflow-hidden">
          {stage === "picking" && (
            <>
              <h2 className="font-heading text-lg font-bold text-foreground-900 mb-1">{t("test.pickSubject")}</h2>
              <p className="text-sm text-foreground-500 mb-5">{t("test.pickSubjectHint")}</p>

              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              {subjects === null && !error && (
                <div className="flex items-center gap-2 text-foreground-500 text-sm">
                  <i className="ri-loader-4-line animate-spin" />
                  {t("test.loading")}
                </div>
              )}

              {subjects && subjects.length === 0 && <p className="text-sm text-foreground-500">{t("test.noContent")}</p>}

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
                          <i className="ri-question-line" />
                          {t("test.questionsCount", { count: s.questions_total })}
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

          {stage === "study" && subject && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="font-heading font-bold text-foreground-900">{subject.subject_name}</div>
                  <div className="text-xs text-foreground-500">{t("test.questionsCount", { count: questions.length })}</div>
                </div>
                <button type="button" onClick={backToSubjects} className="text-xs text-foreground-400 hover:text-primary-700 cursor-pointer whitespace-nowrap">
                  <i className="ri-arrow-left-line mr-0.5" />
                  {t("test.backToSubjects")}
                </button>
              </div>
              <p className="text-sm text-foreground-500 mb-4">{t("test.studyHint")}</p>

              <div className="space-y-2 mb-5">
                {questions.map((q, i) => {
                  const content = pickLang(q, lang);
                  const isOpen = openStudyIndex === i;
                  return (
                    <div key={i} className="page-card overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenStudyIndex(isOpen ? null : i)}
                        className="w-full flex items-center gap-3 p-3.5 text-left cursor-pointer"
                      >
                        <span className="w-7 h-7 shrink-0 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-medium text-foreground-800 line-clamp-1">{content.question}</span>
                        <i className={`ri-arrow-down-s-line text-foreground-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isOpen && (
                        <div className="px-3.5 pb-3.5">
                          <p className="text-sm font-semibold text-foreground-900 mb-2.5 leading-snug">{content.question}</p>
                          <div className="space-y-1.5">
                            {content.options.map((opt, oi) => {
                              const isCorrect = oi === q.correctOptionIndex;
                              return (
                                <div
                                  key={oi}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm ${
                                    isCorrect ? "border-green-500 bg-green-50 font-medium text-foreground-900" : "border-[#e5e5e5] text-foreground-600"
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                      isCorrect ? "bg-green-500 text-white" : "bg-[#eee] text-foreground-500"
                                    }`}
                                  >
                                    {isCorrect ? <i className="ri-check-line" /> : OPTION_LETTERS[oi]}
                                  </span>
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                          {content.explanation && (
                            <div className="mt-2.5 text-xs text-foreground-500">
                              <span className="font-semibold text-foreground-700">{t("test.explanation")}: </span>
                              {content.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button type="button" onClick={startQuiz} className="uni-btn cursor-pointer w-full sm:w-auto">
                <i className="ri-pencil-ruler-2-line" />
                {t("test.testYourself")}
              </button>
            </div>
          )}

          {stage === "quiz" &&
            questions[index] &&
            (() => {
              const q = questions[index];
              const content = pickLang(q, lang);
              const isAnswered = selected !== null;
              return (
                <div>
                  <div className="h-1.5 w-full rounded-full bg-[#eee] overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-300"
                      style={{ width: `${((index + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold">
                      <i className="ri-file-list-3-line" />
                      {t("test.questionOf", { current: index + 1, total: questions.length })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStage("study")}
                      className="text-xs text-foreground-400 hover:text-primary-700 cursor-pointer"
                    >
                      {t("test.backToStudy")}
                    </button>
                  </div>

                  <p className="font-heading text-base font-semibold text-foreground-900 mb-4 leading-snug">{content.question}</p>

                  <div className="space-y-2 mb-4">
                    {content.options.map((opt, i) => {
                      const isCorrect = i === q.correctOptionIndex;
                      const isSelected = i === selected;
                      let cls = "border-[#e5e5e5] hover:border-primary-200 hover:bg-primary-50/40";
                      let badgeCls = "bg-[#eee] text-foreground-500";
                      if (isAnswered && isCorrect) {
                        cls = "border-green-500 bg-green-50";
                        badgeCls = "bg-green-500 text-white";
                      } else if (isAnswered && isSelected && !isCorrect) {
                        cls = "border-red-500 bg-red-50";
                        badgeCls = "bg-red-500 text-white";
                      }
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectOption(i)}
                          disabled={isAnswered}
                          className={`w-full flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${cls} ${
                            isAnswered ? "cursor-default" : "cursor-pointer"
                          }`}
                        >
                          <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${badgeCls}`}>
                            {isAnswered && isCorrect ? (
                              <i className="ri-check-line" />
                            ) : isAnswered && isSelected && !isCorrect ? (
                              <i className="ri-close-line" />
                            ) : (
                              OPTION_LETTERS[i]
                            )}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && content.explanation && (
                    <div className="page-card !bg-primary-50/60 p-3.5 mb-4 text-sm text-foreground-700">
                      <span className="font-semibold text-foreground-900">{t("test.explanation")}: </span>
                      {content.explanation}
                    </div>
                  )}

                  {isAnswered && (
                    <button type="button" onClick={nextQuestion} className="uni-btn cursor-pointer">
                      {index + 1 < questions.length ? t("test.next") : t("test.finish")}
                      <i className="ri-arrow-right-line" />
                    </button>
                  )}
                </div>
              );
            })()}

          {stage === "result" && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-4 shadow-lg shadow-primary-500/25">
                <i className="ri-medal-line text-3xl" />
              </div>
              <h2 className="font-heading text-lg font-bold text-foreground-900 mb-2">{t("test.resultTitle")}</h2>
              <p className="text-2xl font-bold text-primary-800 mb-6">
                {t("test.resultScore", { correct: score, total: questions.length })}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={retry} className="uni-btn cursor-pointer">
                  <i className="ri-refresh-line" />
                  {t("test.retry")}
                </button>
                <button type="button" onClick={() => setStage("study")} className="uni-btn-ghost cursor-pointer">
                  {t("test.backToStudy")}
                </button>
                <button type="button" onClick={backToSubjects} className="uni-btn-ghost cursor-pointer">
                  {t("test.backToSubjects")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
