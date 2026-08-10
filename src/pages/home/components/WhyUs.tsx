import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/Animation";

const ITEMS = [
  { key: "item1", metric: "100%", metricKey: "metric1" },
  { key: "item2", metric: "275+", metricKey: "metric2" },
  { key: "item3", metric: "20+", metricKey: "metric3" },
  { key: "item4", metric: "15+", metricKey: "metric4" },
] as const;

export default function WhyUs() {
  const { t } = useTranslation();

  return (
    <section className="py-5 md:py-6 bg-transparent overflow-hidden border-t border-[#e5e5e5]/60">
      <div className="section-container relative z-10">
        <Reveal className="mb-4 max-w-2xl">
          <p className="section-eyebrow !mb-1.5">{t("whyUs.eyebrow")}</p>
          <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0a0a0a] tracking-tight">
            {t("whyUs.heading")}
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {ITEMS.map((item, i) => (
            <Reveal key={item.key} delay={i * 40} className="rounded-xl border border-[#e5e5e5]/80 bg-white/75 backdrop-blur-md p-3.5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className="font-heading text-2xl font-semibold text-[#ffd600] leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-right">
                  <p className="font-heading text-base font-bold text-[#0a1158] tabular-nums leading-none">
                    {item.metric}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#333333] uppercase tracking-wide">
                    {t(`whyUs.${item.metricKey}`)}
                  </p>
                </span>
              </div>
              <h3 className="mt-2.5 font-heading text-sm font-semibold text-[#0a0a0a] leading-snug">
                {t(`whyUs.${item.key}.title`)}
              </h3>
              <p className="mt-1 text-xs text-[#333333] leading-relaxed line-clamp-2">
                {t(`whyUs.${item.key}.desc`)}
              </p>
              <Link to="/institut" className="uni-link mt-2.5 !text-xs self-start">
                {t("common.readMore")}
                <i className="ri-arrow-right-line" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
