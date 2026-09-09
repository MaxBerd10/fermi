// Caches full-resolution photos (and video poster thumbnails) for the institute's
// Telegram channel posts, via the Telegram Bot API — so the site can show a sharp
// image instead of the public https://t.me/s/<channel> preview page's deliberately
// downscaled "blured" thumbnail that telegram-feed.mjs scrapes (that public page has
// no higher-resolution version available at any URL; the Bot API is the only source
// for the original file).
//
// Scope is intentionally narrow, to avoid reintroducing the duplicate-post bug that
// led to disabling this channel's post webhook earlier:
//   - This module NEVER creates, edits, or even reads CMS posts. It only downloads
//     media files and saves them to disk, keyed by the Telegram message id.
//   - It uses long-polling (getUpdates), never a webhook — a webhook is what
//     previously double-fired post creation; long-polling has no such retry-delivery
//     risk here since we don't act on "delivery", we just overwrite the same cache
//     file on any redelivery.
//   - telegram-feed.mjs (the actual post reader) is untouched except for one lookup:
//     "is there a cached high-res file for this message id? use it, else keep the
//     scraped low-res one" — so a cache miss (bot not configured, or hasn't caught up
//     yet) always degrades to exactly today's behavior, never breaks anything.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = resolve(rootDir, "data", "telegram-media");

function loadEnvFile(filePath) {
  try {
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional local env files */
  }
}
for (const name of [".env.production.local", ".env.local", ".env.production", ".env"]) {
  loadEnvFile(resolve(rootDir, name));
}

const BOT_TOKEN = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
const apiBase = () => `https://api.telegram.org/bot${BOT_TOKEN}`;
const fileBase = () => `https://api.telegram.org/file/bot${BOT_TOKEN}`;

// Cached files older than this are pruned — mirrors how long a Telegram post stays
// realistically relevant/linked-to; keeps disk usage bounded without ever touching
// the CMS/database. Images only (no video downloads), so footprint stays small even
// well under this window.
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const CACHE_CONTROL = "public, max-age=2592000, immutable"; // 30 days — filename is content-addressed by message id

let offset = 0;
let running = false;

function ensureCacheDir() {
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
}

// One file per Telegram message id (each channel_post update — including each photo
// of a grouped/album post, which Telegram delivers as separate consecutive-id
// messages sharing one media_group_id — carries exactly one photo/video-thumb file).
function cachePathFor(messageId) {
  return resolve(cacheDir, `${messageId}.jpg`);
}

async function downloadFile(fileId, destPath) {
  const metaRes = await fetch(`${apiBase()}/getFile?file_id=${encodeURIComponent(fileId)}`);
  const meta = await metaRes.json().catch(() => null);
  const filePath = meta?.result?.file_path;
  if (!meta?.ok || !filePath) return false;
  const fileRes = await fetch(`${fileBase()}/${filePath}`);
  if (!fileRes.ok) return false;
  const buffer = Buffer.from(await fileRes.arrayBuffer());
  ensureCacheDir();
  writeFileSync(destPath, buffer);
  return true;
}

function largestPhotoSize(photoSizes) {
  // Telegram sends PhotoSize entries smallest-first — the last is the original upload.
  if (!Array.isArray(photoSizes) || !photoSizes.length) return null;
  return photoSizes[photoSizes.length - 1];
}

async function cacheChannelPost(post) {
  if (!post || typeof post.message_id !== "number") return;
  try {
    if (Array.isArray(post.photo) && post.photo.length) {
      const largest = largestPhotoSize(post.photo);
      if (largest?.file_id) await downloadFile(largest.file_id, cachePathFor(post.message_id));
    } else if (post.video?.thumb?.file_id) {
      await downloadFile(post.video.thumb.file_id, cachePathFor(post.message_id));
    }
  } catch (error) {
    console.error(`telegram-media-cache: failed to cache message ${post.message_id}`, error);
  }
}

async function pollOnce() {
  const res = await fetch(`${apiBase()}/getUpdates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timeout: 25, offset, allowed_updates: ["channel_post"] }),
  });
  if (!res.ok) throw new Error(`getUpdates failed (${res.status})`);
  const data = await res.json();
  if (!data.ok || !Array.isArray(data.result)) return;
  for (const update of data.result) {
    offset = update.update_id + 1;
    if (update.channel_post) await cacheChannelPost(update.channel_post);
  }
}

function purgeOldFiles() {
  try {
    ensureCacheDir();
    const now = Date.now();
    for (const name of readdirSync(cacheDir)) {
      const full = resolve(cacheDir, name);
      try {
        if (now - statSync(full).mtimeMs > MAX_AGE_MS) unlinkSync(full);
      } catch {
        /* file removed concurrently — fine */
      }
    }
  } catch (error) {
    console.error("telegram-media-cache: purge failed", error);
  }
}

// Long-polling (never a webhook — see file header). Loops forever once started;
// getUpdates' own `timeout=25` paces it, so no extra delay between successful polls.
export function startTelegramMediaCache() {
  if (!BOT_TOKEN) {
    console.warn(
      "telegram-media-cache: TELEGRAM_BOT_TOKEN not set — high-res Telegram images are disabled, site falls back to the public preview's lower-quality images.",
    );
    return;
  }
  if (running) return;
  running = true;
  ensureCacheDir();
  purgeOldFiles();
  const purgeTimer = setInterval(purgeOldFiles, 24 * 60 * 60 * 1000);
  purgeTimer.unref?.();

  (async function loop() {
    while (running) {
      try {
        await pollOnce();
      } catch (error) {
        console.error("telegram-media-cache: poll failed, retrying shortly", error);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  })();
}

// Returns the site-relative URL for a cached high-res file, or null on a cache miss
// (bot not configured, message not seen yet, or older than the retention window) —
// callers always have a lower-quality fallback ready for the null case.
export function cachedMediaUrlFor(messageId) {
  return existsSync(cachePathFor(messageId)) ? `/telegram-media/${messageId}.jpg` : null;
}

const MEDIA_ROUTE_PREFIX = "/telegram-media/";

export async function handleTelegramMediaRequest(request, response) {
  const requestUrl = new URL(request.url || "/", "http://localhost");
  if (!requestUrl.pathname.startsWith(MEDIA_ROUTE_PREFIX)) return false;

  const name = requestUrl.pathname.slice(MEDIA_ROUTE_PREFIX.length);
  // Only ever "<digits>.jpg" — reject anything else outright (no path traversal).
  if (!/^\d+\.jpg$/.test(name)) {
    response.statusCode = 404;
    response.end();
    return true;
  }
  const filePath = resolve(cacheDir, name);
  if (!filePath.startsWith(`${cacheDir}/`) || !existsSync(filePath)) {
    response.statusCode = 404;
    response.end();
    return true;
  }
  response.statusCode = 200;
  response.setHeader("Content-Type", extname(filePath) === ".jpg" ? "image/jpeg" : "application/octet-stream");
  response.setHeader("Cache-Control", CACHE_CONTROL);
  response.end(readFileSync(filePath));
  return true;
}
