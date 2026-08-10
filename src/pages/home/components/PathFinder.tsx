import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/Animation";
import { aiPathfinder } from "@/api/ai";
import AiPanel from "@/components/ai/AiPanel";

type Interest = "clinic" | "public" | "science" | "global";
type Level = "bakalavriat" | "magistratura" | "ordinatura";

const INTERESTS: { id: Interest }[] = [
  { id: "clinic" },
  { id: "public" },
  { id: "science" },
  { id: "global" },
];

const LEVELS: { id: Level; years: string }[] = [
  { id: "bakalavriat", years: "5" },
  { id: "magistratura", years: "2" },
  { id: "ordinatura", years: "2–3" },
];

const HOW_STEPS = ["how1", "how2", "how3"] as const;

function recommend(interest: Interest, level: Level) {
  const trackKey =
    interest === "clinic"
      ? "trackClinic"
      : interest === "public"
        ? "trackPublic"
        : interest === "science"
          ? "trackScience"
          : "trackGlobal";
  return { trackKey, level, interest };
}

export default function PathFinder() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [interest, setInterest] = useState<Interest | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [freeText, setFreeText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState<{
    title: string;
    summary: string;
    faculty?: string;
    level?: string;
    steps?: string[];
    links?: { label?: string; href: string }[];
  } | null>(null);

  const result = useMemo(() => {
    if (!interest || !level) return null;
    return recommend(interest, level);
  }, [interest, level]);

  function reset() {
    setStep(0);
    setInterest(null);
    setLevel(null);
    setAiResult(null);
    setAiError("");
  }

  async function runAiAdvice() {
    if (!freeText.trim() && !interest) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await aiPathfinder({
        freeText,
        interest: interest || undefined,
        level: level || undefined,
        lang: i18n.language,
      });
      setAiResult(res);
      setStep(2);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : t("ai.error"));
    } finally {
      setAiLoading(false);
    }
  }

  const stepLabels = [t("pathFinder.stepLabel1"), t("pathFinder.stepLabel2"), t("pathFinder.stepLabel3")];

  return (
    <section id="pathfinder" className="py-5 md:py-6 bg-transparent overflow-hidden relative border-t border-[#e5e5e5]/60">
      <div className="section-container relative z-10">
        <Reveal className="mb-5 max-w-3xl">
          <p className="section-eyebrow !mb-2">{t("pathFinder.eyebrow")}</p>
          <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-[#0a0a0a] tracking-tight">
            {t("pathFinder.headingPrefix")} {t("pathFinder.headingHighlight")}
          </h2>
          <p className="mt-2 text-sm md:text-base text-[#333333] leading-relaxed">
            {t("pathFinder.sub")}
          </p>
        </Reveal>

        <Reveal delay={40}>
          <div className="mb-5 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e5e5] border border-[#e5e5e5]/80 rounded-2xl bg-white/80 backdrop-blur-md overflow-hidden">
            {HOW_STEPS.map((key, i) => (
              <div
                key={key}
                className={`px-5 py-4 flex items-start gap-3 ${step === i ? "bg-[#e8eaf5]/60" : ""}`}
              >
                <span
                  className={`font-heading text-lg font-semibold flex-shrink-0 leading-none pt-0.5 ${
                    step === i ? "text-[#0a1158]" : "text-[#555555]"
                  }`}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-[#0a0a0a] leading-snug pt-0.5">{t(`pathFinder.${key}`)}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={60}>
          <AiPanel title={t("ai.pathfinderTitle")} subtitle={t("ai.pathfinderSub")} className="mb-5">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={t("ai.pathfinderPlaceholder")}
                className="flex-1 h-10 px-3 rounded-xl border border-[#e5e5e5] bg-white text-sm focus:outline-none focus:border-[#0a1158]"
              />
              <button
                type="button"
                onClick={runAiAdvice}
                disabled={aiLoading || (!freeText.trim() && !interest)}
                className="h-10 px-4 rounded-xl bg-[#0a1158] text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? t("ai.thinking") : t("ai.pathfinderRun")}
              </button>
            </div>
            {aiError && <p className="mt-2 text-xs text-red-600">{aiError}</p>}
          </AiPanel>
        </Reveal>

        <Reveal delay={80}>
          <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-[#e5e5e5]/80 shadow-sm overflow-hidden">
            <div className="border-b border-[#e5e5e5]/80 bg-white/50 px-5 md:px-6 py-3.5">
              <div className="flex items-center gap-2 mb-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex-1 h-[2px] bg-[#e5e5e5] overflow-hidden rounded-full">
                    <div
                      className={`h-full bg-[#0a1158] transition-all duration-500 ${
                        step >= i ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0a1158]">
                  {t("pathFinder.step", { n: step + 1, total: 3 })} · {stepLabels[step]}
                </p>
                {interest && (
                  <p className="text-xs font-medium text-[#333333]">
                    {t(`pathFinder.interest.${interest}.title`)}
                    {level ? ` → ${t(`pathFinder.level.${level}.title`)}` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 md:p-6">
              {step === 0 && (
                <div>
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-[#0a0a0a] mb-1.5">
                    {t("pathFinder.q1")}
                  </h3>
                  <p className="text-sm text-[#333333] mb-5">{t("pathFinder.q1hint")}</p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {INTERESTS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setInterest(item.id);
                          setStep(1);
                        }}
                        className="group text-left rounded-xl border border-[#e5e5e5] bg-[#ffffff] p-4 min-h-[44px] hover:border-[#ffd600] hover:bg-white transition-colors duration-300 cursor-pointer touch-manipulation"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="font-heading text-2xl font-semibold text-[#ffd600] leading-none">
                            {t(`pathFinder.interest.${item.id}.title`).slice(0, 1)}
                          </span>
                          <i className="ri-arrow-right-up-line text-[#555555] group-hover:text-[#0a1158] group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="font-heading font-semibold text-[#0a0a0a] group-hover:text-[#0a1158] transition-colors">
                          {t(`pathFinder.interest.${item.id}.title`)}
                        </p>
                        <p className="mt-1.5 text-sm text-[#333333] leading-relaxed line-clamp-2">
                          {t(`pathFinder.interest.${item.id}.desc`)}
                        </p>
                        <ul className="mt-3 space-y-1.5">
                          {(["p1", "p2"] as const).map((p) => (
                            <li key={p} className="flex items-start gap-2 text-xs text-[#333333]">
                              <span className="w-1 h-1 mt-1.5 rounded-full bg-[#0a1158] flex-shrink-0" />
                              {t(`pathFinder.interest.${item.id}.${p}`)}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-[11px] font-semibold text-[#0a1158] uppercase tracking-wide">
                          {t(`pathFinder.interest.${item.id}.for`)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#0a1158] hover:text-[#060a3d] cursor-pointer"
                  >
                    <i className="ri-arrow-left-line" />
                    {t("pathFinder.back")}
                  </button>
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-[#0a0a0a] mb-1.5">
                    {t("pathFinder.q2")}
                  </h3>
                  <p className="text-sm text-[#333333] mb-5">{t("pathFinder.q2hint")}</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {LEVELS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLevel(item.id);
                          setStep(2);
                        }}
                        className="group flex flex-col text-left rounded-xl border border-[#e5e5e5] bg-[#ffffff] p-4 hover:border-[#ffd600] hover:bg-white transition-colors duration-300 cursor-pointer h-full min-h-[44px] touch-manipulation"
                      >
                        <span className="flex flex-wrap items-baseline gap-2">
                          <span className="font-heading font-semibold text-[#0a0a0a] group-hover:text-[#0a1158] transition-colors">
                            {t(`pathFinder.level.${item.id}.title`)}
                          </span>
                          <span className="text-[11px] font-semibold text-[#0a1158] uppercase tracking-wide">
                            {t("pathFinder.years", { n: item.years })}
                          </span>
                        </span>
                        <span className="block text-sm text-[#333333] mt-1.5 leading-relaxed flex-1">
                          {t(`pathFinder.level.${item.id}.desc`)}
                        </span>
                        <span className="mt-3 flex flex-col gap-1">
                          {(["out1", "out2"] as const).map((o) => (
                            <span key={o} className="text-xs text-[#333333] inline-flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-[#0a1158] flex-shrink-0" />
                              {t(`pathFinder.level.${item.id}.${o}`)}
                            </span>
                          ))}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (aiResult || result) && (
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#0a1158] mb-2">
                    {t("pathFinder.resultBadge")}
                  </p>
                  <h3 className="font-heading text-xl md:text-2xl font-semibold text-[#0a0a0a] leading-snug">
                    {aiResult?.title || t(`pathFinder.${result!.trackKey}.title`)}
                  </h3>
                  <p className="mt-2 text-[#333333] leading-relaxed max-w-3xl">
                    {aiResult?.summary || t(`pathFinder.${result!.trackKey}.desc`)}
                  </p>

                  {aiResult?.faculty && (
                    <p className="mt-3 text-sm font-semibold text-[#0a1158]">
                      {aiResult.faculty}
                      {aiResult.level ? ` · ${aiResult.level}` : ""}
                    </p>
                  )}

                  {result && !aiResult && (
                    <div className="mt-5 grid sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-[#e5e5e5] bg-[#ffffff] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#0a1158] mb-1">
                          {t("pathFinder.suggestedLevel")}
                        </p>
                        <p className="font-heading font-semibold text-[#0a0a0a]">
                          {t(`pathFinder.level.${result.level}.title`)}
                        </p>
                        <p className="mt-1 text-sm text-[#333333]">
                          {t(`pathFinder.level.${result.level}.desc`)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#e5e5e5] bg-[#ffffff] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#0a1158] mb-1">
                          {t("pathFinder.interestLabel")}
                        </p>
                        <p className="font-heading font-semibold text-[#0a0a0a]">
                          {t(`pathFinder.interest.${result.interest}.title`)}
                        </p>
                        <p className="mt-1 text-sm text-[#333333]">
                          {t(`pathFinder.interest.${result.interest}.desc`)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 border-t border-[#e5e5e5] pt-4">
                    <p className="text-sm font-semibold text-[#0a0a0a] mb-2">{t("pathFinder.nextTitle")}</p>
                    <ul className="grid sm:grid-cols-3 gap-2">
                      {aiResult?.steps?.length
                        ? aiResult.steps.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-sm text-[#0a0a0a]">
                              <i className="ri-arrow-right-s-line text-[#0a1158] mt-0.5" />
                              {s}
                            </li>
                          ))
                        : (["n1", "n2", "n3"] as const).map((n) => (
                            <li key={n} className="flex items-start gap-2 text-sm text-[#0a0a0a]">
                              <i className="ri-arrow-right-s-line text-[#0a1158] mt-0.5" />
                              {t(`pathFinder.${result!.trackKey}.${n}`)}
                            </li>
                          ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <Link to="/qabul" className="uni-btn cursor-pointer">
                      {t("admission.applyNow")}
                    </Link>
                    <a href="#faculties-news" className="uni-link cursor-pointer">
                      {t("pathFinder.browseFaculties")}
                    </a>
                    {aiResult?.links?.slice(0, 2).map((l) =>
                      l.href.startsWith("http") ? (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="uni-link cursor-pointer">
                          {l.label || l.href}
                        </a>
                      ) : (
                        <Link key={l.href} to={l.href} className="uni-link cursor-pointer">
                          {l.label || l.href}
                        </Link>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={reset}
                      className="text-sm font-medium text-[#333333] hover:text-[#0a1158] cursor-pointer"
                    >
                      {t("pathFinder.again")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
