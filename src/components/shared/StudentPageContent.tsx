import { useMemo } from "react";
import FinancePdfPageContent from "@/components/shared/FinancePdfPageContent";
import StudentHero from "@/components/shared/StudentHero";
import StudentArticleContent from "@/components/shared/StudentArticleContent";
import StudentPdfLinksContent from "@/components/shared/StudentPdfLinksContent";
import StudentTestCollectionsContent from "@/components/shared/StudentTestCollectionsContent";
import StudentDormContent from "@/components/shared/StudentDormContent";
import StudentInfoContent from "@/components/shared/StudentInfoContent";
import AdmissionForeignContractContent from "@/components/shared/AdmissionForeignContractContent";
import StudentPlaceholderContent from "@/components/shared/StudentPlaceholderContent";
import RichContent from "@/components/shared/RichContent";
import { enhanceStudentHtml } from "@/lib/enhanceStudentHtml";
import {
  getStudentContentVariant,
  getStudentHeroConfig,
  getStudentPageTheme,
  isStudentSectionPage,
} from "@/lib/studentSection";

function StudentBody({
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
  const variant = getStudentContentVariant(menuId, slug, html, pdfUrl);
  const articleHtml = useMemo(() => enhanceStudentHtml(html), [html]);

  if (variant === "pdf-only" && pdfUrl && isStudentSectionPage(menuId)) {
    return <FinancePdfPageContent pdfUrl={pdfUrl} title={title} />;
  }

  switch (variant) {
    case "student-article":
      return <StudentArticleContent menuId={menuId} html={html} pdfUrl={pdfUrl} slug={slug} />;
    case "student-pdf-links":
      return <StudentPdfLinksContent menuId={menuId} html={html} slug={slug} />;
    case "student-test-collections":
      return <StudentTestCollectionsContent menuId={menuId} html={html} slug={slug} />;
    case "student-dorm":
      return <StudentDormContent html={html} pdfUrl={pdfUrl} slug={slug} />;
    case "student-info":
      return <StudentInfoContent menuId={menuId} slug={slug} />;
    case "student-foreign-contract":
      return <AdmissionForeignContractContent html={html} />;
    case "placeholder":
      return <StudentPlaceholderContent menuId={menuId} />;
    case "article":
    default:
      return (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--student"
        />
      );
  }
}

export default function StudentPageContent({
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
  const heroConfig = getStudentHeroConfig(menuId, slug);
  const pageTheme = getStudentPageTheme(menuId);

  return (
    <div className={`student-page student-page--${pageTheme}`}>
      {heroConfig && <StudentHero title={title} config={heroConfig} />}
      <section className="student-page__body page-card px-5 py-4 md:px-7 md:py-5 lg:px-8 lg:py-6">
        <StudentBody menuId={menuId} slug={slug} html={html} pdfUrl={pdfUrl} title={title} />
      </section>
    </div>
  );
}
