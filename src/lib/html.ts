/**
 * CMS content (About/Post/Page/Faculty/etc. `content_*` columns) is
 * CKEditor-authored HTML with entities (&lsquo;, &rsquo;, &nbsp;, ...).
 * Stripping tags alone leaves those entities as literal text — this also
 * decodes them, using the browser's own parser so every entity (not just a
 * hardcoded subset) resolves correctly.
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  const textarea = document.createElement("textarea");
  textarea.innerHTML = withoutTags;
  return textarea.value.replace(/\s+/g, " ").trim();
}
