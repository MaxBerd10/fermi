import { useMemo } from "react";
import ScienceDocumentsPageContent from "@/components/shared/ScienceDocumentsPageContent";
import FinancePdfPageContent from "@/components/shared/FinancePdfPageContent";
import AdmissionIntroPdfContent from "@/components/shared/AdmissionIntroPdfContent";
import AdmissionQuotaGalleryContent from "@/components/shared/AdmissionQuotaGalleryContent";
import AdmissionExternalCtaContent from "@/components/shared/AdmissionExternalCtaContent";
import AdmissionContactContent from "@/components/shared/AdmissionContactContent";
import AdmissionDocsChecklistContent from "@/components/shared/AdmissionDocsChecklistContent";
import AdmissionDocsTableContent from "@/components/shared/AdmissionDocsTableContent";
import AdmissionLocationsContent from "@/components/shared/AdmissionLocationsContent";
import AdmissionOrdinaturaReminderContent from "@/components/shared/AdmissionOrdinaturaReminderContent";
import AdmissionQoshmaProgramContent from "@/components/shared/AdmissionQoshmaProgramContent";
import AdmissionQoshmaDocsContent from "@/components/shared/AdmissionQoshmaDocsContent";
import AdmissionTransferRestoreContent from "@/components/shared/AdmissionTransferRestoreContent";
import AdmissionFaqContent from "@/components/shared/AdmissionFaqContent";
import AdmissionDoctorateExamContent from "@/components/shared/AdmissionDoctorateExamContent";
import AdmissionDoctorateMandatContent from "@/components/shared/AdmissionDoctorateMandatContent";
import AdmissionInternaturaCommissionContent from "@/components/shared/AdmissionInternaturaCommissionContent";
import AdmissionInternaturaSubmitContent from "@/components/shared/AdmissionInternaturaSubmitContent";
import AdmissionInternaturaPdfContent from "@/components/shared/AdmissionInternaturaPdfContent";
import AdmissionForeignBachelorContent from "@/components/shared/AdmissionForeignBachelorContent";
import AdmissionForeignOrdinaturaContent from "@/components/shared/AdmissionForeignOrdinaturaContent";
import AdmissionForeignDocsContent from "@/components/shared/AdmissionForeignDocsContent";
import AdmissionForeignContractContent from "@/components/shared/AdmissionForeignContractContent";
import AdmissionForeignMandatContent from "@/components/shared/AdmissionForeignMandatContent";
import AdmissionTexnikumOnlineContent from "@/components/shared/AdmissionTexnikumOnlineContent";
import AdmissionTexnikumNewsContent from "@/components/shared/AdmissionTexnikumNewsContent";
import AdmissionTexnikumNizomContent from "@/components/shared/AdmissionTexnikumNizomContent";
import AdmissionTexnikumCallCenterContent from "@/components/shared/AdmissionTexnikumCallCenterContent";
import AdmissionTexnikumAppealContent from "@/components/shared/AdmissionTexnikumAppealContent";
import AdmissionPlaceholderContent from "@/components/shared/AdmissionPlaceholderContent";
import AdmissionHero from "@/components/shared/AdmissionHero";
import RichContent from "@/components/shared/RichContent";
import { enhanceAdmissionHtml } from "@/lib/enhanceAdmissionHtml";
import {
  getAdmissionContentVariant,
  getAdmissionHeroConfig,
  getAdmissionPageTheme,
} from "@/lib/admissionSection";
import { ORDINATURA_MENU_ID } from "@/lib/ordinaturaSection";
import { KOCHIRISH_MENU_ID, getKochirishPdfTitleKey } from "@/lib/kochirishSection";
import { DOKTORANTURA_MENU_ID } from "@/lib/doktoranturaSection";
import { INTERNATURA_MENU_ID, getInternaturaPdfTitleKey } from "@/lib/internaturaSection";
import { XORIJIY_QABUL_MENU_ID } from "@/lib/xorijiyQabulSection";
import { TEXNIKUM_BITIRUV_MENU_ID } from "@/lib/texnikumBitiruvSection";
import { getOrdinaturaPdfTitleKey } from "@/lib/parseOrdinaturaContent";

