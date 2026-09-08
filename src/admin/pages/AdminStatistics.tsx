import { useEffect, useMemo, useState } from "react";
import { fetchStatsSummary, type SiteStatsSummary } from "@/lib/siteStats";

const DAY_LABEL = new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "2-digit" });

// Not every browser's ICU data spells out Uzbek month names (some fall back to a
// bare "M09"-style token instead) — a fixed list renders identically everywhere.
const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

function formatLongDay(date: Date) {
  return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}`;
}

// "YYYY-MM-DD" parsed as local calendar day, not UTC — matches the server's own
// per-day bucketing (both use the local calendar day).
function parseIsoDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDelta(current: number, previous: number): { text: string; direction: "up" | "down" | "flat" } {
  if (previous === 0) {
    if (current === 0) return { text: "o'zgarishsiz", direction: "flat" };
    return { text: "yangi", direction: "up" };
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return { text: "o'zgarishsiz", direction: "flat" };
  return { text: `${percent > 0 ? "+" : ""}${percent}%`, direction: percent > 0 ? "up" : "down" };
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const { text, direction } = formatDelta(current, previous);
  const color =
    direction === "up" ? "text-green-600 bg-green-50" : direction === "down" ? "text-red-600 bg-red-50" : "text-foreground-400 bg-background-100";
  const icon = direction === "up" ? "ri-arrow-up-line" : direction === "down" ? "ri-arrow-down-line" : "ri-subtract-line";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
      <i className={icon} aria-hidden />
      {text}
    </span>
  );
}

function StatTile({
  label,
  value,
  icon,
  delta,
}: {
  label: string;
  value: number;
  icon: string;
  delta?: { current: number; previous: number };
}) {
  return (
    <div className="bg-background-50 border border-background-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-lg">
          <i className={icon} />
        </div>
        {delta && <DeltaBadge current={delta.current} previous={delta.previous} />}
      </div>
      <div className="font-heading text-3xl font-bold text-foreground-950 tabular-nums">{value.toLocaleString("uz-UZ")}</div>
      <div className="text-sm text-foreground-500 mt-0.5">{label}</div>
    </div>
  );
}

function DailyBarChart({ series, peakDate }: { series: SiteStatsSummary["dailySeries"]; peakDate: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((d) => d.count));
  // 30 bars is too many x-axis labels to show without crowding — every 5th, plus the
  // last (today), keeps them readable.
  const showLabelAt = (i: number) => i % 5 === 0 || i === series.length - 1;

  return (
    <div className="relative">
      <div className="flex items-end gap-1 h-44 border-b border-background-200">
        {series.map((d, i) => {
          const isPeak = d.date === peakDate && d.count > 0;
          const heightPct = (d.count / max) * 100;
          return (
            <div
              key={d.date}
              className="flex-1 h-full flex flex-col items-center justify-end group relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            >
              {isPeak && (
                <div className="text-[10px] font-semibold text-primary-700 mb-1 whitespace-nowrap">{d.count}</div>
              )}
              <div
                className={`w-full rounded-t-sm transition-colors ${isPeak ? "bg-primary-600" : "bg-primary-300 group-hover:bg-primary-500"}`}
                style={{ height: `${Math.max(heightPct, d.count > 0 ? 3 : 1)}%` }}
              />
              {hovered === i && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-foreground-950 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                  <span className="font-semibold">{d.count}</span> ta tashrif · {formatLongDay(parseIsoDate(d.date))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-1.5">
        {series.map((d, i) => (
          <div key={d.date} className="flex-1 text-center text-[10px] text-foreground-400">
            {showLabelAt(i) ? DAY_LABEL.format(parseIsoDate(d.date)) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopPagesList({ pages }: { pages: SiteStatsSummary["topPages"] }) {
  const max = Math.max(1, ...pages.map((p) => p.count));
  return (
    <div className="space-y-3">
      {pages.map((p, i) => (
        <div key={p.path} className="flex items-center gap-3">
          <div className="w-5 text-xs text-foreground-400 tabular-nums shrink-0">{i + 1}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-foreground-800 font-mono truncate mb-1">{p.path}</div>
            <div className="h-1.5 bg-background-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-400 rounded-full" style={{ width: `${(p.count / max) * 100}%` }} />
            </div>
          </div>
          <div className="text-sm font-semibold text-foreground-950 tabular-nums shrink-0 w-12 text-right">
            {p.count.toLocaleString("uz-UZ")}
          </div>
        </div>
      ))}
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

  const peakLabel = useMemo(
    () => (data ? formatLongDay(parseIsoDate(data.peakDay.date)) : ""),
    [data],
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground-950 mb-1">Statistika</h1>
      <p className="text-sm text-foreground-500 mb-8">
        Sayt tashrif statistikasi — o'z serverimizda hisoblanadi, tashqi xizmatga bog'liq emas.
      </p>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
      {!data && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-background-50 border border-background-200 rounded-xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatTile label="Bugun" value={data.today} icon="ri-calendar-todo-line" delta={{ current: data.today, previous: data.yesterday }} />
            <StatTile
              label="So'nggi 7 kun"
              value={data.last7Days}
              icon="ri-calendar-2-line"
              delta={{ current: data.last7Days, previous: data.previous7Days }}
            />
            <StatTile
              label="So'nggi 30 kun"
              value={data.last30Days}
              icon="ri-calendar-event-line"
              delta={{ current: data.last30Days, previous: data.previous30Days }}
            />
            <StatTile label="Jami (barcha vaqt)" value={data.total} icon="ri-bar-chart-2-line" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-background-50 border border-background-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-lg shrink-0">
                <i className="ri-line-chart-line" />
              </div>
              <div>
                <div className="text-sm text-foreground-500">Kunlik o'rtacha</div>
                <div className="font-semibold text-foreground-950 tabular-nums">{data.avgPerDay.toLocaleString("uz-UZ")} tashrif</div>
              </div>
            </div>
            <div className="bg-background-50 border border-background-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-lg shrink-0">
                <i className="ri-fire-line" />
              </div>
              <div>
                <div className="text-sm text-foreground-500">Eng yuqori kun</div>
                <div className="font-semibold text-foreground-950 tabular-nums">
                  {data.peakDay.count.toLocaleString("uz-UZ")} <span className="text-foreground-400 font-normal">({peakLabel})</span>
                </div>
              </div>
            </div>
            <div className="bg-background-50 border border-background-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-lg shrink-0">
                <i className="ri-file-list-3-line" />
              </div>
              <div>
                <div className="text-sm text-foreground-500">Kuzatilgan sahifalar</div>
                <div className="font-semibold text-foreground-950 tabular-nums">{data.distinctPages.toLocaleString("uz-UZ")} ta</div>
              </div>
            </div>
          </div>

          <div className="bg-background-50 border border-background-200 rounded-xl p-5 mb-8">
            <div className="font-semibold text-foreground-900 mb-5">So'nggi 30 kun</div>
            <DailyBarChart series={data.dailySeries} peakDate={data.peakDay.date} />
          </div>

          <div className="bg-background-50 border border-background-200 rounded-xl p-5">
            <div className="font-semibold text-foreground-900 mb-4">Eng ko'p ko'rilgan sahifalar</div>
            {data.topPages.length === 0 ? (
              <div className="text-sm text-foreground-500">Hali ma'lumot yo'q.</div>
            ) : (
              <TopPagesList pages={data.topPages} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
