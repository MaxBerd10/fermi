import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isFaoliyatCmsPlaceholder } from "@/lib/faoliyatSection";

type HubLink = { href: string; labelKey: string; descKey: string; icon: string };

const RELATED_LINKS: HubLink[] = [
  {
    href: "/blog/591/doktorantura-malumotlari",
    labelKey: "faoliyat.doctorate.link.info",
    descKey: "faoliyat.doctorate.link.infoDesc",
    icon: "ri-information-line",
  },
  {
    href: "/blog/591/avtoreferatlar",
    labelKey: "faoliyat.doctorate.link.autoreferat",
    descKey: "faoliyat.doctorate.link.autoreferatDesc",
    icon: "ri-book-open-line",
  },
  {
    href: "/blog/591/malakaviy-imtihonlar",
    labelKey: "faoliyat.doctorate.link.exams",
    descKey: "faoliyat.doctorate.link.examsDesc",
    icon: "ri-file-edit-line",
  },
  {
    href: "/blog/591/monografiya",
    labelKey: "faoliyat.doctorate.link.monograph",
    descKey: "faoliyat.doctorate.link.monographDesc",
    icon: "ri-book-2-line",
  },
  {
    href: "/blog/48/ilmiy-kengash",
    labelKey: "faoliyat.doctorate.link.council",
    descKey: "faoliyat.doctorate.link.councilDesc",
    icon: "ri-government-line",
  },
  {
    href: "/blog/48/dissertatsiya-himoyalari",
    labelKey: "faoliyat.doctorate.link.defenses",
    descKey: "faoliyat.doctorate.link.defensesDesc",
    icon: "ri-graduation-cap-line",
  },
];

export default function DissertatsiyalarFaoliyatContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const isPlaceholder = isFaoliyatCmsPlaceholder(html);

  return (
    <div className="cms-science cms-science--dissertation-hub">
      <div className="cms-fundamental-status cms-doc-status">
        <span className="cms-fundamental-status__badge cms-doc-status__badge">
          <i className="ri-time-line" aria-hidden />
          {t("faoliyat.placeholder.badge")}
        </span>
        <p className="cms-fundamental-status__text">
          {isPlaceholder ? t("faoliyat.doctorate.dissertationStatus") : t("faoliyat.doctorate.dissertationPartial")}
        </p>
      </div>

      <section className="cms-doc-block">
        <h3 className="cms-doc-block__title">{t("faoliyat.doctorate.dissertationAboutTitle")}</h3>
        <p className="cms-doc-block__lead">{t("faoliyat.doctorate.dissertationAboutLead")}</p>
      </section>

      <section className="cms-doc-block">
        <h3 className="cms-doc-block__title">{t("faoliyat.placeholder.relatedTitle")}</h3>
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