function AdmissionBody({
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
  title?: string;
}) {
  const variant = getAdmissionContentVariant(menuId, slug, html, pdfUrl);
  const articleHtml = useMemo(() => enhanceAdmissionHtml(html), [html]);
  const sectionPdfTitleKey =
    menuId === ORDINATURA_MENU_ID
      ? getOrdinaturaPdfTitleKey(pdfUrl)
      : menuId === KOCHIRISH_MENU_ID
        ? getKochirishPdfTitleKey(pdfUrl)
        : undefined;

  if (
    variant === "pdf-only" &&
    pdfUrl &&
    menuId !== DOKTORANTURA_MENU_ID &&
    menuId !== INTERNATURA_MENU_ID &&
    menuId !== XORIJIY_QABUL_MENU_ID &&
    menuId !== TEXNIKUM_BITIRUV_MENU_ID
  ) {
    return <FinancePdfPageContent pdfUrl={pdfUrl} title={title} />;
  }

  switch (variant) {
    case "pdf-intro":
      return (
        <AdmissionIntroPdfContent
          html={html}
          pdfUrl={pdfUrl}
          title={title}
          slug={slug}
          pdfTitleKey={sectionPdfTitleKey}
        />
      );
    case "documents":
      return <ScienceDocumentsPageContent html={html} pdfUrl={pdfUrl} />;
    case "quota-gallery":
      return (
        <AdmissionQuotaGalleryContent
          html={html}
          pdfUrl={pdfUrl}
          title={title}
          pdfTitleKey={sectionPdfTitleKey}
        />
      );
    case "external-cta":
      return <AdmissionExternalCtaContent menuId={menuId} html={html} slug={slug} pdfUrl={pdfUrl} title={title} />;
    case "contact":
      return <AdmissionContactContent html={html} slug={slug} />;
    case "docs-checklist":
      return <AdmissionDocsChecklistContent html={html} pdfUrl={pdfUrl} title={title} />;
    case "docs-table":
      return <AdmissionDocsTableContent html={html} pdfUrl={pdfUrl} />;
    case "ordinatura-reminder":
      return <AdmissionOrdinaturaReminderContent html={html} pdfUrl={pdfUrl} />;
    case "locations":
      return <AdmissionLocationsContent html={html} />;
    case "qoshma-program":
      return <AdmissionQoshmaProgramContent html={html} />;
    case "qoshma-docs":
      return <AdmissionQoshmaDocsContent html={html} />;
    case "transfer-restore":
      return <AdmissionTransferRestoreContent html={html} pdfUrl={pdfUrl} />;
    case "faq":
      return <AdmissionFaqContent html={html} />;
    case "doctorate-exam":
      return pdfUrl ? (
        <AdmissionDoctorateExamContent slug={slug} pdfUrl={pdfUrl} title={title} />
      ) : (
        <AdmissionPlaceholderContent menuId={menuId} />
      );
    case "doctorate-mandat":
      return pdfUrl ? (
        <AdmissionDoctorateMandatContent slug={slug} pdfUrl={pdfUrl} />
      ) : (
        <AdmissionPlaceholderContent menuId={menuId} />
      );
    case "internatura-commission":
      return (
        <AdmissionInternaturaCommissionContent
          pdfUrl={pdfUrl}
          pdfTitleKey={getInternaturaPdfTitleKey(pdfUrl, slug)}
        />
      );
    case "internatura-submit":
      return <AdmissionInternaturaSubmitContent html={html} />;
    case "internatura-pdf":
      return pdfUrl ? (
        <AdmissionInternaturaPdfContent slug={slug} html={html} pdfUrl={pdfUrl} />
      ) : (
        <AdmissionPlaceholderContent menuId={menuId} />
      );
    case "foreign-bachelor":
      return <AdmissionForeignBachelorContent pdfUrl={pdfUrl} slug={slug} />;
    case "foreign-ordinatura":
      return <AdmissionForeignOrdinaturaContent />;
    case "foreign-docs":
      return <AdmissionForeignDocsContent html={html} pdfUrl={pdfUrl} slug={slug} />;
    case "foreign-contract":
      return <AdmissionForeignContractContent html={html} />;
    case "foreign-mandat":
      return pdfUrl ? (
        <AdmissionForeignMandatContent slug={slug} html={html} pdfUrl={pdfUrl} />
      ) : (
        <AdmissionPlaceholderContent menuId={menuId} />
      );
    case "texnikum-online":
      return <AdmissionTexnikumOnlineContent />;
    case "texnikum-news":
      return <AdmissionTexnikumNewsContent pdfUrl={pdfUrl} slug={slug} />;
    case "texnikum-nizom":
      return <AdmissionTexnikumNizomContent html={html} pdfUrl={pdfUrl} slug={slug} />;
    case "texnikum-callcenter":
      return <AdmissionTexnikumCallCenterContent pdfUrl={pdfUrl} slug={slug} />;
    case "texnikum-appeal":
      return <AdmissionTexnikumAppealContent slug={slug} html={html} pdfUrl={pdfUrl} />;
    case "placeholder":
      return <AdmissionPlaceholderContent menuId={menuId} />;
    case "article":
    default:
      return (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--admission"
        />
      );
  }
}

export default function AdmissionPageContent({
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
  const heroConfig = getAdmissionHeroConfig(menuId, slug);
  const pageTheme = getAdmissionPageTheme(menuId);

  return (
    <div className={`admission-page admission-page--${pageTheme}`}>
      {heroConfig && <AdmissionHero title={title} config={heroConfig} />}
      <section className="admission-page__body page-card px-5 py-4 md:px-7 md:py-5 lg:px-8 lg:py-6">
        <AdmissionBody menuId={menuId} slug={slug} html={html} pdfUrl={pdfUrl} title={title} />
      </section>
    </div>
  );
}
