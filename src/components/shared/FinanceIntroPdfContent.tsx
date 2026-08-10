import { useMemo } from "react";
import RichContent from "@/components/shared/RichContent";
import { enhanceScienceHtml } from "@/lib/enhanceScienceHtml";
import FinancePdfPageContent from "@/components/shared/FinancePdfPageContent";

export default function FinanceIntroPdfContent({
  html,
  pdfUrl,
  title,
  slug,
}: {
  html: string;
  pdfUrl?: string | null;
  title?: string;
  slug: string;
}) {
  const articleHtml = useMemo(() => enhanceScienceHtml(html), [html]);

  return (
    <div className="cms-science cms-science--finance-intro">
      {articleHtml.trim() && (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--science cms-article--faoliyat cms-finance-intro__text"
        />
      )}
      {pdfUrl && <FinancePdfPageContent pdfUrl={pdfUrl} title={title} />}
    </div>
  );
}
