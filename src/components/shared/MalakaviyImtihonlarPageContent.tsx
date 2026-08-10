import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { parseDoctorateSpecialties, toDoctorateInternalPath } from "@/lib/parseDoctorateContent";

function ExamSpecialty({
  code,
  title,
  url,
  soonLabel,
}: {
  code: string;
  title: string;
  url: string | null;
  soonLabel: string;
}) {
  const internal = url ? toDoctorateInternalPath(url) : null;
  const content = (
    <>
      <span className="cms-doc-specialty__code">{code}</span>
      <span className="cms-doc-specialty__title">{title}</span>
      {internal ? (
        <i className="ri-arrow-right-s-line" aria-hidden />
      ) : (
        <span className="cms-doc-specialty__soon">{soonLabel}</span>
      )}
    </>
  );

  if (internal) {
    return (
      <Link to={internal} className="cms-doc-specialty cms-doc-specialty--link">
        {content}
      </Link>
    );
  }

  return <div className="cms-doc-specialty">{content}</div>;
}

export default function MalakaviyImtihonlarPageContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const specialties = useMemo(() => parseDoctorateSpecialties(html), [html]);

  return (
    <div className="cms-science cms-science--doctorate-exams">
      <p className="cms-doc-intro">{t("faoliyat.doctorate.examsIntro")}</p>

      <div className="cms-doc-block">
        <div className="cms-science__head">
          <span className="cms-science__badge cms-doc-badge">
            <i className="ri-file-edit-line" aria-hidden />
            {t("faoliyat.doctorate.examsBadge")}
          </span>
          <span className="cms-science__count">{t("faoliyat.doctorate.examsCount", { count: specialties.length })}</span>
        </div>

        <div className="cms-doc-specialties cms-doc-specialties--exams">
          {specialties.map((item) => (
            <ExamSpecialty
              key={item.code}
              code={item.code}
              title={item.title}
              url={item.url}
              soonLabel={t("faoliyat.doctorate.examSoon")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
