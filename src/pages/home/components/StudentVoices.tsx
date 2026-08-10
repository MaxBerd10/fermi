import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/Animation";

const VOICES = [
  { id: "v1", initials: "MA" },
  { id: "v2", initials: "SN" },
  { id: "v3", initials: "DK" },
  { id: "v4", initials: "YR" },
] as const;

const FACTS = ["fact1", "fact2", "fact3", "fact4"] as const;

export default function StudentVoices() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % VOICES.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [paused]);

  const voice = VOICES[index];

  return (
    <section className="py-5 md:py-6 bg-transparent overflow-hidden relative border-t border-[#e5e5e5]/60">
      <div className="section-container relative z-10">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <div className="max-w-xl">
            <p className="section-eyebrow !mb-1.5">{t("voices.eyebrow")}</p>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0a0a0a] tracking-tight">
              {t("voices.headingPrefix")} {t("voices.headingHighlight")}
            </h2>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          <Reveal className="lg:col-span-7">
            <div
              className="rounded-2xl border border-[#e5e5e5]/80 bg-white/80 backdrop-blur-md p-4 md:p-5"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div key={voice.id} className="animate-fade-in-up">
                <p className="font-heading text-lg md:text-xl text-[#0a0a0a] font-medium leading-snug">
                  “{t(`voices.${voice.id}.quote`)}”
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg border border-[#e5e5e5] bg-white flex items-center justify-center text-xs font-bold text-[#0a1158]">
                    {voice.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#0a0a0a]">{t(`voices.${voice.id}.name`)}</p>
                    <p className="text-[11px] font-semibold text-[#0a1158] uppercase tracking-wide">
                      {t(`voices.${voice.id}.meta`)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                {VOICES.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1 rounded-full transition-all cursor-pointer ${
                      i === index ? "w-6 bg-[#0a1158]" : "w-2 bg-[#e5e5e5] hover:bg-[#ffd600]"
                    }`}
                    aria-label={t("voices.dot", { n: i + 1 })}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={40} className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-2">
              {FACTS.map((key) => (
                <div key={key} className="rounded-xl border border-[#e5e5e5]/80 bg-white/75 backdrop-blur-sm px-3 py-2.5">
                  <p className="font-heading text-xl font-bold text-[#0a1158] tabular-nums leading-none">
                    {t(`voices.${key}.value`)}
                  </p>
                  <p className="mt-1 text-[11px] text-[#333333] leading-snug">{t(`voices.${key}.label`)}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
