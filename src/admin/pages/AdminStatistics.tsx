import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchStatsSummary, type SiteStatsSummary } from "@/lib/siteStats";

const DAY_LABEL = new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "2-digit" });
const TIME_LABEL = new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit" });
const NUMBER = new Intl.NumberFormat("uz-UZ");
const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

const SOURCE_META = {
  direct: { label: "To'g'ridan-to'g'ri", color: "#192b72", icon: "ri-cursor-line" },
  search: { label: "Qidiruv tizimlari", color: "#4f73c8", icon: "ri-search-line" },
  social: { label: "Ijtimoiy tarmoqlar", color: "#d1a91f", icon: "ri-share-line" },
  referral: { label: "Boshqa havolalar", color: "#8491b4", icon: "ri-links-line" },
} as const;

const DEVICE_META = {
  desktop: { label: "Kompyuter", icon: "ri-computer-line" },
  mobile: { label: "Telefon", icon: "ri-smartphone-line" },
  tablet: { label: "Planshet", icon: "ri-tablet-line" },
  other: { label: "Boshqa", icon: "ri-device-line" },
} as const;

type Range = 7 | 30;

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLongDay(date: Date) {
  return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}`;
}

function formatDelta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? { text: "O'zgarishsiz", tone: "neutral" as const } : { text: "Yangi faollik", tone: "positive" as const };
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return { text: "O'zgarishsiz", tone: "neutral" as const };
  return { text: `${percent > 0 ? "+" : ""}${percent}%`, tone: percent > 0 ? "positive" as const : "negative" as const };
}

function Delta({ current, previous }: { current: number; previous: number }) {
  const delta = formatDelta(current, previous);
  const classes = delta.tone === "positive"
    ? "bg-emerald-50 text-emerald-700"
    : delta.tone === "negative"
      ? "bg-red-50 text-red-700"
      : "bg-background-100 text-foreground-500";
  const icon = delta.tone === "positive" ? "ri-arrow-up-line" : delta.tone === "negative" ? "ri-arrow-down-line" : "ri-subtract-line";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${classes}`}><i className={icon} />{delta.text}</span>;
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  delta,
}: {
  label: string;
  value: number;
  hint: string;
  icon: string;
  delta?: { current: number; previous: number };
}) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-background-200 bg-background-50 p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_14px_28px_rgba(25,43,114,0.08)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="mb-8 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-lg text-primary-700">
          <i className={icon} aria-hidden />
        </div>
        {delta && <Delta current={delta.current} previous={delta.previous} />}
      </div>
      <div className="font-heading text-4xl font-bold tracking-tight tabular-nums text-foreground-950">{NUMBER.format(value)}</div>
      <div className="mt-1 text-sm font-medium text-foreground-700">{label}</div>
      <div className="mt-4 text-xs text-foreground-500">{hint}</div>
    </section>
  );
}

function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-background-200 bg-background-50 p-5 shadow-[0_8px_24px_rgba(25,43,114,0.035)] sm:p-6">
      <div className="mb-6 flex flex-col gap-3 border-b border-background-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-foreground-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-44 rounded-2xl bg-background-200" />)}
      </div>
      <div className="h-80 rounded-2xl bg-background-200" />
    </div>
  );
}

function EmptyBreakdown({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl bg-background-100 px-6 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background-50 text-primary-600"><i className={icon} /></div>
      <p className="max-w-60 text-sm leading-relaxed text-foreground-500">{text}</p>
    </div>
  );
}

