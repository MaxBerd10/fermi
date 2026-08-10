import { useTranslation } from "react-i18next";
import FinancePdfPageContent from "@/components/shared/FinancePdfPageContent";

export default function AdmissionSupplementaryPdf({
  pdfUrl,
  titleKey,
}: {
  pdfUrl: string;
  titleKey: string;
}) {
  const { t } = useTranslation();

  return (
    <section className="cms-admission-docs__pdf">
      <div className="cms-admission-docs__pdf-head">
        <h3 className="cms-admission-docs__section-title">{t(titleKey)}</h3>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
          <i className="ri-download-2-line" aria-hidden />
          {t("science.downloadDocument")}
        </a>
      </div>
      <FinancePdfPageContent pdfUrl={pdfUrl} title={t(titleKey)} />
    </section>
  );
}
