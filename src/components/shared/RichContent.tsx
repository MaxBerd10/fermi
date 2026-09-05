import { useMemo } from "react";
import DOMPurify from "dompurify";
import { enhanceCmsHtml } from "@/lib/enhanceCmsHtml";

// This renders CKEditor output from CMS admins, but ALSO `article.content` for
// Telegram-scraped posts (see DetailPage) — HTML pulled from a public channel's
// page, not admin-authored. Sanitize unconditionally so a compromised/malicious
// channel post can't run script via onerror=/onload=/javascript: hrefs etc.
// iframe is allowed (CMS content embeds YouTube/Google Maps/Docs viewers) but its
// src is restricted to those known-safe hosts via the hook below.
const IFRAME_HOST_ALLOWLIST = [
  "www.youtube.com",
  "youtube.com",
  "www.google.com",
  "docs.google.com",
];

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName !== "iframe") return;
  const el = node as unknown as HTMLIFrameElement;
  const src = el.getAttribute?.("src") || "";
  let allowed = false;
  try {
    allowed = IFRAME_HOST_ALLOWLIST.includes(new URL(src, window.location.origin).hostname);
  } catch {
    allowed = false;
  }
  if (!allowed) el.remove();
});

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
  });
}

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
  const processed = useMemo(() => {
    const withLayout = enhanced ? enhanceCmsHtml(html, { slug }) : html;
    return sanitizeHtml(withLayout);
  }, [html, enhanced, slug]);

  if (!processed) return null;

  return (
    <div
      className={`prose-content [&_img]:!max-w-full [&_img]:!h-auto [&_img]:!w-auto [&_iframe]:!w-full [&_iframe]:!h-auto [&_iframe]:aspect-video ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
