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

function emptyStats() {
  return { total: 0, byDate: {}, byPath: {} };
}

function loadStats() {
  try {
    const raw = readFileSync(statsFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      total: Number(parsed.total) || 0,
      byDate: parsed.byDate && typeof parsed.byDate === "object" ? parsed.byDate : {},
      byPath: parsed.byPath && typeof parsed.byPath === "object" ? parsed.byPath : {},
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

function todayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function normalizePath(rawPath) {
  const trimmed = String(rawPath || "").trim();
  if (!trimmed || !trimmed.startsWith("/")) return null;
  return trimmed.slice(0, MAX_PATH_LENGTH);
}

export function recordHit(rawPath) {
  const path = normalizePath(rawPath);
  if (!path) return false;

  stats.total += 1;
  const date = todayKey();
  stats.byDate[date] = (stats.byDate[date] || 0) + 1;

  const alreadyTracked = Object.prototype.hasOwnProperty.call(stats.byPath, path);
  if (alreadyTracked || Object.keys(stats.byPath).length < MAX_TRACKED_PATHS) {
    stats.byPath[path] = (stats.byPath[path] || 0) + 1;
  }

  persist();
  return true;
}

function sumLastNDays(n) {
  let sum = 0;
  const cursor = new Date();
  for (let i = 0; i < n; i++) {
    const key = cursor.toISOString().slice(0, 10);
    sum += stats.byDate[key] || 0;
    cursor.setDate(cursor.getDate() - 1);
  }
  return sum;
}

export function getStatsSummary() {
  const dailySeries = [];
  const cursor = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailySeries.push({ date: key, count: stats.byDate[key] || 0 });
  }

  const topPages = Object.entries(stats.byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  return {
    total: stats.total,
    today: stats.byDate[todayKey()] || 0,
    last7Days: sumLastNDays(7),
    last30Days: sumLastNDays(30),
    dailySeries,
    topPages,
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
      const ok = recordHit(body.path);
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

  return false;
}
