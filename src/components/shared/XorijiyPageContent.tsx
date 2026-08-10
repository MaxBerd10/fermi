import { useMemo } from "react";
import XorijiyHero from "@/components/shared/XorijiyHero";
import XorijiyPortalContent from "@/components/shared/XorijiyPortalContent";
import XorijiyArticleContent from "@/components/shared/XorijiyArticleContent";
import XorijiyPlaceholderContent from "@/components/shared/XorijiyPlaceholderContent";
import RichContent from "@/components/shared/RichContent";
import { enhanceAdmissionHtml } from "@/lib/enhanceAdmissionHtml";
import {
  getXorijiyContentVariant,
  getXorijiyHeroConfig,
  getXorijiyPageTheme,
} from "@/lib/xorijiySection";

function XorijiyBody({ slug, html }: { slug: string; html: string; pdfUrl?: string | null }) {
  const variant = getXorijiyContentVariant(slug, html);
  const articleHtml = useMemo(() => enhanceAdmissionHtml(html), [html]);

  switch (variant) {
    case "xorijiy-portal":
      return <XorijiyPortalContent html={html} slug={slug} />;
    case "xorijiy-article":
      return <XorijiyArticleContent html={html} slug={slug} />;
    case "placeholder":
      return <XorijiyPlaceholderContent />;
    case "article":
    default:
      return (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--xorijiy"
        />
      );
  }
}

export default function XorijiyPageContent({
  slug,
  html,
  pdfUrl,
  title,
}: {
  slug: string;
  html: string;
  pdfUrl?: string | null;
  title: string;
}) {
  const heroConfig = getXorijiyHeroConfig(slug);
  const pageTheme = getXorijiyPageTheme();

  return (
    <div className={`xorijiy-page xorijiy-page--${pageTheme}`}>
      {heroConfig && <XorijiyHero title={title} config={heroConfig} />}
      <section className="xorijiy-page__body page-card px-5 py-4 md:px-7 md:py-5 lg:px-8 lg:py-6">
        <XorijiyBody slug={slug} html={html} pdfUrl={pdfUrl} />
      </section>
    </div>
  );
}
