import { useMemo } from "react";
import RichContent from "@/components/shared/RichContent";
import { enhanceAdmissionHtml } from "@/lib/enhanceAdmissionHtml";

export default function XorijiyArticleContent({ html, slug }: { html: string; slug: string }) {
  const articleHtml = useMemo(() => enhanceAdmissionHtml(html), [html]);

  return (
    <RichContent
      html={articleHtml}
      slug={slug}
      className="cms-article cms-article--rich cms-article--xorijiy"
    />
  );
}
