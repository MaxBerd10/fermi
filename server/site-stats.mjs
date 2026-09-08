// Self-hosted, minimal page-view analytics — no third-party service, so the numbers
// stay in FerMI's own admin panel instead of an external dashboard. Persisted as a
// single JSON file (traffic here is modest; a real database would be overkill), loaded
// once at startup and rewritten after each hit.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = resolve(rootDir, "data");
const statsFilePath = resolve(dataDir, "site-stats.json");

const MAX_PATH_LENGTH = 200;
const MAX_TRACKED_PATHS = 500; // caps unbounded growth from bogus/scanner traffic
const UZBEKISTAN_TIME_ZONE = "Asia/Tashkent";
const TASHKENT_DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: UZBEKISTAN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

function emptyStats() {
  return {
    total: 0,
    byDate: {},
    byPath: {},
    byHour: {},
    byDevice: {},
    bySource: {},
  };
}

function numericMap(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, count]) => Number.isFinite(Number(count)) && Number(count) > 0)
      .map(([key, count]) => [key, Number(count)]),
  );
}

function loadStats() {
  try {
    const raw = readFileSync(statsFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      total: Number(parsed.total) || 0,
      byDate: numericMap(parsed.byDate),
      byPath: numericMap(parsed.byPath),
      byHour: numericMap(parsed.byHour),
      byDevice: numericMap(parsed.byDevice),
      bySource: numericMap(parsed.bySource),
    };
  } catch {
    return emptyStats();
  }
}

let stats = loadStats();

function persist() {
  try {
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    writeFileSync(statsFilePath, JSON.stringify(stats), "utf8");
  } catch (error) {
    console.error("Failed to persist site-stats.json", error);
  }
}

function tashkentParts(date = new Date()) {
  return Object.fromEntries(
    TASHKENT_DATE_PARTS.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

function todayKey(date = new Date()) {
  const parts = tashkentParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function tashkentHour(date = new Date()) {
  return tashkentParts(date).hour;
}

function normalizePath(rawPath) {
  const trimmed = String(rawPath || "").trim();
  if (!trimmed || !trimmed.startsWith("/")) return null;
  return trimmed.slice(0, MAX_PATH_LENGTH);
}

function deviceFromUserAgent(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  if (!ua) return "other";
  if (/ipad|tablet|kindle|silk\//.test(ua)) return "tablet";
  if (/mobi|android|iphone|ipod/.test(ua)) return "mobile";
  return "desktop";
}

function sourceFromReferer(referer) {
  const value = String(referer || "").toLowerCase();
  // Empty (typed URL, bookmark, most apps) or the site linking to itself (a full
  // reload from one fermi.uz page to another) both mean "nothing external sent them" —
  // neither is a real referral.
  if (!value || value.includes("fermi.uz")) return "direct";
  if (/google\.|bing\.|yandex\.|yahoo\.|duckduckgo\.|search\.brave\.com/.test(value)) return "search";
  if (/telegram\.|t\.me|instagram\.|facebook\.|fb\.com|youtube\.|linkedin\.|tiktok\.|twitter\.|x\.com/.test(value)) return "social";
  return "referral";
}

export function recordHit(rawPath, requestMeta = {}) {
  const path = normalizePath(rawPath);
  if (!path) return false;

  stats.total += 1;
  const date = todayKey();
  stats.byDate[date] = (stats.byDate[date] || 0) + 1;

  const hourKey = `${date}-${tashkentHour()}`;
  stats.byHour[hourKey] = (stats.byHour[hourKey] || 0) + 1;

  const device = deviceFromUserAgent(requestMeta.userAgent);
  stats.byDevice[device] = (stats.byDevice[device] || 0) + 1;

  const source = sourceFromReferer(requestMeta.referer);
  stats.bySource[source] = (stats.bySource[source] || 0) + 1;

  const alreadyTracked = Object.prototype.hasOwnProperty.call(stats.byPath, path);
  if (alreadyTracked || Object.keys(stats.byPath).length < MAX_TRACKED_PATHS) {
    stats.byPath[path] = (stats.byPath[path] || 0) + 1;
  }

  persist();
  return true;
}

// Sum of `n` days, starting `offset` days back — offset 0 = the window ending today,
// offset n = the equal-length window immediately before that one (for "vs last week" deltas).
function sumWindow(n, offset) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const key = dayKeyOffset(offset + i);
    sum += stats.byDate[key] || 0;
  }
  return sum;
}

function dayKeyOffset(daysAgo) {
  return todayKey(new Date(Date.now() - daysAgo * 86_400_000));
}

const DAILY_SERIES_LENGTH = 30;
const DEVICE_KEYS = ["desktop", "mobile", "tablet", "other"];
const SOURCE_KEYS = ["direct", "search", "social", "referral"];

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate(); // month is 1-12; day 0 of the next = last day of this one
}

function shiftMonth(year, month, delta) {
  const zeroBased = (month - 1) + delta;
  return { year: year + Math.floor(zeroBased / 12), month: (((zeroBased % 12) + 12) % 12) + 1 };
}

function sumMonth(year, month) {
  const numDays = daysInMonth(year, month);
  let sum = 0;
  for (let d = 1; d <= numDays; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    sum += stats.byDate[key] || 0;
  }
  return sum;
}

// A specific calendar month (e.g. "an actual August", not just "the last 30 days") —
// the admin panel's month picker. `stats.byDate` already keeps every day indefinitely,
// this just wasn't exposed for anything beyond the last DAILY_SERIES_LENGTH days.
export function getMonthSummary(monthKey) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(monthKey || ""))) return null;
  const [year, month] = monthKey.split("-").map(Number);
  const numDays = daysInMonth(year, month);

  const dailySeries = [];
  let total = 0;
  for (let d = 1; d <= numDays; d++) {
    const key = `${monthKey}-${String(d).padStart(2, "0")}`;
    const count = stats.byDate[key] || 0;
    dailySeries.push({ date: key, count });
    total += count;
  }

  const previous = shiftMonth(year, month, -1);
  return {
    month: monthKey,
    total,
    previousTotal: sumMonth(previous.year, previous.month),
    dailySeries,
  };
}

