import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RichContent from "@/components/shared/RichContent";
import { enhanceScienceHtml } from "@/lib/enhanceScienceHtml";
import { isFaoliyatCmsPlaceholder } from "@/lib/faoliyatSection";

type HubLink = { href: string; labelKey: string; descKey: string; icon: string };
type HubArea = { titleKey: string; textKey: string; icon: string };
type HubTrack = { titleKey: string; descKey: string; icon: string; href?: string; soon?: boolean };

const FOCUS_AREAS: HubArea[] = [
  {
    icon: "ri-heart-pulse-line",
    titleKey: "faoliyat.fundamental.area.publicHealth",
    textKey: "faoliyat.fundamental.area.publicHealthDesc",
  },
  {
    icon: "ri-stethoscope-line",
    titleKey: "faoliyat.fundamental.area.clinical",
    textKey: "faoliyat.fundamental.area.clinicalDesc",
  },
  {
    icon: "ri-book-open-line",
    titleKey: "faoliyat.fundamental.area.education",
    textKey: "faoliyat.fundamental.area.educationDesc",
  },
  {
    icon: "ri-flask-line",
    titleKey: "faoliyat.fundamental.area.biomedicine",
    textKey: "faoliyat.fundamental.area.biomedicineDesc",
  },
];

const RELATED_LINKS: HubLink[] = [
  {
    href: "/blog/48/fjsti-grant-siyosati",
    labelKey: "faoliyat.fundamental.link.grantPolicy",
    descKey: "faoliyat.fundamental.link.grantPolicyDesc",
    icon: "ri-file-list-3-line",
  },
  {
    href: "/blog/48/ilmiy-tadqiqot-yonalishlari",
    labelKey: "faoliyat.fundamental.link.directions",
    descKey: "faoliyat.fundamental.link.directionsDesc",
    icon: "ri-compass-3-line",
  },
  {
    href: "/blog/48/tibbiy-talimga-tadqiq-etilgan-ilmiy-tadqiqot-ishlari",
    labelKey: "faoliyat.fundamental.link.researchWorks",
    descKey: "faoliyat.fundamental.link.researchWorksDesc",
    icon: "ri-table-line",
  },
  {
    href: "/blog/48/innovatsion-goyalar",
    labelKey: "faoliyat.fundamental.link.innovation",
    descKey: "faoliyat.fundamental.link.innovationDesc",
    icon: "ri-lightbulb-flash-line",
  },
  {
    href: "/blog/49/amaldagi-loyihalar",
    labelKey: "faoliyat.fundamental.link.intlProjects",
    descKey: "faoliyat.fundamental.link.intlProjectsDesc",
    icon: "ri-global-line",
  },
  {
    href: "/blog/591/doktorantura-malumotlari",
    labelKey: "faoliyat.fundamental.link.postgraduate",
    descKey: "faoliyat.fundamental.link.postgraduateDesc",
    icon: "ri-graduation-cap-line",
  },
];

const PROJECT_TRACKS: HubTrack[] = [
  {
    titleKey: "faoliyat.fundamental.track.fundamental",
    descKey: "faoliyat.fundamental.track.fundamentalDesc",
    icon: "ri-microscope-line",
    href: "/blog/581/fundamental-loyiha",
  },
  {
    titleKey: "faoliyat.fundamental.track.applied",
    descKey: "faoliyat.fundamental.track.appliedDesc",
    icon: "ri-tools-line",
    soon: true,
  },
  {
    titleKey: "faoliyat.fundamental.track.innovation",
    descKey: "faoliyat.fundamental.track.innovationDesc",
    icon: "ri-rocket-line",
    soon: true,
  },
  {
    titleKey: "faoliyat.fundamental.track.startup",
    descKey: "faoliyat.fundamental.track.startupDesc",
    icon: "ri-seedling-line",
    soon: true,
  },
];

export default function FundamentalLoyihaPageContent({ html, slug }: { html: string; slug: string }) {
  const { t } = useTranslation();
  const isPlaceholder = isFaoliyatCmsPlaceholder(html);
  const articleHtml = useMemo(() => enhanceScienceHtml(html), [html]);

  if (!isPlaceholder) {
    return (
      <RichContent
        html={articleHtml}
        slug={slug}
        className="cms-article cms-article--rich cms-article--science cms-article--faoliyat"
      />
    );
  }

  return (
    <div className="cms-science cms-science--fundamental-hub">
      <div className="cms-fundamental-status">
        <span className="cms-fundamental-status__badge">
          <i className="ri-time-line" aria-hidden />
          {t("faoliyat.placeholder.badge")}
        </span>
        <p className="cms-fundamental-status__text">{t("faoliyat.fundamental.statusText")}</p>
      </div>

      <section className="cms-fundamental-block">
        <h3 className="cms-fundamental-block__title">{t("faoliyat.fundamental.aboutTitle")}</h3>
        <p className="cms-fundamental-block__lead">{t("faoliyat.fundamental.aboutLead")}</p>
      </section>

      <section className="cms-fundamental-block">
        <h3 className="cms-fundamental-block__title">{t("faoliyat.fundamental.areasTitle")}</h3>
        <div className="cms-fundamental-areas">
          {FOCUS_AREAS.map((area) => (
            <article key={area.titleKey} className="cms-fundamental-area">
              <span className="cms-fundamental-area__icon" aria-hidden>
                <i className={area.icon} />
              </span>
              <h4 className="cms-fundamental-area__title">{t(area.titleKey)}</h4>
              <p className="cms-fundamental-area__text">{t(area.textKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cms-fundamental-block">
        <h3 className="cms-fundamental-block__title">{t("faoliyat.fundamental.tracksTitle")}</h3>
        <div className="cms-fundamental-tracks">
          {PROJECT_TRACKS.map((track) => {
            const body = (
              <>
                <span className="cms-fundamental-track__icon" aria-hidden>
                  <i className={track.icon} />
                </span>
                <div className="cms-fundamental-track__body">
                  <div className="cms-fundamental-track__head">
                    <h4 className="cms-fundamental-track__title">{t(track.titleKey)}</h4>
                    {track.soon && (
                      <span className="cms-fundamental-track__soon">{t("faoliyat.placeholder.badge")}</span>
                    )}
                  </div>
                  <p className="cms-fundamental-track__text">{t(track.descKey)}</p>
                </div>
              </>
            );

            if (track.href && !track.soon) {
              return (
                <Link key={track.titleKey} to={track.href} className="cms-fundamental-track cms-fundamental-track--active">
                  {body}
                </Link>
              );
            }

            return (
              <div key={track.titleKey} className="cms-fundamental-track cms-fundamental-track--soon" aria-disabled="true">
                {body}
              </div>
            );
          })}
        </div>
      </section>

      <section className="cms-fundamental-block">
        <h3 className="cms-fundamental-block__title">{t("faoliyat.placeholder.relatedTitle")}</h3>
        <div className="cms-fundamental-links">
          {RELATED_LINKS.map((link) => (
            <Link key={link.href} to={link.href} className="cms-fundamental-link">
              <span className="cms-fundamental-link__icon" aria-hidden>
                <i className={link.icon} />
              </span>
              <span className="cms-fundamental-link__body">
                <span className="cms-fundamental-link__title">{t(link.labelKey)}</span>
                <span className="cms-fundamental-link__desc">{t(link.descKey)}</span>
              </span>
              <i className="ri-arrow-right-s-line cms-fundamental-link__arrow" aria-hidden />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
