import { useMemo } from "react";
import { enhanceLeaderHtml } from "@/lib/enhanceLeaderHtml";

export default function LeaderRichContent({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const processed = useMemo(() => enhanceLeaderHtml(html), [html]);
  if (!processed) return null;

  return (
    <div
      className={`leader-cms ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