export function getStatsSummary() {
  const dailySeries = [];
  for (let i = DAILY_SERIES_LENGTH - 1; i >= 0; i--) {
    const key = dayKeyOffset(i);
    dailySeries.push({ date: key, count: stats.byDate[key] || 0 });
  }

  const topPages = Object.entries(stats.byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  const peakDay = dailySeries.reduce(
    (best, day) => (day.count > best.count ? day : best),
    { date: dailySeries[0]?.date ?? todayKey(), count: 0 },
  );
  const trackedDaysCount = Object.keys(stats.byDate).length || 1;
  const avgPerDay = Math.round((stats.total / trackedDaysCount) * 10) / 10;
  const today = todayKey();
  const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
    hour: String(hour).padStart(2, "0"),
    count: stats.byHour[`${today}-${String(hour).padStart(2, "0")}`] || 0,
  }));

  const trackedDates = Object.keys(stats.byDate).sort();

  return {
    total: stats.total,
    // So the frontend's month picker doesn't offer months from before tracking began.
    firstTrackedDate: trackedDates[0] ?? today,
    distinctPages: Object.keys(stats.byPath).length,
    avgPerDay,
    today: stats.byDate[todayKey()] || 0,
    yesterday: stats.byDate[dayKeyOffset(1)] || 0,
    last7Days: sumWindow(7, 0),
    previous7Days: sumWindow(7, 7),
    last30Days: sumWindow(30, 0),
    previous30Days: sumWindow(30, 30),
    peakDay,
    dailySeries,
    topPages,
    hourlyActivity,
    devices: DEVICE_KEYS.map((key) => ({ key, count: stats.byDevice[key] || 0 })),
    trafficSources: SOURCE_KEYS.map((key) => ({ key, count: stats.bySource[key] || 0 })),
  };
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

async function readRequestBody(request, maxBytes = 10_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("Request body is too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Returns true if the request was a site-stats route (handled either way, hit or miss).
export async function handleSiteStatsRequest(request, response) {
  const requestUrl = new URL(request.url || "/", "http://localhost");

  if (requestUrl.pathname === "/site-stats/hit" && request.method === "POST") {
    try {
      const raw = await readRequestBody(request);
      const body = raw.length ? JSON.parse(raw.toString("utf8")) : {};
      const ok = recordHit(body.path, {
        userAgent: request.headers["user-agent"],
        // From the client's own document.referrer (see src/lib/siteStats.ts), not the
        // HTTP Referer header on this request — that header is always fermi.uz itself,
        // since this POST is same-origin regardless of how the visitor actually arrived.
        referer: body.referrer,
      });
      if (ok) {
        response.statusCode = 204;
        response.end();
      } else {
        sendJson(response, 400, { error: "Invalid path" });
      }
    } catch {
      sendJson(response, 400, { error: "Invalid request" });
    }
    return true;
  }

  if (requestUrl.pathname === "/site-stats/summary" && request.method === "GET") {
    response.setHeader("Cache-Control", "no-store");
    sendJson(response, 200, getStatsSummary());
    return true;
  }

  if (requestUrl.pathname === "/site-stats/month" && request.method === "GET") {
    const monthSummary = getMonthSummary(requestUrl.searchParams.get("month"));
    response.setHeader("Cache-Control", "no-store");
    if (monthSummary) sendJson(response, 200, monthSummary);
    else sendJson(response, 400, { error: "Invalid or missing ?month=YYYY-MM" });
    return true;
  }

  return false;
}
