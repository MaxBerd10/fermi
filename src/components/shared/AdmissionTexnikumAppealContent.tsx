import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import {
  TEXNIKUM_BITIRUV_MENU_ID,
  TEXNIKUM_RELATED_LINKS,
  getTexnikumBitiruvPageMeta,
  getTexnikumBitiruvPdfTitleKey,
} from "@/lib/texnikumBitiruvSection";
import { parseTexnikumPdfLead } from "@/lib/parseTexnikumBitiruvContent";

export default function AdmissionTexnikumAppealContent({
  slug,
  html,
  pdfUrl,
}: {
  slug: string;
  html: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const meta = getTexnikumBitiruvPageMeta(slug);
  const parsedLead = useMemo(() => parseTexnikumPdfLead(html), [html]);
  const lead = parsedLead ?? (meta.leadKey ? t(meta.leadKey) : undefined);
  const pdfLabel = pdfUrl ? t(getTexnikumBitiruvPdfTitleKey(pdfUrl, slug)) : undefined;
  const related = TEXNIKUM_RELATED_LINKS.filter((item) => item.slug !== slug);

  return (
    <div className="cms-science cms-science--texnikum-appeal">
      {lead && <p className="cms-admission-texnikum__lead">{lead}</p>}
      <p className="cms-admission-texnikum__text">{t("admission.texnikum.appeal.text")}</p>

      {pdfUrl && pdfLabel && (
        <div className="cms-admission-texnikum__pdf">
          <div className="cms-admission-gallery__pdf-head">
            <h3 className="cms-admission-gallery__pdf-title">{pdfLabel}</h3>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn cms-science-btn--primary">
              <i className="ri-download-2-line" aria-hidden />
              {t("science.downloadDocument")}
            </a>
          </div>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={pdfLabel} interactive />
        </div>
      )}

      {related.length > 0 && (
        <section className="cms-admission-texnikum__related">
          <h3 className="cms-admission-related__title">{t("admission.texnikum.relatedTitle")}</h3>
          <div className="cms-fundamental-links">
            {related.map((link) => (
              <Link
                key={link.slug}
                to={`/blog/${TEXNIKUM_BITIRUV_MENU_ID}/${link.slug}`}
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
        </section>
      )}
    </div>
  );
}
