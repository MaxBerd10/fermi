// Decides, per PDF, whether it's safe to embed directly (fast — the browser's own
// renderer uses HTTP range requests, so it paints the first page almost immediately)
// or whether it needs to go through Google's gview proxy instead (slower — gview has
// to fetch the whole document server-side first — but the only one of the two that
// tolerates a PDF's owner/permissions encryption without prompting for a password;
// see PdfDocumentViewer.tsx and the git history around it).
//
// The signal: does the file have a PDF /Encrypt entry at all. That covers BOTH real
// open-password files and owner/permissions-only files — the browser's native viewer
// blocks on a password prompt for either, even though only the former is actually
// impossible to view without a password, so this errs toward the safe (gview) choice
// whenever encryption is present in any form, rather than trying to distinguish them.
//
// This can only be answered by fetching bytes of the file, and the browser can't do
// that itself (api.fermi.uz sends no CORS header, so a page-side fetch is blocked) —
// hence a small server-side check, cached indefinitely per URL since these are static
// uploads that don't change After being published.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = resolve(rootDir, "data", "pdf-check");

const ALLOWED_ORIGINS = ["https://api.fermi.uz", "https://fjsti.uz", "https://www.fjsti.uz"];
const CHUNK_BYTES = 65_536; // 64KB from each end — the xref/trailer (where /Encrypt lives) is
// almost always within this range, whether the file is a normal PDF (trailer at the
// end) or "linearized"/fast-web-view (a duplicate xref near the start).

function ensureCacheDir() {
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
}

function isAllowedSource(rawUrl) {
  try {
    return ALLOWED_ORIGINS.includes(new URL(rawUrl).origin);
  } catch {
    return false;
  }
}

function cachePathFor(src) {
  return resolve(cacheDir, `${createHash("sha1").update(src).digest("hex")}.json`);
}

async function fetchRange(src, rangeHeader) {
  const res = await fetch(src, { headers: { Range: rangeHeader }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok && res.status !== 206) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function detectEncryption(src) {
  // HEAD first, purely to get a Content-Length — falls back to "just try the range
  // fetches" if the server doesn't answer HEAD usefully.
  let size = null;
  try {
    const head = await fetch(src, { method: "HEAD", signal: AbortSignal.timeout(10_000) });
    const len = head.headers.get("content-length");
    if (len) size = Number(len);
  } catch {
    /* fall through */
  }

  const chunks = [];
  const head1 = await fetchRange(src, `bytes=0-${CHUNK_BYTES - 1}`);
  if (head1) chunks.push(head1);
  if (size === null || size > CHUNK_BYTES) {
    const tail = await fetchRange(src, `bytes=-${CHUNK_BYTES}`);
    if (tail) chunks.push(tail);
  }
  if (chunks.length === 0) return null; // couldn't read the file at all — caller decides the safe default

  return chunks.some((buf) => buf.includes("/Encrypt"));
}

export async function handlePdfCheckRequest(request, response) {
  const requestUrl = new URL(request.url || "/", "http://localhost");
  if (!requestUrl.pathname.startsWith("/pdf-check")) return false;

  const src = requestUrl.searchParams.get("src") || "";
  if (!isAllowedSource(src)) {
    response.statusCode = 400;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Invalid src" }));
    return true;
  }

  ensureCacheDir();
  const cachePath = cachePathFor(src);
  if (existsSync(cachePath)) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "public, max-age=2592000");
    response.end(readFileSync(cachePath, "utf8"));
    return true;
  }

  try {
    const encrypted = await detectEncryption(src);
    // encrypted === null means the file couldn't be read at all — treat that the same
    // as "encrypted" (i.e. stick with the safe gview default) rather than guessing.
    const result = { encrypted: encrypted !== false };
    writeFileSync(cachePath, JSON.stringify(result));
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "public, max-age=2592000");
    response.end(JSON.stringify(result));
  } catch (error) {
    console.error(`pdf-check: failed to inspect ${src}`, error);
    // Any failure defaults to "encrypted" (safe/slow), never "not encrypted" (risking
    // the password-block failure this whole check exists to avoid).
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ encrypted: true }));
  }
  return true;
}
