import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getImentorTestStats, getImentorSampleQuestions } from "@/api/imentor";
import { downloadTestResultPdf } from "@/lib/testResultPdf";
import type { ImentorSubjectStat, ImentorSampleQuestion, ImentorQuestionLang } from "@/types/imentor";

const STUDY_QUESTION_COUNT = 30;
const QUIZ_QUESTION_COUNT = 20;
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
  const [quizQuestions, setQuizQuestions] = useState<ImentorSampleQuestion[]>([]);
  const [openStudyIndex, setOpenStudyIndex] = useState<number | null>(null);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [subjectQuery, setSubjectQuery] = useState("");
  const [subjectSort, setSubjectSort] = useState<"questions" | "name">("questions");

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
    getImentorSampleQuestions({ subjectCode: s.subject_code, count: STUDY_QUESTION_COUNT })
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
    if (!subject) return;
    setStage("loading");
    setError(null);
    setPdfError(null);
    getImentorSampleQuestions({ subjectCode: subject.subject_code, count: QUIZ_QUESTION_COUNT })
      .then((data) => {
        if (data.questions.length === 0) {
          setError(t("test.noContent"));
          setStage("study");
          return;
        }
        setQuizQuestions(data.questions);
        setIndex(0);
        setSelected(null);
        setAnswers({});
        setStage("quiz");
      })
      .catch(() => {
        setError(t("test.loadError"));
        setStage("study");
      });
  }

  function selectOption(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setAnswers((prev) => ({ ...prev, [index]: i }));
  }

  function nextQuestion() {
    if (index + 1 < quizQuestions.length) {
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
    setQuizQuestions([]);
    setError(null);
    setPdfError(null);
  }

  async function downloadPdf() {
    if (!subject || quizQuestions.length === 0) return;
    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      await downloadTestResultPdf({
        subjectName: subject.subject_name,
        score,
        total: quizQuestions.length,
        percent: scorePercent,
        locale: i18n.language || "uz",
        labels: {
          title: t("test.pdf.title"),
          subject: t("test.pdf.subject"),
          result: t("test.pdf.result"),
          correctAnswers: t("test.pdf.correctAnswers"),
          score: t("test.pdf.score"),
          yourAnswer: t("test.yourAnswer"),
          correctAnswer: t("test.correctAnswer"),
          explanation: t("test.explanation"),
          correct: t("test.pdf.correct"),
          incorrect: t("test.pdf.incorrect"),
          notAnswered: t("test.pdf.notAnswered"),
          page: t("test.pdf.page"),
        },
        questions: quizQuestions.map((q, questionIndex) => {
          const content = pickLang(q, lang);
          const selectedIndex = answers[questionIndex];
          return {
            number: questionIndex + 1,
            question: content.question,
            selectedOption: selectedIndex === undefined ? undefined : `${OPTION_LETTERS[selectedIndex]}. ${content.options[selectedIndex]}`,
            correctOption: `${OPTION_LETTERS[q.correctOptionIndex]}. ${content.options[q.correctOptionIndex]}`,
            explanation: content.explanation,
            isCorrect: selectedIndex === q.correctOptionIndex,
          };
        }),
      });
    } catch {
      setPdfError(t("test.pdf.error"));
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  const score = quizQuestions.reduce((sum, q, i) => sum + (answers[i] === q.correctOptionIndex ? 1 : 0), 0);
  const scorePercent = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;
  const visibleSubjects = useMemo(() => {
    if (!subjects) return [];
    const query = subjectQuery.trim().toLocaleLowerCase();
    const filtered = query
      ? subjects.filter((item) => [item.subject_name, item.department_name, item.subject_code].some((value) => value?.toLocaleLowerCase().includes(query)))
      : subjects;

    return [...filtered].sort((a, b) =>
      subjectSort === "name"
        ? a.subject_name.localeCompare(b.subject_name, i18n.language)
        : (b.questions_total - a.questions_total) || a.subject_name.localeCompare(b.subject_name, i18n.language),
    );
  }, [subjects, subjectQuery, subjectSort, i18n.language]);

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={t("nav.test")}
        compact
        aside={
          <div className="relative flex min-h-36 items-center overflow-hidden rounded-[1.35rem] bg-[#0a1158] px-6 py-5 text-white shadow-[0_14px_30px_rgba(10,17,88,0.18)] sm:px-7 sm:py-6 lg:px-10 xl:px-12">
            <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border border-white/10" aria-hidden />
            <div className="relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-5">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ffd600]"><i className="ri-brain-line text-sm" />{t("test.libraryEyebrow")}</span>
                <p className="mt-1.5 font-heading text-[clamp(1.55rem,2.15vw,2.25rem)] font-bold leading-tight">{t("test.headerBannerTitle")}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{t("test.pickSubjectHint")}</p>
              </div>
              <div className="hidden shrink-0 grid-cols-3 gap-2 lg:grid">
                <div className="min-w-24 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center"><i className="ri-file-list-3-line text-lg text-[#ffd600]" /><strong className="mt-1 block text-xl leading-none">{subjects?.length ?? "—"}</strong><span className="mt-1 block text-[10px] text-white/70">{t("test.availableSubjects")}</span></div>
                <div className="min-w-24 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center"><i className="ri-shuffle-line text-lg text-[#ffd600]" /><strong className="mt-1 block text-xl leading-none">20</strong><span className="mt-1 block text-[10px] text-white/70">{t("test.randomQuestions")}</span></div>
                <div className="min-w-24 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center"><i className="ri-file-pdf-2-line text-lg text-[#ffd600]" /><strong className="mt-1 block text-xl leading-none">PDF</strong><span className="mt-1 block text-[10px] text-white/70">{t("test.resultReview")}</span></div>
              </div>
            </div>
          </div>
        }
      />

      <div className="section-container section-pad !pt-2 md:!pt-3">
        <div className={`${stage === "picking" ? "max-w-none" : "max-w-3xl"} mx-auto overflow-hidden`}>
          {stage === "picking" && (
            <>
              <section className="rounded-[1.35rem] border border-[#e5e8f1] bg-white p-3 shadow-[0_8px_28px_rgba(20,32,86,0.05)] sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative block flex-1">
                    <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#64709c]" aria-hidden />
                    <input
                      value={subjectQuery}
                      onChange={(event) => setSubjectQuery(event.target.value)}
                      placeholder={t("test.searchPlaceholder")}
                      className="h-12 w-full rounded-xl border border-[#e4e7f0] bg-[#fafbfe] pl-11 pr-4 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-[#0a1158] focus:bg-white focus:ring-2 focus:ring-[#dfe5ff]"
                    />
                  </label>
                  <div className="flex rounded-xl border border-[#e4e7f0] bg-[#fafbfe] p-1 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSubjectSort("questions")}
                      className={`h-10 rounded-lg px-3 text-xs font-semibold transition-colors ${subjectSort === "questions" ? "bg-[#0a1158] text-white shadow-sm" : "text-foreground-500 hover:text-[#0a1158]"}`}
                    >
                      <i className="ri-bar-chart-grouped-line mr-1.5" />
                      {t("test.sortQuestions")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubjectSort("name")}
                      className={`h-10 rounded-lg px-3 text-xs font-semibold transition-colors ${subjectSort === "name" ? "bg-[#0a1158] text-white shadow-sm" : "text-foreground-500 hover:text-[#0a1158]"}`}
                    >
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

              {subjects && subjects.length === 0 && <p className="mt-5 text-sm text-foreground-500">{t("test.noContent")}</p>}

              {subjects && subjects.length > 0 && (
                <>
                  <div className="mt-6 mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground-500">{t("test.showingSubjects", { visible: visibleSubjects.length, total: subjects.length })}</p>
                    {subjectQuery && <button type="button" onClick={() => setSubjectQuery("")} className="text-xs font-semibold text-[#0a1158] hover:underline">{t("test.clearSearch")}</button>}
                  </div>

                  {visibleSubjects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#d9dfec] bg-white px-5 py-14 text-center">
                      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff2fb] text-[#0a1158]"><i className="ri-search-eye-line text-xl" /></span>
                      <p className="font-semibold text-foreground-800">{t("test.noSearchResults")}</p>
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
                          <i className="ri-question-line" />
                          {t("test.questionsCount", { count: s.questions_total })}
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

              {error && <p className="text-sm text-red-600 mb-4" role="alert">{error}</p>}

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
            quizQuestions[index] &&
            (() => {
              const q = quizQuestions[index];
              const content = pickLang(q, lang);
              const isAnswered = selected !== null;
              return (
                <div>
                  <div className="h-1.5 w-full rounded-full bg-[#eee] overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-300"
                      style={{ width: `${((index + (isAnswered ? 1 : 0)) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold">
                      <i className="ri-file-list-3-line" />
                      {t("test.questionOf", { current: index + 1, total: quizQuestions.length })}
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
                      {index + 1 < quizQuestions.length ? t("test.next") : t("test.finish")}
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
              <p className="text-2xl font-bold text-primary-800 mb-1" aria-live="polite">
                {t("test.resultScore", { correct: score, total: quizQuestions.length })}
              </p>
              <p className="text-sm font-semibold text-foreground-600 mb-6">
                {t("test.resultPercent", { percent: scorePercent })}
              </p>
              {pdfError && <p className="text-sm text-red-600 mb-4" role="alert">{pdfError}</p>}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={downloadPdf} disabled={isDownloadingPdf} className="uni-btn cursor-pointer disabled:cursor-wait disabled:opacity-60">
                  <i className={isDownloadingPdf ? "ri-loader-4-line animate-spin" : "ri-file-download-line"} />
                  {isDownloadingPdf ? t("test.pdf.generating") : t("test.pdf.download")}
                </button>
                <button type="button" onClick={retry} className="uni-btn-ghost !text-primary-800 !border-primary-200 !bg-primary-50 hover:!bg-primary-100 cursor-pointer">
                  <i className="ri-refresh-line" />
                  {t("test.retry")}
                </button>
                <button type="button" onClick={() => setStage("study")} className="uni-btn-ghost !text-primary-800 !border-primary-200 !bg-primary-50 hover:!bg-primary-100 cursor-pointer">
                  {t("test.backToStudy")}
                </button>
                <button type="button" onClick={backToSubjects} className="uni-btn-ghost !text-primary-800 !border-primary-200 !bg-primary-50 hover:!bg-primary-100 cursor-pointer">
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
