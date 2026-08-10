import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RichContent from "@/components/shared/RichContent";
import { enhanceAdmissionHtml } from "@/lib/enhanceAdmissionHtml";
import { getXorijiyExternalCta } from "@/lib/xorijiySection";
import { extractPrimaryExternalUrl } from "@/lib/parseAdmissionContent";

export default function XorijiyPortalContent({ html, slug }: { html: string; slug: string }) {
  const { t } = useTranslation();
  const cta = getXorijiyExternalCta(slug);
  const url = useMemo(
    () => extractPrimaryExternalUrl(html, cta?.url) ?? cta?.url ?? null,
    [html, cta?.url],
  );
  const articleHtml = useMemo(() => enhanceAdmissionHtml(html), [html]);

  return (
    <div className="cms-science cms-science--xorijiy-portal">
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="cms-admission-cta cms-xorijiy__cta">
          <span className="cms-admission-cta__icon" aria-hidden>
            <i className="ri-global-line" />
          </span>
          <span className="cms-admission-cta__body">
            <span className="cms-admission-cta__title">{t(cta?.labelKey ?? "xorijiy.cta.studyPortal")}</span>
            <span className="cms-admission-cta__url">{url.replace(/^https?:\/\//, "")}</span>
          </span>
          <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
        </a>
      )}

      {articleHtml.trim() && (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--xorijiy"
        />
      )}
    </div>
  );
}
