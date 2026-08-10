import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPage } from "@/api/pages";
import type { Page } from "@/types/content";
import RichContent from "@/components/shared/RichContent";
import { Reveal } from "@/components/Animation";
import { FOUNDED_YEAR } from "@/lib/siteConstants";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function InstitutPage() {
  const { t } = useTranslation();
  usePageMeta(t("footer.institutHaqida"));
  const [missionPage, setMissionPage] = useState<Page | null>(null);

  const features = [
    { icon: "ri-hospital-line", title: t("institut.feature1.title"), desc: t("institut.feature1.desc") },
    { icon: "ri-graduation-cap-line", title: t("institut.feature2.title"), desc: t("institut.feature2.desc") },
    { icon: "ri-global-line", title: t("institut.feature3.title"), desc: t("institut.feature3.desc") },
    { icon: "ri-microscope-line", title: t("institut.feature4.title"), desc: t("institut.feature4.desc") },
    { icon: "ri-team-line", title: t("institut.feature5.title"), desc: t("institut.feature5.desc") },
    { icon: "ri-heart-pulse-line", title: t("institut.feature6.title"), desc: t("institut.feature6.desc") },
  ];

  const timeline = [
    { year: FOUNDED_YEAR, title: t("institut.timeline1.title"), desc: t("institut.timeline1.desc") },
    { year: "2021", title: t("institut.timeline2.title"), desc: t("institut.timeline2.desc") },
    { year: "2022", title: t("institut.timeline3.title"), desc: t("institut.timeline3.desc") },
    { year: "2023", title: t("institut.timeline4.title"), desc: t("institut.timeline4.desc") },
    { year: "2024", title: t("institut.timeline5.title"), desc: t("institut.timeline5.desc") },
    { year: "2026", title: t("institut.timeline6.title"), desc: t("institut.timeline6.desc") },
  ];

  const stats = [
    { value: FOUNDED_YEAR, label: t("institut.statFounded") },
    { value: "275+", label: t("institut.statProfessors") },
    { value: "6,238", label: t("stats.students") },
    { value: "40+", label: t("institut.statPartnerCountries") },
  ];

  useEffect(() => {
    getPage("institut-missiyasi-va-kelajak-tasavvuri").then(setMissionPage).catch(() => {});
  }, []);

  return (
    <div className="text-foreground-950">
      {/* Hero with background image */}
      <section className="relative min-h-[320px] md:min-h-[380px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/institut-about.jpg"
            alt={t("institut.heroImageAlt")}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/95 via-primary-950/60 to-primary-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-primary-950/30 to-transparent" />
        </div>

        <div className="relative z-10 section-container w-full pb-8 md:pb-10 pt-24 md:pt-28">
          <nav className="text-xs text-background-50/55 mb-3 flex items-center gap-2 flex-wrap" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-accent-400 transition-colors">{t("common.homePage")}</Link>
            <i className="ri-arrow-right-s-line w-3.5 h-3.5 flex items-center justify-center opacity-60" aria-hidden />
            <span className="text-background-50/90">{t("footer.institut")}</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="font-heading text-2xl md:text-4xl font-semibold text-background-50 leading-tight tracking-tight">
              {t("footer.institutHaqida")}
            </h1>
            <p className="mt-2.5 text-sm text-background-50/70 max-w-xl leading-relaxed line-clamp-3">
              {t("institut.heroDescription")}
            </p>
            <div className="mt-4 w-12 h-px bg-accent-400 animate-rise-line" aria-hidden />
            <div className="flex flex-wrap gap-2.5 mt-5">
              <Link
                to="/qabul"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffd600] hover:bg-[#e6c200] text-[#0a1158] text-sm font-bold cursor-pointer whitespace-nowrap transition-colors"
              >
                {t("institut.admission2026")} <i className="ri-arrow-right-line" />
              </Link>
              <Link
                to="/aloqa"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-background-50/30 hover:bg-background-50/10 text-background-50 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
              >
                {t("institut.contactUs")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating stats strip */}
      <div className="relative -mt-8 z-20 section-container">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 page-card overflow-hidden shadow-sm">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`p-3.5 md:p-4 text-center ${i < stats.length - 1 ? "md:border-r border-background-200/80" : ""}`}
              >
                <div className="text-xl md:text-2xl font-heading font-bold text-primary-600">{s.value}</div>
                <div className="text-[11px] md:text-xs text-foreground-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <main className="section-container space-y-8 md:space-y-10">
        {/* About */}
        <section className="section-pad pt-8 md:pt-10 pb-0">
          <Reveal>
            <div className="grid lg:grid-cols-2 gap-5 lg:gap-8 items-center">
              <div>
                <span className="section-eyebrow">{t("institut.badgeHistory")}</span>
                <h2 className="section-title text-xl md:text-2xl mt-2 mb-3">
                  {t("institut.fullName")}
                </h2>
                <p className="text-sm text-foreground-700 leading-relaxed mb-3">
                  {t("institut.aboutParagraph1")}
                </p>
                <p className="text-sm text-foreground-700 leading-relaxed mb-4">
                  {t("institut.aboutParagraph2")}
                </p>
                <div className="bg-[#0a1158]/[0.06] border-l-4 border-[#ffd600] p-3 rounded-r-xl mb-4">
                  <p className="text-[#0a1158] text-sm font-medium leading-relaxed">
                    <i className="ri-calendar-check-line inline mr-1" />
                    {t("institut.foundedNote")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    to="/qabul"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {t("institut.admission2026")} <i className="ri-arrow-right-line" />
                  </Link>
                  <Link
                    to="/aloqa"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-200 text-primary-700 hover:bg-primary-50 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {t("institut.contactUs")}
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-background-200/80 shadow-sm">
                  <img
                    src="https://fjsti.uz/uploads/img/fotogallery/2026/Fon-1.jpg"
                    alt={t("institut.heroImageAlt")}
                    className="w-full h-52 md:h-72 object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {missionPage && (
          <Reveal as="section" className="page-card p-4 md:p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-l-2xl" />
            <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
              <i className="ri-flag-line text-xl" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground-900 mb-2">{missionPage.title}</h3>
            <RichContent html={missionPage.content} />
          </Reveal>
        )}

        {/* Features */}
        <section className="section-pad pt-0">
          <Reveal>
            <div className="text-center mb-5 md:mb-6">
              <span className="section-eyebrow">{t("institut.featuresEyebrow")}</span>
              <h2 className="section-title text-xl md:text-2xl mt-2">{t("institut.featuresHeading")}</h2>
              <div className="w-12 h-px bg-accent-400 mx-auto mt-3" aria-hidden />
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="group h-full page-card p-4 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-200 transition-all duration-300 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-3 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    <i className={`${f.icon} text-lg`} />
                  </div>
                  <h4 className="font-heading text-base font-semibold text-foreground-900 mb-1">{f.title}</h4>
                  <p className="text-sm text-foreground-600 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="section-pad pt-0 pb-6 md:pb-8">
          <Reveal>
            <div className="text-center mb-5 md:mb-6">
              <span className="section-eyebrow">{t("institut.historyEyebrow")}</span>
              <h2 className="section-title text-xl md:text-2xl mt-2">{t("institut.historyHeading")}</h2>
              <div className="w-12 h-px bg-accent-400 mx-auto mt-3" aria-hidden />
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {timeline.map((item, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="page-card p-4 h-full hover:border-primary-200 hover:shadow-md transition-all">
                  <span className="inline-block text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full mb-2">
                    {item.year}
                  </span>
                  <h4 className="font-heading font-semibold text-foreground-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-foreground-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
