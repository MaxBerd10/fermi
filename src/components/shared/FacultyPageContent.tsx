import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FacultyDetail } from "@/types/content";
import FacultyHero from "@/components/shared/FacultyHero";
import FacultyLeaderCard from "@/components/shared/FacultyLeaderCard";
import { enhanceFacultyHtml } from "@/lib/enhanceFacultyHtml";
import { getFacultyPageConfig } from "@/lib/facultySection";

export default function FacultyPageContent({ faculty, slug }: { faculty: FacultyDetail; slug: string }) {
  const { t } = useTranslation();
  const config = getFacultyPageConfig(slug);
  const [openLeaderId, setOpenLeaderId] = useState<number | null>(null);

  const processedHtml = useMemo(() => enhanceFacultyHtml(faculty.content), [faculty.content]);

  return (
    <div className={`faculty-page faculty-page--${config.theme}`}>
      <FacultyHero title={faculty.title} logoUrl={faculty.img} config={config} />

      {faculty.leaders.length > 0 && (
        <section className="faculty-page__leaders" aria-labelledby="faculty-leaders-heading">
          <h2 id="faculty-leaders-heading" className="faculty-page__section-title">
            {t("faculty.leadersTitle")}
          </h2>
          <div className="faculty-page__leader-grid">
            {faculty.leaders.map((leader, index) => (
              <FacultyLeaderCard
                key={leader.id}
                leader={leader}
                facultyTitle={faculty.title}
                index={index}
                open={openLeaderId === leader.id}
                onToggle={() => setOpenLeaderId(openLeaderId === leader.id ? null : leader.id)}
              />
            ))}
          </div>
        </section>
      )}

      {processedHtml.trim() && (
        <section className="faculty-page__about" aria-labelledby="faculty-about-heading">
          <h2 id="faculty-about-heading" className="faculty-page__section-title">
            {t("faculty.aboutTitle")}
          </h2>
          <article
            className="faculty-page__article cms-article cms-article--rich cms-article--menu-section cms-article--fakultet"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </section>
      )}
    </div>
  );
}
