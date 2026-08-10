import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSchedule } from "@/api/schedule";
import type { CourseSchedule } from "@/types/content";
import PageHeader from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Reveal } from "@/components/Animation";

export default function SchedulePage() {
  const { t } = useTranslation();
  usePageMeta(t("schedule.title"));
  const [courses, setCourses] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedule().then(setCourses).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t("schedule.title")} />

      <section className="section-pad bg-transparent">
        <div className="section-container">
          {loading ? (
            <LoadingState />
          ) : (
            <div className="space-y-6">
              {courses.map((c, ci) => (
                <Reveal key={c.id} delay={ci * 80}>
                  <div>
                    <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground-950 mb-3">
                      {c.title}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                      {c.schedules.map((s, si) => (
                        <Reveal key={s.id} delay={ci * 80 + si * 50} className="h-full">
                          <a
                            href={s.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex h-full items-center gap-3 p-3.5 page-card hover:border-primary-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-background-50 transition-colors duration-300">
                              <i className="ri-file-excel-2-line w-5 h-5 flex items-center justify-center text-lg" />
                            </div>
                            <span className="text-sm font-medium text-foreground-800 group-hover:text-primary-700 transition-colors">
                              {s.title}
                            </span>
                          </a>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
