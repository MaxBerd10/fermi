import { useTranslation } from "react-i18next";
import type { DepartmentTheme } from "@/lib/departmentSection";

export default function DepartmentHero({
  title,
  logoUrl,
  theme,
  isFallback,
}: {
  title: string;
  logoUrl?: string | null;
  theme: DepartmentTheme;
  isFallback?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <header className={`department-hero department-hero--${theme}`}>
      <div className="department-hero__inner">
        <div className="department-hero__brand">
          {logoUrl && (
            <div className="department-hero__logo-wrap">
              <img src={logoUrl} alt={title} className="department-hero__logo" loading="eager" />
            </div>
          )}
          <div className="department-hero__titles">
            <span className="department-hero__eyebrow">{t("nav.section.kafedralar")}</span>
            <h2 className="department-hero__title">{title}</h2>
          </div>
        </div>

        <p className="department-hero__intro">{t("department.intro")}</p>

        {isFallback && (
          <p className="department-hero__fallback-note">
            <i className="ri-information-line" aria-hidden />
            {t("department.fallbackNote")}
          </p>
        )}
      </div>
    </header>
  );
}
