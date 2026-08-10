import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  getForeignContractFallback,
  parseForeignContractTables,
} from "@/lib/parseXorijiyQabulContent";

export default function AdmissionForeignContractContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const tables = useMemo(() => {
    const parsed = parseForeignContractTables(html);
    return parsed.length > 0 ? parsed : getForeignContractFallback();
  }, [html]);

  return (
    <div className="cms-science cms-science--foreign-contract">
      {tables.map((table) => (
        <section key={table.title} className="cms-admission-foreign__contract-section">
          <h3 className="cms-admission-docs__section-title">{t(table.title)}</h3>
          {table.subtitle && <p className="cms-admission-foreign__contract-subtitle">{t(table.subtitle)}</p>}

          <div className="cms-admission-docs-table__wrap">
            <table className="cms-admission-docs-table cms-admission-foreign__contract-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>{t("admission.xorijiy.contract.direction")}</th>
                  <th>{t("admission.xorijiy.contract.cis")}</th>
                  <th>{t("admission.xorijiy.contract.foreign")}</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={`${table.title}-${row.num}`}>
                    <td>{row.num}</td>
                    <td className="cms-admission-docs-table__type">{row.direction}</td>
                    <td>{row.cisAmount}</td>
                    <td>{row.foreignAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
