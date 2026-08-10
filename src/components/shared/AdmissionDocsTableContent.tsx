import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseAdmissionDocsTable } from "@/lib/parseOrdinaturaContent";
import { getOrdinaturaPdfTitleKey } from "@/lib/parseOrdinaturaContent";
import AdmissionSupplementaryPdf from "@/components/shared/AdmissionSupplementaryPdf";

export default function AdmissionDocsTableContent({
  html,
  pdfUrl,
}: {
  html: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const content = useMemo(() => parseAdmissionDocsTable(html, pdfUrl), [html, pdfUrl]);

  return (
    <div className="cms-science cms-science--admission-docs-table">
      {(content.title || content.subtitle) && (
        <header className="cms-admission-docs-table__head">
          {content.subtitle && <p className="cms-admission-docs-table__subtitle">{content.subtitle}</p>}
          {content.title && <h3 className="cms-admission-docs-table__title">{content.title}</h3>}
        </header>
      )}

      {content.rows.length > 0 && (
        <div className="cms-admission-docs-table__wrap">
          <table className="cms-admission-docs-table">
            <thead>
              <tr>
                <th>{t("admission.ordinatura.table.docType")}</th>
                <th>{t("admission.ordinatura.table.note")}</th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row) => (
                <tr key={row.type}>
                  <td className="cms-admission-docs-table__type">{row.type}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {content.footnotes.map((note) => (
        <p key={note} className="cms-admission-docs-table__footnote">
          {note}
        </p>
      ))}

      {content.phones.length > 0 && (
        <div className="cms-admission-docs-table__phones">
          <h4 className="cms-admission-docs-table__phones-label">{t("admission.contact.phones")}</h4>
          <div className="cms-admission-contact__phones">
            {content.phones.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="cms-admission-contact__phone">
                {phone}
              </a>
            ))}
          </div>
        </div>
      )}

      {pdfUrl && (
        <AdmissionSupplementaryPdf pdfUrl={pdfUrl} titleKey={getOrdinaturaPdfTitleKey(pdfUrl, content.pdfTitleKey)} />
      )}
    </div>
  );
}
