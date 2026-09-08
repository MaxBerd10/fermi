import { useEffect, useState } from "react";
import { fetchStatsSummary, type SiteStatsSummary } from "@/lib/siteStats";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "2-digit" });

function formatDayLabel(isoDate: string) {
  // "YYYY-MM-DD" parsed as local, not UTC, so the label matches the server's own
  // per-day bucketing (both use the local calendar day).
  const [y, m, d] = isoDate.split("-").map(Number);
  return WEEKDAY_FORMATTER.format(new Date(y, m - 1, d));
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background-50 border border-background-200 rounded-lg p-5">
      <div className="text-sm text-foreground-500">{label}</div>
      <div className="font-heading text-3xl font-bold text-foreground-950 mt-1">{value.toLocaleString("uz-UZ")}</div>
    </div>
  );
}

export default function AdminStatistics() {
  const [data, setData] = useState<SiteStatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatsSummary()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Xatolik yuz berdi"));
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground-950 mb-1">Statistika</h1>
      <p className="text-sm text-foreground-500 mb-8">Sayt tashrif statistikasi — o'z serverimizda hisoblanadi, tashqi xizmatga bog'liq emas.</p>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
      {!data && !error && <div className="text-sm text-foreground-500">Yuklanmoqda...</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatTile label="Bugun" value={data.today} />
            <StatTile label="So'nggi 7 kun" value={data.last7Days} />
            <StatTile label="So'nggi 30 kun" value={data.last30Days} />
            <StatTile label="Jami (barcha vaqt)" value={data.total} />
          </div>

          <div className="bg-background-50 border border-background-200 rounded-lg p-5 mb-8">
            <div className="font-semibold text-foreground-900 mb-4">So'nggi 14 kun</div>
            {(() => {
              const max = Math.max(1, ...data.dailySeries.map((d) => d.count));
              return (
                <div className="flex items-end gap-2 h-40">
                  {data.dailySeries.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="text-[11px] text-foreground-500">{d.count > 0 ? d.count : ""}</div>
                      <div
                        className="w-full bg-primary-500 rounded-t-sm min-h-[2px]"
                        style={{ height: `${(d.count / max) * 100}%` }}
                        title={`${d.date}: ${d.count}`}
                      />
                      <div className="text-[10px] text-foreground-400 whitespace-nowrap">{formatDayLabel(d.date)}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="bg-background-50 border border-background-200 rounded-lg p-5">
            <div className="font-semibold text-foreground-900 mb-4">Eng ko'p ko'rilgan sahifalar</div>
            {data.topPages.length === 0 ? (
              <div className="text-sm text-foreground-500">Hali ma'lumot yo'q.</div>
            ) : (
              <div className="space-y-2">
                {data.topPages.map((p) => (
                  <div key={p.path} className="flex items-center justify-between gap-4 text-sm py-1.5 border-b border-background-100 last:border-0">
                    <span className="text-foreground-700 truncate font-mono text-xs">{p.path}</span>
                    <span className="text-foreground-950 font-semibold shrink-0">{p.count.toLocaleString("uz-UZ")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
