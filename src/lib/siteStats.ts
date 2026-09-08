// Self-hosted page-view tracking — see server/site-stats.mjs. No third-party service;
// the admin panel's own "Statistika" page reads this back via fetchStatsSummary().

export interface SiteStatsSummary {
  total: number;
  distinctPages: number;
  avgPerDay: number;
  today: number;
  yesterday: number;
  last7Days: number;
  previous7Days: number;
  last30Days: number;
  previous30Days: number;
  peakDay: { date: string; count: number };
  dailySeries: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
}

export function recordPageView(path: string) {
  const body = JSON.stringify({ path });
  // sendBeacon survives the page unloading right after a navigation (common right after
  // clicking a link) — fetch with keepalive is the fallback for browsers without it.
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/site-stats/hit", blob)) return;
  }
  fetch("/site-stats/hit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Best-effort — a dropped view-count hit isn't worth surfacing to the visitor.
  });
}

export async function fetchStatsSummary(): Promise<SiteStatsSummary> {
  const res = await fetch("/site-stats/summary");
  if (!res.ok) throw new Error("Statistikani yuklab bo'lmadi");
  return res.json();
}
