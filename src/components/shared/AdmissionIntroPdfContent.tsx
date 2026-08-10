import { useMemo } from "react";
import RichContent from "@/components/shared/RichContent";
import FinancePdfPageContent from "@/components/shared/FinancePdfPageContent";
import AdmissionSupplementaryPdf from "@/components/shared/AdmissionSupplementaryPdf";
import { enhanceAdmissionHtml } from "@/lib/enhanceAdmissionHtml";

export default function AdmissionIntroPdfContent({
  html,
  pdfUrl,
  title,
  slug,
  pdfTitleKey,
}: {
  html: string;
  pdfUrl?: string | null;
  title?: string;
  slug: string;
  pdfTitleKey?: string;
}) {
  const articleHtml = useMemo(() => enhanceAdmissionHtml(html), [html]);

  return (
    <div className="cms-science cms-science--admission-intro">
      {articleHtml.trim() && (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--admission cms-admission-intro__text"
        />
      )}
      {pdfUrl &&
        (pdfTitleKey ? (
          <AdmissionSupplementaryPdf pdfUrl={pdfUrl} titleKey={pdfTitleKey} />
        ) : (
          <FinancePdfPageContent pdfUrl={pdfUrl} title={title} />
        ))}
    </div>
  );
}
