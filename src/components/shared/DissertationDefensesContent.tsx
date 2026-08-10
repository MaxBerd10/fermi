import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function DissertationDefensesContent() {
  const { t } = useTranslation();

  return (
    <div className="cms-science cms-science--dissertation">
      <div className="cms-science__empty cms-science__empty--soft">
        <i className="ri-graduation-cap-line cms-science__empty-icon" aria-hidden />
        <h3 className="cms-science__empty-title">{t("science.dissertationEmptyTitle")}</h3>
        <p className="cms-science__empty-text">{t("science.dissertationEmptyText")}</p>
      </div>

      <div className="cms-science-dissertation__links">
        <Link to="/blog/48/avtoreferatlar" className="cms-science-dissertation__link">
          <i className="ri-book-open-line" aria-hidden />
          <span>{t("science.dissertationLinkAutoreferat")}</span>
        </Link>
        <Link to="/blog/48/ilmiy-kengash" className="cms-science-dissertation__link">
          <i className="ri-file-list-3-line" aria-hidden />
          <span>{t("science.dissertationLinkCouncil")}</span>
        </Link>
        <Link to="/blog/48/oliy-oquv-yurtidan-keyingi-talim" className="cms-science-dissertation__link">
          <i className="ri-school-line" aria-hidden />
          <span>{t("science.dissertationLinkPostgraduate")}</span>
        </Link>
      </div>
    </div>
  );
}
