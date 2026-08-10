/** CMS va menyu matnlaridagi imlo va belgilarni to'g'rilash */
export function normalizeCmsOrthography(text: string): string {
  if (!text) return text;

  return (
    text
      .replace(/[`‘’]/g, "'")
      .replace(/O['ʻʼ´`]zbekiston/gi, "O'zbekiston")
      .replace(/O['ʻʼ´`]RQ/gi, "O'RQ")
      .replace(/O['ʻʼ´`]z/g, "O'z")
      .replace(/\btogrisia\b/gi, "to'g'risida")
      .replace(/\btalim togri/gi, "ta'lim to'g'ri")
      .replace(/\bOzbeksiton\b/gi, "O'zbekiston")
      .replace(/\bozbeksiton\b/gi, "O'zbekiston")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** HTML entity + teglardan tozalangan matn */
export function decodeAndCleanCmsText(html: string): string {
  if (!html) return "";
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = withoutTags;
    return normalizeCmsOrthography(textarea.value.replace(/\s+/g, " ").trim());
  }
  return normalizeCmsOrthography(
    withoutTags
      .replace(/&laquo;|&#171;/g, "«")
      .replace(/&raquo;|&#187;/g, "»")
      .replace(/&lsquo;|&#8216;/g, "'")
      .replace(/&rsquo;|&#8217;/g, "'")
      .replace(/&ldquo;|&#8220;/g, '"')
      .replace(/&rdquo;|&#8221;/g, '"')
      .replace(/&mdash;|&#8212;/g, "—")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim(),
  );
}