export default function AdminStatistics() {
  const [data, setData] = useState<SiteStatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>(30);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const summary = await fetchStatsSummary();
      setData(summary);
      setUpdatedAt(new Date());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Statistikani yuklab bo'lmadi");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => {
    if (!data) return null;
    return range === 7
      ? { current: data.last7Days, previous: data.previous7Days, series: data.dailySeries.slice(-7), label: "so'nggi 7 kun" }
      : { current: data.last30Days, previous: data.previous30Days, series: data.dailySeries, label: "so'nggi 30 kun" };
  }, [data, range]);

  const activeHour = useMemo(() => {
    if (!data) return null;
    return data.hourlyActivity.reduce((best, hour) => hour.count > best.count ? hour : best, data.hourlyActivity[0]);
  }, [data]);

  const sourceTotal = data?.trafficSources.reduce((sum, source) => sum + source.count, 0) ?? 0;
  const deviceTotal = data?.devices.reduce((sum, device) => sum + device.count, 0) ?? 0;
  const topPageTotal = data?.topPages.reduce((sum, page) => sum + page.count, 0) ?? 0;

  return (
    <div className="mx-auto max-w-[1500px] pb-8">
      <header className="relative mb-7 overflow-hidden rounded-[28px] border border-primary-900 bg-primary-800 px-5 py-6 text-white shadow-[0_18px_45px_rgba(25,43,114,0.16)] sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: "radial-gradient(circle at 76% 20%, rgba(255,255,255,.18) 0 2px, transparent 3px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "30px 30px, 30px 30px, 30px 30px" }} />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/65"><i className="ri-heart-pulse-line text-base" /> Trafik monitori</div>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Sayt faoliyati bir qarashda</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">FerMI saytiga tashriflar, foydali sahifalar va kirish manbalari shu markazda jamlanadi.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="inline-flex rounded-xl border border-white/15 bg-white/10 p-1">{([7, 30] as Range[]).map((value) => <button key={value} onClick={() => setRange(value)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${range === value ? "bg-white text-primary-800 shadow-sm" : "text-white/70 hover:text-white"}`}>{value} kun</button>)}</div>
            {updatedAt && <span className="text-xs text-white/65">Yangilandi: {TIME_LABEL.format(updatedAt)}</span>}
            <button onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-800 transition-transform hover:bg-primary-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
              <i className={refreshing ? "ri-loader-4-line animate-spin" : "ri-refresh-line"} />
              {refreshing ? "Yangilanmoqda" : "Yangilash"}
            </button>
          </div>
        </div>
        {selected && <div className="relative mt-7 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-[auto_auto_1fr] sm:items-end"><div><div className="text-xs font-medium text-white/65">Tanlangan davr</div><div className="mt-1 font-heading text-4xl font-bold tracking-tight tabular-nums">{NUMBER.format(selected.current)}</div></div><div className="pb-1"><Delta current={selected.current} previous={selected.previous} /></div><p className="max-w-md text-sm leading-relaxed text-white/70">{selected.label}da qayd etilgan sahifa ko'rishlari. Taqqoslash oldingi teng davr bilan amalga oshiriladi.</p></div>}
      </header>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="flex items-center gap-2"><i className="ri-error-warning-line text-lg" />{error}</span>
          <button onClick={() => void load(true)} className="font-semibold underline">Qayta urinish</button>
        </div>
      )}

      {!data && !error && <LoadingState />}

      {data && selected && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard label="Bugungi tashriflar" value={data.today} hint="Kecha bilan solishtiriladi" icon="ri-calendar-check-line" delta={{ current: data.today, previous: data.yesterday }} />
            <MetricCard label="Kunlik o'rtacha" value={data.avgPerDay} hint="Barcha kuzatilgan kunlar bo'yicha" icon="ri-pulse-line" />
            <MetricCard label="Jami ko'rishlar" value={data.total} hint={`${NUMBER.format(data.distinctPages)} ta sahifa kuzatilmoqda`} icon="ri-bar-chart-box-line" />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(340px,0.85fr)]">
            <SectionCard
              title="Tashriflar dinamikasi"
              subtitle={`${selected.label}dagi sahifa ko'rishlar`}
              action={<span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700"><i className="ri-calendar-line" /> {range} kun</span>}
            >
              <div className="h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selected.series} margin={{ top: 12, right: 4, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trafficArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#192b72" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#192b72" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e7eaf4" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => DAY_LABEL.format(parseIsoDate(value))} axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: "#75809b", fontSize: 11 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#75809b", fontSize: 11 }} />
                    <Tooltip cursor={{ stroke: "#b7c1dc", strokeWidth: 1 }} contentStyle={{ border: "1px solid #dfe4f1", borderRadius: 12, boxShadow: "0 10px 25px rgba(16, 31, 89, 0.10)", fontSize: 12 }} labelFormatter={(value) => formatLongDay(parseIsoDate(String(value)))} formatter={(value: number | undefined) => [`${NUMBER.format(value ?? 0)} ta`, "Tashrif"]} />
                    <Area type="monotone" dataKey="count" stroke="#192b72" strokeWidth={2.5} fill="url(#trafficArea)" activeDot={{ r: 5, fill: "#192b72", stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-background-200 pt-4 sm:grid-cols-3">
                <div><div className="text-xs text-foreground-500">Eng yuqori kun</div><div className="mt-1 font-semibold text-foreground-950">{NUMBER.format(data.peakDay.count)} ta <span className="font-normal text-foreground-400">{formatLongDay(parseIsoDate(data.peakDay.date))}</span></div></div>
                <div><div className="text-xs text-foreground-500">Davr o'zgarishi</div><div className="mt-1"><Delta current={selected.current} previous={selected.previous} /></div></div>
                <div className="col-span-2 sm:col-span-1"><div className="text-xs text-foreground-500">Kuzatilgan sahifalar</div><div className="mt-1 font-semibold text-foreground-950">{NUMBER.format(data.distinctPages)} ta</div></div>
              </div>
            </SectionCard>

            <SectionCard title="Bugungi faollik" subtitle="Soatlar kesimida tashriflar">
              {data.hourlyActivity.some((item) => item.count > 0) ? (
                <>
                  <div className="mb-5 rounded-xl bg-primary-50 px-4 py-3"><div className="text-xs text-primary-700">Faol vaqt</div><div className="mt-1 text-lg font-bold text-primary-900">{activeHour?.hour}:00 <span className="text-sm font-medium text-primary-700">{NUMBER.format(activeHour?.count ?? 0)} ta tashrif</span></div></div>
                  <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.hourlyActivity} margin={{ top: 2, right: 0, left: -22, bottom: 0 }}><XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} axisLine={false} tickLine={false} interval={3} tick={{ fill: "#75809b", fontSize: 10 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#75809b", fontSize: 10 }} /><Tooltip cursor={{ fill: "#f4f6fb" }} contentStyle={{ border: "1px solid #dfe4f1", borderRadius: 12, fontSize: 12 }} labelFormatter={(value) => `${value}:00`} formatter={(value: number | undefined) => [`${NUMBER.format(value ?? 0)} ta`, "Tashrif"]} /><Bar dataKey="count" fill="#4f73c8" radius={[5, 5, 1, 1]} /></BarChart></ResponsiveContainer></div>
                </>
              ) : <EmptyBreakdown icon="ri-time-line" text="Bugungi tashriflar kelishi bilan soatlar kesimidagi faollik shu yerda ko'rinadi." />}
            </SectionCard>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SectionCard title="Eng ko'p ko'rilgan sahifalar" subtitle="Barcha vaqt bo'yicha">
              {data.topPages.length === 0 ? <EmptyBreakdown icon="ri-file-list-3-line" text="Hali sahifa ko'rishlari yig'ilmagan." /> : <div className="space-y-4">{data.topPages.slice(0, 5).map((page, index) => { const share = topPageTotal ? Math.round((page.count / topPageTotal) * 100) : 0; return <div key={page.path} className="flex items-center gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xs font-bold text-primary-700">{index + 1}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-foreground-900" title={page.path}>{page.path === "/" ? "Bosh sahifa" : page.path}</div><div className="mt-1 text-xs text-foreground-500">Jami ko'rishlarning {share}% i</div></div><div className="text-right"><div className="text-sm font-bold tabular-nums text-foreground-950">{NUMBER.format(page.count)}</div><div className="text-[11px] text-foreground-400">tashrif</div></div></div>; })}</div>}
            </SectionCard>

            <SectionCard title="Kirish manbalari" subtitle="Yig'ish yoqilgandan keyingi umumiy ma'lumot">
              {sourceTotal === 0 ? <EmptyBreakdown icon="ri-radar-line" text="Keyingi tashriflardan boshlab kirish manbalari avtomatik umumlashtiriladi." /> : <div className="flex min-h-52 items-center gap-2"><div className="h-48 w-40 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.trafficSources.filter((item) => item.count > 0)} dataKey="count" nameKey="key" innerRadius={48} outerRadius={72} paddingAngle={3}>{data.trafficSources.filter((item) => item.count > 0).map((item) => <Cell key={item.key} fill={SOURCE_META[item.key].color} />)}</Pie><Tooltip formatter={(value: number | undefined, key: keyof typeof SOURCE_META) => [`${NUMBER.format(value ?? 0)} ta`, SOURCE_META[key]?.label ?? key]} contentStyle={{ border: "1px solid #dfe4f1", borderRadius: 12, fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="min-w-0 flex-1 space-y-3">{data.trafficSources.filter((item) => item.count > 0).map((item) => <div key={item.key} className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2 text-xs text-foreground-700"><i className={`${SOURCE_META[item.key].icon} text-base`} style={{ color: SOURCE_META[item.key].color }} /><span className="truncate">{SOURCE_META[item.key].label}</span></div><span className="text-xs font-bold tabular-nums text-foreground-950">{Math.round((item.count / sourceTotal) * 100)}%</span></div>)}</div></div>}
            </SectionCard>

            <SectionCard title="Qurilmalar" subtitle="Tashriflar kelgan qurilma turi">
              {deviceTotal === 0 ? <EmptyBreakdown icon="ri-smartphone-line" text="Qurilma turi haqidagi umumiy statistika yangi tashriflar bilan shakllanadi." /> : <div className="space-y-4">{data.devices.filter((item) => item.count > 0).map((device) => { const percentage = Math.round((device.count / deviceTotal) * 100); return <div key={device.key} className="rounded-xl bg-background-100 p-3.5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-semibold text-foreground-800"><i className={`${DEVICE_META[device.key].icon} text-lg text-primary-700`} />{DEVICE_META[device.key].label}</div><div className="text-sm font-bold tabular-nums text-foreground-950">{percentage}%</div></div><div className="mt-2 text-xs text-foreground-500">{NUMBER.format(device.count)} ta tashrif</div></div>; })}</div>}
            </SectionCard>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-background-200 bg-background-50 px-5 py-4 text-sm text-foreground-600 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><i className="ri-shield-check-line text-lg" /></div><p className="leading-relaxed"><span className="font-semibold text-foreground-900">Maxfiylik saqlanadi.</span> Statistikada IP manzil, ism yoki boshqa shaxsiy ma'lumot saqlanmaydi. Faqat umumiy sahifa ko'rishlari, qurilma turi va kirish manbasi hisoblanadi.</p></div>
            <div className="shrink-0 text-xs text-foreground-400">Ma'lumotlar tashqi servisga yuborilmaydi.</div>
          </div>
        </>
      )}
    </div>
  );
}
