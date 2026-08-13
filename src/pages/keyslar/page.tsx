import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function KeyslarPage() {
  const { t } = useTranslation();
  usePageMeta(t("nav.keyslar"));

  return (
    <div className="text-foreground-950">
      <PageHeader title={t("nav.keyslar")} compact />

      <div className="section-container section-pad">
        <div className="page-card p-5 md:p-6">
          <div className="faoliyat-placeholder">
            <div className="faoliyat-placeholder__badge">
              <i className="ri-time-line" aria-hidden />
              {t("faoliyat.placeholder.badge")}
            </div>
            <p className="faoliyat-placeholder__text">{t("faoliyat.placeholder.default.text")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
