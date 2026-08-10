import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RichContent from "@/components/shared/RichContent";
import FinancePdfPageContent from "@/components/shared/FinancePdfPageContent";
import { enhanceAdmissionHtml } from "@/lib/enhanceAdmissionHtml";
import { getAdmissionExternalCta } from "@/lib/admissionSection";
import { extractPrimaryExternalUrl } from "@/lib/parseAdmissionContent";

export default function AdmissionExternalCtaContent({
  menuId,
  html,
  slug,
  pdfUrl,
  title,
}: {
  menuId: number;
  html: string;
  slug: string;
  pdfUrl?: string | null;
  title?: string;
}) {
  const { t } = useTranslation();
  const cta = getAdmissionExternalCta(menuId, slug);
  const url = useMemo(
    () => extractPrimaryExternalUrl(html, cta?.url) ?? cta?.url ?? null,
    [html, cta?.url],
  );
  const articleHtml = useMemo(() => enhanceAdmissionHtml(html), [html]);

  return (
    <div className="cms-science cms-science--admission-cta">
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="cms-admission-cta">
          <span className="cms-admission-cta__icon" aria-hidden>
            <i className="ri-external-link-line" />
          </span>
          <span className="cms-admission-cta__body">
            <span className="cms-admission-cta__title">{t(cta?.labelKey ?? "admission.cta.openPortal")}</span>
            <span className="cms-admission-cta__url">{url.replace(/^https?:\/\//, "")}</span>
          </span>
          <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
        </a>
      )}

      {articleHtml.trim() && (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--admission"
        />
      )}

      {pdfUrl && (
        <div className="cms-admission-cta__pdf">
          <FinancePdfPageContent pdfUrl={pdfUrl} title={title} />
        </div>
      )}
    </div>
  );
}
