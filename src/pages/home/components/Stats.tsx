import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHomeData } from "@/api/home";
import type { Counter } from "@/types/content";
import { CountUp, Reveal, useInViewOnce } from "@/components/Animation";

const ICONS = ["ri-user-star-fill", "ri-group-fill", "ri-graduation-cap-fill", "ri-book-open-fill"] as const;

export default function Stats() {
  const { t } = useTranslation();
  const { ref, active } = useInViewOnce<HTMLElement>(0.2);
  const [counter, setCounter] = useState<Counter | null>(null);

  useEffect(() => {
    getHomeData().then((d) => setCounter(d.counter));
  }, []);

  if (!counter) return null;

  const stats = [
    { value: counter.professor_teachers, label: t("stats.professorTeachers"), desc: t("stats.professorTeachersDesc"), icon: ICONS[0] },
    { value: counter.students, label: t("stats.students"), desc: t("stats.studentsDesc"), icon: ICONS[1] },
    { value: counter.graduaters, label: t("stats.graduates"), desc: t("stats.graduatesDesc"), icon: ICONS[2] },
    { value: counter.book_fund, label: t("stats.bookFund"), desc: t("stats.bookFundDesc"), icon: ICONS[3] },
  ];

  return (
    <section ref={ref} className="relative section-pad bg-white border-y border-primary-100/80">
      <div className="section-container relative z-10">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div className="max-w-2xl">
            <p className="section-eyebrow">
              <span className="eyebrow-dot" />
              <i className="ri-bar-chart-box-fill" />
              {t("stats.eyebrow")}
            </p>
            <h2 className="section-title text-[clamp(1.5rem,2.8vw,2.2rem)]">
              {t("stats.headingPrefix")}{" "}
              <span className="gradient-text">{t("stats.headingHighlight")}</span>{" "}
              {t("stats.headingSuffix")}
            </h2>
            <p className="mt-3 text-sm md:text-base text-foreground-600 leading-relaxed">{t("stats.description")}</p>
            <p className="mt-2 text-xs text-foreground-400">{t("stats.note")}</p>
          </div>
          <Link to="/institut" className="uni-link shrink-0 cursor-pointer self-start md:self-auto">
            {t("about.readMore")}
            <i className="ri-arrow-right-line" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 70}
              className="med-card px-5 py-6 md:px-6 md:py-7 group"
            >
              <span className="inline-flex w-11 h-11 rounded-xl bg-primary-50 text-primary-700 items-center justify-center mb-5 group-hover:bg-primary-700 group-hover:text-white transition-colors">
                <i className={`${s.icon} text-lg`} />
              </span>
              <p className="font-heading text-3xl md:text-4xl font-extrabold tabular-nums leading-none tracking-tight text-primary-950">
                <CountUp target={s.value} active={active} />
                <span className="text-secondary-600">+</span>
              </p>
              <p className="mt-3 text-sm font-bold text-foreground-900 leading-snug">{s.label}</p>
              <p className="mt-1.5 text-xs text-foreground-500 leading-relaxed">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
