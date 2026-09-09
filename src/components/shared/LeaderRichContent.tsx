import { useMemo } from "react";
import { enhanceLeaderHtml } from "@/lib/enhanceLeaderHtml";
import RichContent from "@/components/shared/RichContent";

export default function LeaderRichContent({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const processed = useMemo(() => enhanceLeaderHtml(html), [html]);
  if (!processed) return null;

  return <RichContent html={processed} enhanced={false} className={`leader-cms ${className}`.trim()} />;
}
