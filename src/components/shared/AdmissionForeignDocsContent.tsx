import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AdmissionSupplementaryPdf from "@/components/shared/AdmissionSupplementaryPdf";
import { getForeignDocsFallback, parseForeignDocs } from "@/lib/parseXorijiyQabulContent";
import { getXorijiyQabulPdfTitleKey } from "@/lib/xorijiyQabulSection";

function resolveItems(items: string[], fallbackKeys: string[], t: (key: string) => string): string[] {
  if (items.length > 0) return items;
  return fallbackKeys.map((key) => t(key));
}

export default function AdmissionForeignDocsContent({
  html,
  pdfUrl,
  slug,
}: {
  html: string;
  pdfUrl?: string | null;
  slug: string;
}) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseForeignDocs(html), [html]);
  const fallback = getForeignDocsFallback();
  const intro = parsed.intro ?? t(fallback.intro);
  const notice = t(fallback.notice);
  const electronic = resolveItems(parsed.electronic, fallback.electronic, t);
  const interview = resolveItems(parsed.interview, fallback.interview, t);

  return (
    <div className="cms-science cms-science--foreign-docs">
      <p className="cms-admission-foreign__text">{intro}</p>
      {notice && <p className="cms-admission-foreign__notice">{notice}</p>}

      <section className="cms-admission-docs__section">
        <h3 className="cms-admission-docs__section-title">{t("admission.xorijiy.docs.electronicTitle")}</h3>
        <ol className="cms-admission-docs__checklist">
          {electronic.map((item, index) => (
            <li key={item} className="cms-admission-docs__checklist-item">
              <span className="cms-admission-docs__checklist-num" aria-hidden>
                {index + 1}
              </span>
              <span className="cms-admission-docs__checklist-text">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="cms-admission-docs__section">
        <h3 className="cms-admission-docs__section-title">{t("admission.xorijiy.docs.interviewTitle")}</h3>
        <ol className="cms-admission-docs__checklist">
          {interview.map((item, index) => (
            <li key={item} className="cms-admission-docs__checklist-item">
              <span className="cms-admission-docs__checklist-num" aria-hidden>
                {index + 1}
              </span>
              <span className="cms-admission-docs__checklist-text">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      {pdfUrl && (
        <AdmissionSupplementaryPdf pdfUrl={pdfUrl} titleKey={getXorijiyQabulPdfTitleKey(pdfUrl, slug)} />
      )}
    </div>
  );
}
