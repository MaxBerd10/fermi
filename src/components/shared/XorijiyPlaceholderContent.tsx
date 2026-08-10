import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { XORIJIY_MENU_ID, XORIJIY_RELATED_LINKS } from "@/lib/xorijiySection";

export default function XorijiyPlaceholderContent() {
  const { t } = useTranslation();

  return (
    <div className="cms-science cms-science--xorijiy-placeholder">
      <div className="cms-student-status">
        <span className="cms-student-status__badge">
          <i className="ri-time-line" aria-hidden />
          {t("student.placeholder.badge")}
        </span>
        <p className="cms-student-status__text">{t("student.placeholder.text")}</p>
      </div>

      <h3 className="cms-student-related__title">{t("student.placeholder.related")}</h3>
      <div className="cms-fundamental-links">
        {XORIJIY_RELATED_LINKS.map((link) => (
          <Link
            key={link.slug}
            to={`/blog/${XORIJIY_MENU_ID}/${link.slug}`}
            className="cms-fundamental-link"
          >
            <span className="cms-fundamental-link__icon" aria-hidden>
              <i className={link.icon} />
            </span>
            <span className="cms-fundamental-link__body">
              <span className="cms-fundamental-link__title">{t(link.labelKey)}</span>
            </span>
            <i className="ri-arrow-right-s-line cms-fundamental-link__arrow" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
