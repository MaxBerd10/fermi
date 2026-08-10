import { useTranslation } from "react-i18next";
import { TEXNIKUM_ONLINE_PORTAL } from "@/lib/texnikumBitiruvSection";

export default function AdmissionTexnikumOnlineContent() {
  const { t } = useTranslation();

  return (
    <div className="cms-science cms-science--texnikum-online">
      <p className="cms-admission-texnikum__headline">{t("admission.texnikum.online.headline")}</p>
      <p className="cms-admission-texnikum__text">{t("admission.texnikum.online.intro")}</p>

      <a
        href={TEXNIKUM_ONLINE_PORTAL}
        target="_blank"
        rel="noopener noreferrer"
        className="cms-admission-cta cms-admission-texnikum__cta"
      >
        <span className="cms-admission-cta__icon" aria-hidden>
          <i className="ri-global-line" />
        </span>
        <span className="cms-admission-cta__body">
          <span className="cms-admission-cta__title">{t("admission.texnikum.cta.onlinePortal")}</span>
          <span className="cms-admission-cta__url">my.uzbmb.uz</span>
        </span>
        <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
      </a>

      <div className="cms-admission-docs__deadline cms-admission-texnikum__deadline">
        <i className="ri-calendar-check-line" aria-hidden />
        <div>
          <span className="cms-admission-docs__deadline-label">{t("admission.texnikum.online.deadlineLabel")}</span>
          <span className="cms-admission-docs__deadline-value">{t("admission.texnikum.online.deadline")}</span>
        </div>
      </div>

      <p className="cms-admission-texnikum__note">{t("admission.texnikum.online.videoNote")}</p>
    </div>
  );
}
