export interface DoktoranturaSpecialtyMeta {
  code: string;
  name: string;
}

export function parseDoktoranturaSpecialtyTitle(title: string): DoktoranturaSpecialtyMeta {
  const trimmed = title.trim();
  const match = trimmed.match(/^(\d{2}\.\d{2}(?:\.\d{2,3})?)\s*[-–—.]+\s*(.+)$/i);
  if (match) {
    return { code: match[1], name: match[2].trim() };
  }
  const compact = trimmed.match(/^(\d{2}\.\d{2}(?:\.\d{2,3})?)(.+)$/i);
  if (compact) {
    return { code: compact[1], name: compact[2].replace(/^[-–—.\s]+/, "").trim() };
  }
  return { code: "", name: trimmed };
}
