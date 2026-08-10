import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type PlaceholderLink = { href: string; labelKey: string; icon: string };

const PLACEHOLDER_LINKS: Record<string, PlaceholderLink[]> = {
  "amaldagi-loyihalar": [
    { href: "/blog/49/xalqaro-xamkor-tashkilotlar", labelKey: "faoliyat.link.xalqaroHamkor", icon: "ri-global-line" },
    { href: "/blog/49/xalqaro-talim", labelKey: "faoliyat.link.xalqaroTalim", icon: "ri-graduation-cap-line" },
    { href: "/blog/581/fundamental-loyiha", labelKey: "faoliyat.link.fundamentalLoyiha", icon: "ri-lightbulb-line" },
  ],
  "fundamental-loyiha": [
    { href: "/blog/49/amaldagi-loyihalar", labelKey: "faoliyat.link.amaldagiLoyihalar", icon: "ri-stack-line" },
    { href: "/blog/48/innovatsion-goyalar", labelKey: "faoliyat.link.innovatsionGoyalar", icon: "ri-flask-line" },
  ],
  dissertatsiyalar: [
    { href: "/blog/591/avtoreferatlar", labelKey: "faoliyat.link.avtoreferatlar", icon: "ri-book-open-line" },
    { href: "/blog/591/doktorantura-malumotlari", labelKey: "faoliyat.link.doktorantura", icon: "ri-graduation-cap-line" },
    { href: "/blog/591/monografiya", labelKey: "faoliyat.link.monografiya", icon: "ri-book-2-line" },
  ],
};

export default function ActivityPlaceholderContent({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const links = PLACEHOLDER_LINKS[slug] ?? [];

  return (
    <div className="cms-science cms-science--placeholder">
      <div className="faoliyat-placeholder">
        <div className="faoliyat-placeholder__badge">
          <i className="ri-time-line" aria-hidden />
          {t("faoliyat.placeholder.badge")}
        </div>
        <p className="faoliyat-placeholder__text">
          {t(`faoliyat.placeholder.${slug}.text`, t("faoliyat.placeholder.default.text"))}
        </p>
      </div>

      {links.length > 0 && (
        <>
          <h3 className="faoliyat-placeholder__links-title">{t("faoliyat.placeholder.relatedTitle")}</h3>
          <div className="cms-science-dissertation__links">
            {links.map((link) => (
              <Link key={link.href} to={link.href} className="cms-science-dissertation__link">
                <i className={link.icon} aria-hidden />
                <span>{t(link.labelKey)}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
