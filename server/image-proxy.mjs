// On-the-fly image resizing/compression cache. The CMS backend (PHP) stores whatever
// the admin panel uploads as-is — real originals here run 8-10MB, straight off a
// phone/camera, served completely unresized even where the page only shows a small
// thumbnail. That's most of "pages load slowly" for anything image-heavy (galleries,
// news, leader photos): the browser downloads megabytes for a few hundred on-screen
// pixels. This module fetches the original once, resizes/compresses it with sharp to a
// small fixed set of widths, and caches the result — same pattern as
// telegram-media-cache.mjs, just for CMS-hosted photos instead of Telegram ones.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = resolve(rootDir, "data", "image-cache");

// Only ever fetch from origins this site itself actually uploads to — an open "fetch
// any URL I give you" proxy is an SSRF/abuse vector, so this allowlist is not optional.
const ALLOWED_ORIGINS = ["https://api.fermi.uz", "https://fjsti.uz", "https://www.fjsti.uz"];
// A small fixed set rather than arbitrary integers — keeps the cache bounded and closes
// off "request 10,000 different widths" as a cheap way to fill the disk.
const ALLOWED_WIDTHS = [200, 320, 480, 640, 900, 1200, 1600];
const MAX_SOURCE_BYTES = 30 * 1024 * 1024; // guards memory use against an unexpectedly huge upload
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // stale cache entries are pruned after ~3 months
const CACHE_CONTROL = "public, max-age=2592000, immutable";

function ensureCacheDir() {
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
}

function isAllowedSource(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return ALLOWED_ORIGINS.includes(parsed.origin);
  } catch {
    return false;
  }
}

function cacheKeyFor(src, width) {
  return createHash("sha1").update(`${src}|w${width}`).digest("hex");
}

async function resizeAndCache(src, width) {
  const upstream = await fetch(src, { signal: AbortSignal.timeout(20_000) });
  if (!upstream.ok) return null;
  const contentType = upstream.headers.get("content-type") || "";
  const buffer = Buffer.from(await upstream.arrayBuffer());
  if (buffer.length > MAX_SOURCE_BYTES) return null;

  // Animated formats would lose their animation through sharp's still-image pipeline —
  // simplest safe behavior is to pass those through unresized rather than break them.
  if (contentType.includes("gif") || contentType.includes("svg")) {
    return { buffer, contentType: contentType || "application/octet-stream" };
  }

  let pipeline = sharp(buffer).resize({ width, withoutEnlargement: true });
  let outContentType = contentType;
  if (contentType.includes("png")) {
    pipeline = pipeline.png({ compressionLevel: 9 });
    outContentType = "image/png";
  } else {
    // Default to JPEG output — covers jpeg sources (the vast majority here) and any
    // ambiguous/missing content-type. mozjpeg at quality 85 is visually near-lossless
    // at the display sizes these are actually shown at, while cutting file size by
    // roughly 10-20x versus an unresized camera-original.
    pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
    outContentType = "image/jpeg";
  }
  const out = await pipeline.toBuffer();
  return { buffer: out, contentType: outContentType };
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
        /* removed concurrently — fine */
      }
    }
  } catch (error) {
    console.error("image-proxy: purge failed", error);
  }
}

let purgeStarted = false;
function ensurePurgeScheduled() {
  if (purgeStarted) return;
  purgeStarted = true;
  purgeOldFiles();
  const timer = setInterval(purgeOldFiles, 24 * 60 * 60 * 1000);
  timer.unref?.();
}

const ROUTE_PREFIX = "/img-cache";

export async function handleImageProxyRequest(request, response) {
  const requestUrl = new URL(request.url || "/", "http://localhost");
  if (!requestUrl.pathname.startsWith(ROUTE_PREFIX)) return false;
  ensurePurgeScheduled();

  const src = requestUrl.searchParams.get("src") || "";
  const width = Number(requestUrl.searchParams.get("w"));

  if (!isAllowedSource(src) || !ALLOWED_WIDTHS.includes(width)) {
    response.statusCode = 400;
    response.end();
    return true;
  }

  ensureCacheDir();
  const key = cacheKeyFor(src, width);
  const metaPath = resolve(cacheDir, `${key}.json`);
  const dataPath = resolve(cacheDir, `${key}.bin`);

  if (existsSync(metaPath) && existsSync(dataPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, "utf8"));
      response.statusCode = 200;
      response.setHeader("Content-Type", meta.contentType);
      response.setHeader("Cache-Control", CACHE_CONTROL);
      response.end(readFileSync(dataPath));
      return true;
    } catch {
      /* fall through and regenerate */
    }
  }

  try {
    const result = await resizeAndCache(src, width);
    if (!result) {
      response.statusCode = 502;
      response.end();
      return true;
    }
    writeFileSync(dataPath, result.buffer);
    writeFileSync(metaPath, JSON.stringify({ contentType: result.contentType }));
    response.statusCode = 200;
    response.setHeader("Content-Type", result.contentType);
    response.setHeader("Cache-Control", CACHE_CONTROL);
    response.end(result.buffer);
  } catch (error) {
    console.error(`image-proxy: failed to process ${src} @ w${width}`, error);
    response.statusCode = 502;
    response.end();
  }
  return true;
}
