import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BuildingGalleryContent from "@/components/shared/BuildingGalleryContent";
import {
  getBuildingsHighlightKeys,
  getBuildingsRelatedLinks,
  type BuildingsSubView,
} from "@/lib/buildingsSection";

export default function BuildingPageContent({
  slug,
  html,
  featuredImage,
  subView = null,
}: {
  slug: string;
  html: string;
  featuredImage?: string | null;
  subView?: BuildingsSubView;
}) {
  const { t } = useTranslation();
  const highlights = getBuildingsHighlightKeys(slug, subView);
  const related = getBuildingsRelatedLinks(slug, subView);

  return (
    <div className="cms-buildings-page">
      {highlights.length > 0 && (
        <section className="cms-buildings__facts" aria-label={t("buildings.factsTitle")}>
          <h3 className="cms-buildings__facts-title">
            <i className="ri-information-line" aria-hidden />
            {t("buildings.factsTitle")}
          </h3>
          <ul className="cms-buildings__facts-list">
            {highlights.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </section>
      )}

      <BuildingGalleryContent html={html} featuredImage={featuredImage} />

      {related.length > 0 && (
        <nav className="cms-buildings__related" aria-label={t("buildings.relatedTitle")}>
          <h3 className="cms-buildings__related-title">{t("buildings.relatedTitle")}</h3>
          <ul className="cms-buildings__related-list">
            {related.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="cms-buildings__related-link">
                  <i className={link.icon} aria-hidden />
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
