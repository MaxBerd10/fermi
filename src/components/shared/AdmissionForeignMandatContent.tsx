import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import {
  XORIJIY_QABUL_MENU_ID,
  XORIJIY_QABUL_RELATED_LINKS,
  getXorijiyQabulPageMeta,
  getXorijiyQabulPdfTitleKey,
} from "@/lib/xorijiyQabulSection";
import { parseForeignPdfLead } from "@/lib/parseXorijiyQabulContent";

export default function AdmissionForeignMandatContent({
  slug,
  html,
  pdfUrl,
}: {
  slug: string;
  html: string;
  pdfUrl: string;
}) {
  const { t } = useTranslation();
  const meta = getXorijiyQabulPageMeta(slug);
  const pdfLabel = t(getXorijiyQabulPdfTitleKey(pdfUrl, slug));
  const parsedLead = useMemo(() => parseForeignPdfLead(html), [html]);
  const lead = parsedLead ?? (meta.leadKey ? t(meta.leadKey) : undefined);
  const related = XORIJIY_QABUL_RELATED_LINKS.filter((item) => item.slug !== slug);

  return (
    <div className="cms-science cms-science--foreign-mandat">
      {lead && <p className="cms-admission-foreign__lead">{lead}</p>}

      <div className="cms-admission-doc-mandat__pdf">
        <div className="cms-admission-gallery__pdf-head">
          <h3 className="cms-admission-gallery__pdf-title">{pdfLabel}</h3>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn cms-science-btn--primary">
            <i className="ri-download-2-line" aria-hidden />
            {t("science.downloadDocument")}
          </a>
        </div>
        <PdfDocumentViewer pdfUrl={pdfUrl} title={pdfLabel} interactive />
      </div>

      {related.length > 0 && (
        <section className="cms-admission-internatura__related">
          <h3 className="cms-admission-related__title">{t("admission.xorijiy.relatedTitle")}</h3>
          <div className="cms-fundamental-links">
            {related.map((link) => (
              <Link key={link.slug} to={`/blog/${XORIJIY_QABUL_MENU_ID}/${link.slug}`} className="cms-fundamental-link">
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
        </section>
      )}
    </div>
  );
}
