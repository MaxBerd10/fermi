import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { configureTelegramFeed, handleTelegramFeedRequest } from "./telegram-feed.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(rootDir, "out");
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "127.0.0.1";
const imentorBaseUrl = String(process.env.IMENTOR_API_BASE_URL || "https://imentor.devflix.uz/api").replace(/\/$/, "");
const imentorApiKey = String(process.env.IMENTOR_API_KEY || "").trim();
const fermiApiBaseUrl = String(process.env.FERMI_API_BASE_URL || "https://api.fermi.uz").replace(/\/$/, "");
const openAiApiKey = String(process.env.OPENAI_API_KEY || "").trim();
const openAiModel = String(process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
configureTelegramFeed({ apiKey: openAiApiKey, model: openAiModel });

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const responseCache = new Map();
const pendingRequests = new Map();
const aiRateLimits = new Map();

function applySecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function clientIp(request) {
  return String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function allowAiRequest(request) {
  const now = Date.now();
  const key = clientIp(request);
  const current = aiRateLimits.get(key);
  const windowMs = 60_000;
  const maximum = 20;
  const active = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };
  active.count += 1;
  aiRateLimits.set(key, active);
  return active.count <= maximum;
}

async function readRequestBody(request, maxBytes = 100_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("Request body is too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function safeUpstreamHeaders(headers) {
  const result = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!value || ["host", "connection", "content-length"].includes(key.toLowerCase())) continue;
    result[key] = Array.isArray(value) ? value.join(",") : value;
  }
  return result;
}

async function streamProxy(request, response, baseUrl) {
  const requestUrl = new URL(request.url || "/", "http://localhost");
  const target = new URL(`${requestUrl.pathname}${requestUrl.search}`, baseUrl);
  const hasBody = !["GET", "HEAD"].includes(request.method || "GET");
  const upstream = await fetch(target, {
    method: request.method,
    headers: safeUpstreamHeaders(request.headers),
    body: hasBody ? Readable.toWeb(request) : undefined,
    duplex: hasBody ? "half" : undefined,
  });

  response.statusCode = upstream.status;
  const contentType = upstream.headers.get("content-type");
  const cacheControl = upstream.headers.get("cache-control");
  if (contentType) response.setHeader("Content-Type", contentType);
  if (cacheControl) response.setHeader("Cache-Control", cacheControl);
  if (!upstream.body) return response.end();
  Readable.fromWeb(upstream.body).pipe(response);
}

async function cachedGet(url, headers, ttlMs) {
  const cacheKey = url.toString();
  const cached = responseCache.get(cacheKey);
  if (cached?.expiresAt > Date.now()) return cached;
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const pending = fetch(url, { headers })
    .then(async (upstream) => {
      const result = {
        statusCode: upstream.status,
        contentType: upstream.headers.get("content-type") || "application/json; charset=utf-8",
        body: await upstream.arrayBuffer(),
        expiresAt: Date.now() + ttlMs,
      };
      if (upstream.ok) responseCache.set(cacheKey, result);
      return result;
    })
    .finally(() => pendingRequests.delete(cacheKey));

  pendingRequests.set(cacheKey, pending);
  return pending;
}

async function handleImentor(request, response) {
  if (request.method !== "GET") return sendJson(response, 405, { error: "Method not allowed" });
  if (!imentorApiKey) return sendJson(response, 503, { error: "iMentor API is not configured" });

  const requestUrl = new URL(request.url || "/", "http://localhost");
  if (!requestUrl.pathname.startsWith("/imentor-api/v1/external/")) return sendJson(response, 404, { error: "Not found" });
  const upstreamPath = requestUrl.pathname.replace(/^\/imentor-api/, "");
  const target = new URL(`${upstreamPath}${requestUrl.search}`, imentorBaseUrl);
  const isStats = /\/v1\/external\/(tests|keys)\/stats\/$/.test(upstreamPath);
  const result = isStats
    ? await cachedGet(target, { "X-Api-Key": imentorApiKey }, 60_000)
    : await cachedGet(target, { "X-Api-Key": imentorApiKey }, 0);

  response.statusCode = result.statusCode;
  response.setHeader("Content-Type", result.contentType);
  response.setHeader("Cache-Control", isStats ? "private, max-age=30" : "no-store");
  response.end(Buffer.from(result.body));
}

async function handleOpenAi(request, response) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });
  if (!openAiApiKey) return sendJson(response, 503, { error: "OpenAI is not configured" });
  if (!allowAiRequest(request)) return sendJson(response, 429, { error: "Too many requests. Please try again shortly." });

  const rawBody = await readRequestBody(request);
  const incoming = JSON.parse(rawBody.toString("utf8"));
  const messages = Array.isArray(incoming.messages) ? incoming.messages.slice(-16) : [];
  if (!messages.length || messages.some((message) => !["system", "user", "assistant"].includes(message?.role) || typeof message?.content !== "string")) {
    return sendJson(response, 400, { error: "Invalid chat request" });
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openAiApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: openAiModel,
      messages: messages.map((message) => ({ role: message.role, content: message.content.slice(0, 5000) })),
      temperature: typeof incoming.temperature === "number" ? Math.min(Math.max(incoming.temperature, 0), 1) : 0.3,
      response_format: incoming.response_format?.type === "json_object" ? { type: "json_object" } : undefined,
      max_tokens: 900,
    }),
  });

  response.statusCode = upstream.status;
  response.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
  response.end(await upstream.text());
}

async function serveStatic(request, response) {
  const requestUrl = new URL(request.url || "/", "http://localhost");
  const requestedPath = decodeURIComponent(requestUrl.pathname);
  const candidate = resolve(distDir, `.${requestedPath === "/" ? "/index.html" : requestedPath}`);
  const allowedPath = candidate === distDir || candidate.startsWith(`${distDir}/`);
  const fallback = resolve(distDir, "index.html");
  const candidateExists = allowedPath && existsSync(candidate) && (await stat(candidate)).isFile();
  const acceptsHtml = String(request.headers.accept || "").includes("text/html");
  const filePath = candidateExists ? candidate : acceptsHtml ? fallback : null;

  if (!existsSync(fallback)) return sendJson(response, 503, { error: "Build output not found. Run npm run build first." });
  if (!filePath) return sendJson(response, 404, { error: "Not found" });
  const extension = extname(filePath).toLowerCase();
  response.statusCode = 200;
  response.setHeader("Content-Type", mimeTypes[extension] || "application/octet-stream");
  response.setHeader("Cache-Control", filePath.includes(`${distDir}/assets/`) ? "public, max-age=31536000, immutable" : "no-cache");
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  applySecurityHeaders(response);
  try {
    const pathname = new URL(request.url || "/", "http://localhost").pathname;
    if (pathname.startsWith("/imentor-api/")) return await handleImentor(request, response);
    if (pathname.startsWith("/openai-api/")) return await handleOpenAi(request, response);
    if (pathname.startsWith("/telegram-feed")) {
      const handled = await handleTelegramFeedRequest(request, response);
      if (handled) return;
    }
    if (pathname.startsWith("/v1/") || pathname.startsWith("/uploads/")) return await streamProxy(request, response, fermiApiBaseUrl);
    return await serveStatic(request, response);
  } catch (error) {
    console.error("Request failed", error);
    if (!response.headersSent) sendJson(response, 502, { error: "Upstream service is temporarily unavailable" });
    else response.end();
  }
});

server.listen(port, host, () => {
  console.log(`FerMI production server is listening on http://${host}:${port}`);
});
