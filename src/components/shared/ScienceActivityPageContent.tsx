import { useMemo } from "react";
import ConferencePageContent from "@/components/shared/ConferencePageContent";
import CouncilDecisionsPageContent from "@/components/shared/CouncilDecisionsPageContent";
import AutoreferatPageContent from "@/components/shared/AutoreferatPageContent";
import ScienceDocumentsPageContent from "@/components/shared/ScienceDocumentsPageContent";
import ScienceJournalHubContent from "@/components/shared/ScienceJournalHubContent";
import DissertationDefensesContent from "@/components/shared/DissertationDefensesContent";
import RichContent from "@/components/shared/RichContent";
import { enhanceScienceHtml } from "@/lib/enhanceScienceHtml";
import { enhanceUnitHtml } from "@/lib/enhanceUnitHtml";
import { getScienceActivityContentVariant } from "@/lib/scienceActivitySection";

export default function ScienceActivityPageContent({
  slug,
  html,
  pdfUrl,
}: {
  slug: string;
  html: string;
  pdfUrl?: string | null;
}) {
  const variant = getScienceActivityContentVariant(slug);

  const articleHtml = useMemo(() => {
    if (variant === "article") return enhanceScienceHtml(html);
    if (variant === "research-table") return enhanceUnitHtml(html);
    return html;
  }, [html, variant]);

  switch (variant) {
    case "council-decisions":
      return <CouncilDecisionsPageContent html={html} pdfUrl={pdfUrl} />;
    case "documents":
      return <ScienceDocumentsPageContent html={html} pdfUrl={pdfUrl} />;
    case "conference":
      return <ConferencePageContent html={html} slug={slug} pdfUrl={pdfUrl} />;
    case "journal":
      return <ScienceJournalHubContent html={html} pdfUrl={pdfUrl} />;
    case "autoreferat":
      return <AutoreferatPageContent html={html} archivePdfUrl={pdfUrl} />;
    case "dissertation":
      return <DissertationDefensesContent />;
    case "research-table":
    case "article":
      return <RichContent html={articleHtml} slug={slug} className="cms-article cms-article--rich cms-article--science" />;
    default:
      return <RichContent html={html} slug={slug} className="cms-article cms-article--rich cms-article--science" />;
  }
}
