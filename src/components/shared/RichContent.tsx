import { useMemo } from "react";
import { enhanceCmsHtml } from "@/lib/enhanceCmsHtml";

/**
 * Renders CMS-authored HTML (About/Post/Page/Faculty/Departments/Leader
 * `content_*`/`activity_*`/`biography_*` columns) as-is — this is
 * CKEditor output with real inline styles/images from the legacy site,
 * so it's trusted admin-authored content, not user input.
 */
export default function RichContent({
  html,
  className = "",
  enhanced = true,
  slug,
}: {
  html: string;
  className?: string;
  enhanced?: boolean;
  slug?: string;
}) {
  const processed = useMemo(
    () => (enhanced ? enhanceCmsHtml(html, { slug }) : html),
    [html, enhanced, slug],
  );

  if (!processed) return null;

  return (
    <div
      className={`prose-content [&_img]:!max-w-full [&_img]:!h-auto [&_img]:!w-auto [&_iframe]:!w-full [&_iframe]:!h-auto [&_iframe]:aspect-video ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
