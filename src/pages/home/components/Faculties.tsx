import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHomeData } from "@/api/home";
import type { FacultyListItem } from "@/types/content";
import { Reveal } from "@/components/Animation";

export default function Faculties() {
  const { t } = useTranslation();
  const [faculties, setFaculties] = useState<FacultyListItem[]>([]);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [firstDepartmentSlug, setFirstDepartmentSlug] = useState<string | null>(null);

  useEffect(() => {
    getHomeData().then((d) => {
      setFaculties(d.faculties);
      setDepartmentCount(d.departments.length);
      setFirstDepartmentSlug(d.departments[0]?.slug ?? null);
    });
  }, []);

  if (faculties.length === 0) return null;

  return (
    <section className="section-pad bg-background-100 border-y border-background-200">
      <div className="section-container">
        <Reveal>
          <div className="uni-rule-double" />
          <p className="section-eyebrow">{t("faculties.eyebrow")}</p>
          <h2 className="section-title max-w-2xl">
            {t("faculties.headingPrefix")} {t("faculties.headingHighlight")}
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faculties.map((f, i) => (
            <Reveal key={f.id} delay={i * 55}>
              <Link
                to={`/faculty/0/${f.slug}`}
                className="med-card group flex items-center justify-between gap-6 px-6 md:px-10 py-6 md:py-7 border border-background-200 bg-background-50 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center gap-6 md:gap-10 min-w-0">
                  <span className="font-heading italic text-3xl md:text-4xl tabular-nums text-primary-600 w-12 md:w-14 flex-shrink-0 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 border-l border-background-200 pl-6 md:pl-8">
                    <h3 className="font-heading italic text-xl md:text-2xl lg:text-[1.65rem] text-foreground-950 truncate group-hover:text-primary-700 transition-colors">
                      {f.title}
                    </h3>
                  </div>
                </div>
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-primary-200 text-primary-600 group-hover:border-primary-500 group-hover:bg-primary-50 transition-colors">
                  <i className="ri-arrow-right-line text-lg" />
                </span>
              </Link>
            </Reveal>
          ))}

          {firstDepartmentSlug && (
            <Reveal delay={faculties.length * 55}>
              <Link
                to={`/departments/0/${firstDepartmentSlug}`}
                className="med-card group flex items-center justify-between gap-6 px-6 md:px-10 py-6 md:py-7 border border-secondary-200 bg-secondary-50/50 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center gap-6 md:gap-10 min-w-0">
                  <span className="font-heading italic text-3xl md:text-4xl tabular-nums text-secondary-700 w-12 md:w-14 flex-shrink-0 leading-none">
                    {String(faculties.length + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 border-l border-secondary-200 pl-6 md:pl-8">
                    <h3 className="font-heading italic text-xl md:text-2xl lg:text-[1.65rem] text-foreground-950 truncate group-hover:text-secondary-700 transition-colors">
                      {t("faculties.departmentsCount", { count: departmentCount })}
                    </h3>
                  </div>
                </div>
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-secondary-300 text-secondary-700 group-hover:border-secondary-500 group-hover:bg-secondary-50 transition-colors">
                  <i className="ri-arrow-right-line text-lg" />
                </span>
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
