import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Page } from "@/types/content";
import UnitHero from "@/components/shared/UnitHero";
import UnitHeadCard from "@/components/shared/UnitHeadCard";
import { enhanceUnitHtml } from "@/lib/enhanceUnitHtml";
import { getUnitPageConfig } from "@/lib/unitSection";

export default function UnitPageContent({
  page,
  slug,
  title,
}: {
  page: Page;
  slug: string;
  title: string;
}) {
  const { t } = useTranslation();
  const config = getUnitPageConfig(slug, page.menu?.id);
  const [openLeaderIds, setOpenLeaderIds] = useState<Record<number, boolean>>({});

  const leaders = config.showAllLeaders ? page.leaders : page.leaders.slice(0, 1);

  const processedHtml = useMemo(
    () => enhanceUnitHtml(page.content, config.contentVariant),
    [page.content, config.contentVariant],
  );
  const hasContent = Boolean(processedHtml.trim());
  const pdfUrl = page.file && /\.pdf(\?|$)/i.test(page.file) ? page.file : null;
  const pageAccent = config.accent;

  return (
    <div
      className={`unit-page unit-page--${config.theme}${pageAccent ? ` unit-page--${pageAccent}` : ""}`}
    >
      <UnitHero
        title={title}
        theme={config.theme}
        introKey={config.introKey}
        eyebrowKey={config.eyebrowKey}
        accent={pageAccent}
      />

      {leaders.length > 0 && (
        <section className="unit-page__head" aria-labelledby="unit-head-heading">
          <h2 id="unit-head-heading" className="unit-page__section-title">
            {t(config.headTitleKey ?? "unit.headTitle")}
          </h2>
          <div className={`unit-page__team${leaders.length > 1 ? " unit-page__team--multi" : ""}`}>
            {leaders.map((leader, index) => (
              <UnitHeadCard
                key={leader.id}
                leader={leader}
                open={openLeaderIds[leader.id] ?? false}
                onToggle={() =>
                  setOpenLeaderIds((prev) => ({ ...prev, [leader.id]: !prev[leader.id] }))
                }
                badgeKey={index === 0 ? config.headBadgeKey : "unit.registrarDeputyBadge"}
              />
            ))}
          </div>
        </section>
      )}

      {hasContent && (
        <section className="unit-page__about" aria-labelledby="unit-about-heading">
          <h2 id="unit-about-heading" className="unit-page__section-title">
            {t(config.aboutTitleKey ?? "unit.aboutTitle")}
          </h2>
          <article
            className={`unit-page__article cms-article cms-article--menu-section${config.contentVariant ? ` unit-page__article--${config.contentVariant}` : ""}`}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </section>
      )}

      {pdfUrl && (
        <div className="unit-page__doc">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="unit-page__doc-link">
            <i className="ri-file-pdf-line" aria-hidden />
            <span>
              <strong>{t(config.downloadDocKey ?? "unit.downloadDoc")}</strong>
              <small>{t("unit.downloadHint")}</small>
            </span>
            <i className="ri-download-2-line unit-page__doc-icon" aria-hidden />
          </a>
        </div>
      )}
    </div>
  );
}
