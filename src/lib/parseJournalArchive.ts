/** CMS arxiv matnidan maqola sarlavhalarini ajratish */
export function parseJournalArchiveTitles(html: string): string[] {
  if (!html?.trim()) return [];

  const raw = html
    .replace(/<[^>]+>/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "");

  const seen = new Set<string>();
  const titles: string[] = [];

  raw.split(/\n+/).forEach((line) => {
    const t = line.trim().replace(/\s+/g, " ");
    if (t.length < 12) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    titles.push(t);
  });

  return titles;
}
