import { useMemo } from "react";
import AutoreferatPageContent from "@/components/shared/AutoreferatPageContent";
import ScienceDocumentsPageContent from "@/components/shared/ScienceDocumentsPageContent";
import FinanceDocumentsPageContent from "@/components/shared/FinanceDocumentsPageContent";
import FinancePdfPageContent from "@/components/shared/FinancePdfPageContent";
import FinanceIntroPdfContent from "@/components/shared/FinanceIntroPdfContent";
import KamTaminlanganPageContent from "@/components/shared/KamTaminlanganPageContent";
import PediatriyaFaoliyatPageContent from "@/components/shared/PediatriyaFaoliyatPageContent";
import FundamentalLoyihaPageContent from "@/components/shared/FundamentalLoyihaPageContent";
import DoktoranturaMalumotPageContent from "@/components/shared/DoktoranturaMalumotPageContent";
import MalakaviyImtihonlarPageContent from "@/components/shared/MalakaviyImtihonlarPageContent";
import DissertatsiyalarFaoliyatContent from "@/components/shared/DissertatsiyalarFaoliyatContent";
import ActivityPlaceholderContent from "@/components/shared/ActivityPlaceholderContent";
import FaoliyatHero from "@/components/shared/FaoliyatHero";
import RichContent from "@/components/shared/RichContent";
import { enhanceScienceHtml } from "@/lib/enhanceScienceHtml";
import { enhanceUnitHtml } from "@/lib/enhanceUnitHtml";
import { getFaoliyatContentVariant, getFaoliyatHeroConfig } from "@/lib/faoliyatSection";

function FaoliyatBody({
  slug,
  html,
  pdfUrl,
  title,
}: {
  slug: string;
  html: string;
  pdfUrl?: string | null;
  title?: string;
}) {
  const variant = getFaoliyatContentVariant(slug, html, pdfUrl);

  const articleHtml = useMemo(() => {
    if (variant === "article") return enhanceScienceHtml(html);
    if (variant === "research-table") return enhanceUnitHtml(html);
    return html;
  }, [html, variant]);

  if (variant === "pdf-only" && pdfUrl) {
    return <FinancePdfPageContent pdfUrl={pdfUrl} title={title} />;
  }

  switch (variant) {
    case "finance-documents":
      return <FinanceDocumentsPageContent html={html} pdfUrl={pdfUrl} />;
    case "pdf-intro":
      return <FinanceIntroPdfContent html={html} pdfUrl={pdfUrl} title={title} slug={slug} />;
    case "documents":
      return <ScienceDocumentsPageContent html={html} pdfUrl={pdfUrl} />;
    case "autoreferat":
      return <AutoreferatPageContent html={html} archivePdfUrl={pdfUrl} />;
    case "kam-taminlangan":
      return <KamTaminlanganPageContent html={html} />;
    case "pediatriya-faoliyat":
      return <PediatriyaFaoliyatPageContent html={html} />;
    case "fundamental-loyiha":
      return <FundamentalLoyihaPageContent html={html} slug={slug} />;
    case "doktorantura-info":
      return <DoktoranturaMalumotPageContent html={html} pdfUrl={pdfUrl} slug={slug} />;
    case "malakaviy-exams":
      return <MalakaviyImtihonlarPageContent html={html} />;
    case "dissertation-hub":
      return <DissertatsiyalarFaoliyatContent html={html} />;
    case "placeholder":
      return <ActivityPlaceholderContent slug={slug} />;
    case "research-table":
    case "article":
      return (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--science cms-article--faoliyat"
        />
      );
    default:
      if (pdfUrl) return <FinancePdfPageContent pdfUrl={pdfUrl} title={title} />;
      return <ActivityPlaceholderContent slug={slug} />;
  }
}

export default function FaoliyatPageContent({
  menuId,
  slug,
  html,
  pdfUrl,
  title,
}: {
  menuId: number;
  slug: string;
  html: string;
  pdfUrl?: string | null;
  title: string;
}) {
  const heroConfig = getFaoliyatHeroConfig(slug, menuId);
  const menuTheme = heroConfig?.accent.split("-")[0] ?? "default";

  return (
    <div className={`faoliyat-page faoliyat-page--${menuTheme}`}>
      {heroConfig && <FaoliyatHero title={title} config={heroConfig} />}

      <section className="faoliyat-page__body page-card px-5 py-4 md:px-7 md:py-5 lg:px-8 lg:py-6">
        <FaoliyatBody slug={slug} html={html} pdfUrl={pdfUrl} title={title} />
      </section>
    </div>
  );
}
