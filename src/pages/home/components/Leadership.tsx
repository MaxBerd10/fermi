import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLeaders } from "@/api/leaders";
import type { Leader } from "@/types/content";
import { Reveal } from "@/components/Animation";

interface LeadershipCard extends Leader {
  href: string;
}

function isExcludedProrector(l: Leader): boolean {
  const n = l.name.toLowerCase();
  return /kadirova|munira/.test(n);
}

export default function Leadership() {
  const { t } = useTranslation();
  const [rector, setRector] = useState<LeadershipCard | null>(null);
  const [team, setTeam] = useState<LeadershipCard[]>([]);

  useEffect(() => {
    Promise.all([getLeaders("rektor", 35), getLeaders("prorektorlar", 35)])
      .then(([rectorRes, prorectorRes]) => {
        const r = rectorRes.leaders[0];
        const pros = prorectorRes.leaders
          .filter((l) => l.name !== "VAKANT" && !isExcludedProrector(l))
          .slice(0, 4);
        setRector(r ? { ...r, href: "/leader/35/rektor" } : null);
        setTeam(pros.map((p) => ({ ...p, href: "/leader/35/prorektorlar" })));
      })
      .catch(() => {
        setRector(null);
        setTeam([]);
      });
  }, []);

  if (!rector) return null;

  const highlights = [
    t("leadership.highlight1"),
    t("leadership.highlight2"),
    t("leadership.highlight3"),
  ];

  return (
    <section className="relative py-4 md:py-5 bg-[#0a1158] text-white overflow-hidden">
      <div className="section-container relative z-10">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div className="max-w-2xl">
            <p className="section-eyebrow section-eyebrow--on-dark !mb-1">{t("footer.rahbariyat")}</p>
            <h2 className="section-title !text-white text-[clamp(1.35rem,2.5vw,1.85rem)] !mb-0">
              {t("leadership.heading")}
            </h2>
            <p className="mt-2 text-sm text-white/75 leading-relaxed line-clamp-2">
              {t("leadership.intro")}
            </p>
          </div>
          <Link to={rector.href} className="uni-btn-ghost cursor-pointer self-start sm:self-auto !text-sm !py-2 !px-4">
            {t("leadership.viewTeam")}
            <i className="ri-arrow-right-line" />
          </Link>
        </Reveal>

        {/* Featured rector — compact */}
        <div className="border border-white/10">
          <div className="grid lg:grid-cols-12 gap-0">
            <div className="leadership-portrait lg:col-span-5 relative min-h-[220px] sm:min-h-[260px] lg:min-h-[320px] bg-[#070d3d]">
              {rector.photo && (
                <img
                  src={rector.photo}
                  alt={rector.name}
                  width={800}
                  height={1000}
                  decoding="async"
                  fetchPriority="high"
                  className="absolute inset-0 w-full h-full object-cover object-[center_12%]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/85 via-transparent to-transparent lg:hidden" />
              <div className="absolute bottom-3 left-3 right-3 lg:hidden">
                <p className="font-heading text-white font-semibold text-lg leading-tight">{rector.name}</p>
                <p className="text-[#ffd600] text-xs mt-0.5">{rector.position || t("leadership.rectorLabel")}</p>
              </div>
            </div>

            <Reveal
              variant="fade"
              className="lg:col-span-7 p-5 md:p-6 lg:p-7 flex flex-col justify-start border-t lg:border-t-0 lg:border-l border-white/10"
            >
              <div className="hidden lg:block">
                <p className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#ffd600] text-[#0a1158] text-[0.65rem] font-bold uppercase tracking-wider mb-2">
                  {t("leadership.rectorLabel")}
                </p>
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-white leading-tight">
                  {rector.name}
                </h3>
                <p className="mt-1 text-white/65 text-sm">
                  {rector.position || t("leadership.rectorLabel")}
                </p>
              </div>

              <blockquote className="mt-3 font-heading text-sm md:text-base text-white/90 leading-relaxed border-l-2 border-[#ffd600] pl-4">
                {t("leadership.quote")}
              </blockquote>

              <ul className="mt-3 space-y-1.5">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 items-baseline text-xs md:text-sm text-white/75 leading-snug">
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#ffd600] flex-shrink-0 rounded-full" />
                    {h}
                  </li>
                ))}
              </ul>

              <Link to={rector.href} className="uni-link mt-4 !text-[#ffd600] hover:!text-white cursor-pointer self-start !text-sm">
                {t("about.readMore")}
                <i className="ri-arrow-right-line" />
              </Link>
            </Reveal>
          </div>
        </div>

        {/* Team — 4 in one row */}
        {team.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {team.map((p, i) => (
              <Reveal key={p.id} delay={60 + i * 40} className="bg-[#0a1158]">
                <Link
                  to={p.href}
                  className="group flex items-center gap-3 px-3 py-3 md:px-3.5 h-full hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <div className="w-11 h-11 overflow-hidden flex-shrink-0 bg-white/5 border border-white/15">
                    {p.photo && (
                      <img
                        src={p.photo}
                        alt={p.name}
                        width={88}
                        height={88}
                        decoding="async"
                        className="w-full h-full object-cover object-top"
                        style={{ imageRendering: "-webkit-optimize-contrast" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-semibold text-white text-xs md:text-sm leading-snug group-hover:text-[#ffd600] transition-colors line-clamp-2">
                      {p.name}
                    </h4>
                    <p className="mt-0.5 text-[10px] md:text-[11px] text-white/50 line-clamp-2 leading-snug">{p.position}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
