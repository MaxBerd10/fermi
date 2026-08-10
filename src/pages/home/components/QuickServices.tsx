import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/Animation";

const quickServices = [
  { id: 1, icon: "ri-customer-service-2-fill", href: "/virtual-reception/17", gradient: "from-primary-600 to-primary-800" },
  { id: 2, icon: "ri-map-pin-fill", href: "/aloqa", gradient: "from-primary-500 to-primary-700" },
  { id: 3, icon: "ri-database-2-fill", href: "http://hemis.fjsti.uz", gradient: "from-primary-600 to-primary-800" },
  { id: 4, icon: "ri-file-chart-fill", href: "https://www.scopus.com/standard/marketing.uri", gradient: "from-primary-500 to-primary-700" },
  { id: 5, icon: "ri-stethoscope-fill", href: "https://doctorium.com/", gradient: "from-primary-600 to-primary-800" },
];

export default function QuickServices() {
  const { t } = useTranslation();

  return (
    <section className="section-pad bg-primary-50/40 overflow-hidden relative">
      <div className="section-container relative z-10">
        <Reveal className="text-center mb-10">
          <p className="section-eyebrow justify-center mx-auto">
            <span className="eyebrow-dot" />
            <i className="ri-flashlight-fill" />
            {t("quickServices.eyebrow")}
          </p>
          <h2 className="section-title">{t("quickServices.heading")}</h2>
          <p className="mt-3 text-sm md:text-[0.95rem] text-foreground-600 leading-relaxed max-w-2xl mx-auto">
            {t("quickServices.intro")}
          </p>
          <div className="uni-rule mx-auto mt-4" />
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickServices.map((s, i) => (
            <Reveal key={s.id} delay={i * 70} variant="scale">
              <a
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="med-card group flex flex-col items-center text-center gap-2.5 p-5 md:p-6 cursor-pointer h-full"
              >
                <span className={`icon-badge !bg-gradient-to-br ${s.gradient} group-hover:scale-110 transition-transform`}>
                  <i className={`${s.icon} text-xl`} />
                </span>
                <p className="text-sm font-bold text-foreground-800 leading-snug group-hover:text-primary-700 transition-colors">
                  {t(`quickServices.item${s.id}.title`)}
                </p>
                <p className="text-xs text-foreground-500 leading-relaxed line-clamp-3">
                  {t(`quickServices.item${s.id}.desc`)}
                </p>
                <i className="ri-arrow-right-up-line text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity mt-auto" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
