import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { isFinanceSpreadsheet } from "@/lib/parseFinanceDocumentsContent";

export default function FinancePdfPageContent({
  pdfUrl,
  title,
}: {
  pdfUrl: string;
  title?: string;
}) {
  const { t } = useTranslation();
  const isExcel = isFinanceSpreadsheet(pdfUrl);
  const isPdf = /\.pdf(\?|$)/i.test(pdfUrl);

  if (isExcel || !isPdf) {
    return (
      <div className="cms-science cms-science--finance-pdf">
        <div className="cms-finance-file">
          <div className="cms-finance-file__icon" aria-hidden>
            <i className={isExcel ? "ri-file-excel-2-line" : "ri-file-download-line"} />
          </div>
          <div className="cms-finance-file__body">
            <h3 className="cms-finance-file__title">{title ?? t("faoliyat.finance.openDocument")}</h3>
            <p className="cms-finance-file__text">{t("faoliyat.finance.downloadHint")}</p>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn cms-science-btn--primary">
              <i className="ri-download-2-line" aria-hidden />
              {t("science.downloadDocument")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cms-science cms-science--finance-pdf">
      <div className="cms-finance-pdf__toolbar">
        <span className="cms-finance-pdf__label">
          <i className="ri-file-pdf-line" aria-hidden />
          {t("faoliyat.finance.pdfDocument")}
        </span>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
          <i className="ri-download-2-line" aria-hidden />
          {t("science.downloadDocument")}
        </a>
      </div>
      <PdfDocumentViewer pdfUrl={pdfUrl} title={title ?? t("faoliyat.finance.pdfDocument")} interactive />
    </div>
  );
}
