import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_CHANNEL = "ferghana_medical_institute";
const CACHE_TTL_MS = 60_000;
const TELEGRAM_ID_OFFSET = 1_000_000;
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional local env files */
  }
}

loadEnvFile(resolve(rootDir, ".env.production"));
loadEnvFile(resolve(rootDir, ".env"));

let cache = { expiresAt: 0, posts: null, error: null };
let openAiApiKey = "";
let openAiModel = "gpt-4o-mini";
let openAiDisabled = false;
const translationCache = new Map();
const translationCacheFile = resolve(rootDir, ".tmp/telegram-translations-v3.json");

function loadTranslationCache() {
  try {
    const parsed = JSON.parse(readFileSync(translationCacheFile, "utf8"));
    if (parsed && typeof parsed === "object") {
      for (const [key, value] of Object.entries(parsed)) translationCache.set(key, value);
    }
  } catch {
    /* first run */
  }
}

function saveTranslationCache() {
  try {
    mkdirSync(dirname(translationCacheFile), { recursive: true });
    writeFileSync(translationCacheFile, JSON.stringify(Object.fromEntries(translationCache)));
  } catch (error) {
    console.error("Telegram translation cache save failed", error);
  }
}

loadTranslationCache();

function decodeSecret(raw, encoded) {
  const direct = String(raw || "").trim();
  if (direct) return direct;
  const b64 = String(encoded || "").trim();
  if (!b64) return "";
  try {
    return Buffer.from(b64, "base64").toString("utf8").trim();
  } catch {
    return "";
  }
}

export function configureTelegramFeed({ apiKey, model } = {}) {
  if (apiKey) openAiApiKey = String(apiKey).trim();
  if (model) openAiModel = String(model).trim() || openAiModel;
}

function ensureOpenAiKey() {
  if (openAiApiKey) return openAiApiKey;
  openAiApiKey = decodeSecret(
    process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
    process.env.OPENAI_API_KEY_B64 || process.env.VITE_OPENAI_API_KEY_B64,
  );
  openAiModel = String(process.env.OPENAI_MODEL || process.env.VITE_OPENAI_MODEL || openAiModel).trim();
  return openAiApiKey;
}

function normalizeLang(lang) {
  const code = String(lang || "uz").slice(0, 2).toLowerCase();
  return code === "ru" || code === "en" ? code : "uz";
}

function channelUsername() {
  return String(process.env.TELEGRAM_CHANNEL_USERNAME || DEFAULT_CHANNEL)
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/t\.me\//, "")
    .split("/")[0] || DEFAULT_CHANNEL;
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function htmlToText(html) {
  return decodeEntities(String(html || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapEmoji(html) {
  return String(html || "")
    .replace(/<tg-emoji[^>]*>[\s\S]*?<b>([^<]*)<\/b>[\s\S]*?<\/tg-emoji>/gi, "$1")
    .replace(/<i class="emoji"[^>]*>[\s\S]*?<b>([^<]*)<\/b>[\s\S]*?<\/i>/gi, "$1");
}

function sanitizePostHtml(html) {
  let value = unwrapEmoji(html);
  value = value.replace(/<script[\s\S]*?<\/script>/gi, "");
  value = value.replace(/on\w+="[^"]*"/gi, "");
  value = value.replace(/<\/?(?:div|span|tg-emoji)[^>]*>/gi, "");
  value = value.replace(/<a\s+[^>]*href="(\?[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "$2");
  value = value.replace(/<br\s*\/?>/gi, "<br/>");
  return value.trim();
}

function extractMedia(block) {
  const urls = [];
  for (const match of String(block).matchAll(/background-image:url\('([^']+)'\)/g)) {
    let url = match[1];
    if (url.startsWith("//")) url = `https:${url}`;
    if (/telegram\.org\/img\/emoji/i.test(url)) continue;
    if (!/telesco\.pe|cdn\.telegram/i.test(url)) continue;
    urls.push(url);
  }
  return [...new Set(urls)];
}

function titleFromHtml(html) {
  const bold = [...String(html).matchAll(/<b>([\s\S]*?)<\/b>/gi)]
    .map((match) => htmlToText(unwrapEmoji(match[1])))
    .find((text) => text && !text.startsWith("#") && text.length > 8);
  if (bold) return bold.slice(0, 160);

  const lines = htmlToText(unwrapEmoji(html))
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !/^#\S+$/.test(line) && !/^©/.test(line));
  const first = lines[0] || htmlToText(html);
  return (first || "Yangilik").slice(0, 160);
}

function splitMessageBlocks(html) {
  return String(html)
    .split(/(?=<div class="tgme_widget_message[^"]*\bjs-widget_message\b)/)
    .filter((block) => /data-post="/.test(block));
}

export function parseTelegramChannelHtml(html, username = channelUsername()) {
  const posts = [];
  for (const block of splitMessageBlocks(html)) {
    const postRef = block.match(/data-post="([^"]+)"/)?.[1];
    if (!postRef) continue;
    const messageId = Number(postRef.split("/")[1]);
    if (!Number.isFinite(messageId)) continue;

    const textHtml = block.match(
      /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    )?.[1];
    if (!textHtml) continue;

    const datetime = block.match(/<time[^>]*datetime="([^"]+)"/)?.[1];
    const media = extractMedia(block);
    const content = sanitizePostHtml(textHtml);
    const extraImages = media
      .slice(1)
      .map((src) => `<p><img src="${src}" alt="" /></p>`)
      .join("");

    posts.push({
      id: TELEGRAM_ID_OFFSET + messageId,
      title: titleFromHtml(textHtml),
      content: extraImages ? `${content}${extraImages}` : content,
      img: media[0] || "",
      slug: `tg-${messageId}`,
      date: datetime || new Date().toISOString(),
      seen: 0,
      category: { id: 0, title: "Telegram", slug: "telegram" },
      telegramUrl: `https://t.me/${username}/${messageId}`,
    });
  }
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
}

async function fetchChannelHtml(username) {
  const response = await fetch(`https://t.me/s/${username}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FerMI-web/1.0)",
      Accept: "text/html",
    },
  });
  if (!response.ok) throw new Error(`Telegram channel fetch failed (${response.status})`);
  return response.text();
}

export async function getTelegramFeed() {
  if (cache.posts && cache.expiresAt > Date.now()) return cache.posts;
  const username = channelUsername();
  try {
    const html = await fetchChannelHtml(username);
    const posts = parseTelegramChannelHtml(html, username);
    cache = { expiresAt: Date.now() + CACHE_TTL_MS, posts, error: null };
    return posts;
  } catch (error) {
    if (cache.posts) return cache.posts;
    cache = { expiresAt: Date.now() + 15_000, posts: [], error };
    throw error;
  }
}

function splitMedia(content) {
  const images = [];
  const html = String(content || "").replace(/<p><img\b[^>]*>\s*<\/p>/gi, (match) => {
    images.push(match);
    return "";
  });
  return { html: html.trim(), images };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSkipTranslation(text) {
  const source = String(text || "").trim();
  if (!source) return true;
  if (source.length < 3) return true;
  if (/^[#@]/.test(source)) return true;
  if (/^https?:\/\//i.test(source)) return true;
  if (/^[\d\s.,:;!?%+\-–—/()]+$/.test(source)) return true;
  return false;
}

async function translateWithMyMemory(text, lang) {
  const source = String(text || "").trim();
  if (!source) return "";
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", source.slice(0, 450));
  url.searchParams.set("langpair", `uz|${lang}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FerMI-web/1.0)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return "";
  const payload = await response.json();
  const translated = String(payload?.responseData?.translatedText || "").trim();
  if (!translated || /MYMEMORY WARNING/i.test(translated)) return "";
  return decodeEntities(translated);
}

async function translateWithGoogle(text, lang) {
  const source = String(text || "").trim();
  if (!source) return "";
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "uz");
  url.searchParams.set("tl", lang);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", source.slice(0, 4500));
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FerMI-web/1.0)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return "";
    const payload = await response.json();
    return decodeEntities((payload?.[0] || []).map((row) => row?.[0] || "").join("").trim());
  } catch {
    return "";
  }
}

async function translateText(text, lang) {
  const source = String(text || "").trim();
  if (!source || shouldSkipTranslation(source)) return source;
  if (source.length > 450) {
    const parts = [];
    for (let index = 0; index < source.length; index += 420) {
      parts.push(await translateText(source.slice(index, index + 420), lang));
    }
    return parts.join("") || source;
  }
  const memory = await translateWithMyMemory(source, lang);
  if (memory && memory !== source) return memory;
  const google = await translateWithGoogle(source, lang);
  if (google && google !== source) return google;
  return source;
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function translateHtml(html, lang) {
  const tokens = String(html || "").split(/(<[^>]+>)/);
  const indexes = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token || (token.startsWith("<") && token.endsWith(">"))) continue;
    if (shouldSkipTranslation(decodeEntities(token))) continue;
    indexes.push(index);
  }
  await mapPool(indexes, 4, async (index) => {
    const decoded = decodeEntities(tokens[index]);
    const lead = decoded.match(/^\s*/)?.[0] || "";
    const trail = decoded.match(/\s*$/)?.[0] || "";
    const next = await translateText(decoded.trim(), lang);
    tokens[index] = `${lead}${next || decoded.trim()}${trail}`;
  });
  return tokens.join("");
}

const LANG_NAMES = { ru: "Russian", en: "English" };

function translatorSystemPrompt(lang) {
  const institute =
    lang === "ru"
      ? "Ферганский медицинский институт общественного здоровья"
      : "Fergana Medical Institute of Public Health";
  return (
    `You are a professional news translator for ${institute} (FerMI / FJSTI). ` +
    `Translate from Uzbek into ${LANG_NAMES[lang]}. ` +
    "Keep HTML tags, emoji, hashtags, @mentions and URLs. Translate visible text only. " +
    `Always use this institute name: ${institute}. ` +
    "Ostona/Ostonada = Astana; Qozog‘iston/Qozog'iston = Kazakhstan/Казахстан. " +
    "Use formal journalistic style. Do not add commentary or extra facts."
  );
}

async function requestOpenAiJson(messages, { maxTokens = 1800, timeoutMs = 18000 } = {}) {
  const key = ensureOpenAiKey();
  if (!key || openAiDisabled) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model: openAiModel,
        temperature: 0.15,
        response_format: { type: "json_object" },
        max_tokens: maxTokens,
        messages,
      }),
    });
    if (response.status === 401 || response.status === 403) {
      openAiDisabled = true;
      return null;
    }
    if (!response.ok) return null;
    const payload = await response.json();
    return JSON.parse(String(payload?.choices?.[0]?.message?.content || "").trim());
  } catch {
    return null;
  }
}

function cacheKeyFor(post, target, scope) {
  return `${post.slug}:${target}:${post.title}:${scope}`;
}

function normalizedText(value) {
  return htmlToText(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function bodyIsTranslated(originalHtml, translatedHtml) {
  const original = normalizedText(originalHtml);
  const next = normalizedText(translatedHtml);
  if (!next || next === original) return false;
  const words = original.split(" ").filter((word) => word.length > 4);
  if (!words.length) return true;
  const leftover = words.filter((word) => next.includes(word)).length;
  return leftover / words.length < 0.55;
}

function isUsableHit(hit, originalHtml, full) {
  if (!hit) return false;
  if (!full) return Boolean(hit.title);
  if (hit.complete === false) return false;
  return Boolean(hit.html) && bodyIsTranslated(originalHtml, hit.html);
}

let translationFill = null;

function applyCachedTranslations(posts, target, scope, full) {
  return posts.map((post) => {
    const { html, images } = splitMedia(post.content);
    const hit = translationCache.get(cacheKeyFor(post, target, scope));
    const cardHit = full ? translationCache.get(cacheKeyFor(post, target, "card")) : null;
    const title = hit?.title || cardHit?.title || post.title;
    if (!full) {
      if (!hit) return post;
      return { ...post, title: hit.title, content: hit.html };
    }
    if (isUsableHit(hit, html, true)) {
      return { ...post, title, content: `${hit.html}${images.join("")}` };
    }
    if (title !== post.title) return { ...post, title };
    return post;
  });
}

function storeTranslation(row, title, html, { complete = true } = {}) {
  translationCache.set(row.cacheKey, {
    title: title || row.post.title,
    html,
    scope: row.scope,
    complete,
  });
}

async function translateCardsWithOpenAi(rows, target) {
  const parsed = await requestOpenAiJson(
    [
      {
        role: "system",
        content: `${translatorSystemPrompt(target)} Return JSON: {"items":[{"slug":"","title":"","html":""}]}.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          items: rows.map((row) => ({
            slug: row.post.slug,
            title: row.post.title,
            html: htmlToText(row.html).slice(0, 320),
          })),
        }),
      },
    ],
    { maxTokens: 2500, timeoutMs: 16000 },
  );
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  if (!items.length) return false;
  let wrote = false;
  for (const item of items) {
    const row = rows.find((entry) => entry.post.slug === item.slug);
    if (!row || !item?.title) continue;
    const title = decodeEntities(String(item.title).trim());
    if (title === row.post.title) continue;
    const excerpt = decodeEntities(String(item.html || "").trim());
    storeTranslation(row, title, `<p>${excerpt || htmlToText(row.html).slice(0, 320)}</p>`);
    wrote = true;
  }
  if (wrote) saveTranslationCache();
  return wrote;
}

async function translateFullWithOpenAi(row, target) {
  const parsed = await requestOpenAiJson(
    [
      {
        role: "system",
        content: `${translatorSystemPrompt(target)} Return JSON: {"title":"","html":""}.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          title: row.post.title,
          html: row.html.slice(0, 4000),
        }),
      },
    ],
    { maxTokens: 2200, timeoutMs: 20000 },
  );
  const title = decodeEntities(String(parsed?.title || "").trim());
  const html = String(parsed?.html || "").trim();
  if (!title || title === row.post.title || !html) return false;
  if (!bodyIsTranslated(row.html, html)) return false;
  storeTranslation(row, title, html, { complete: true });
  saveTranslationCache();
  return true;
}

async function fillOneTranslation(row, target) {
  const title = await translateText(row.post.title, target);
  const titleOk = Boolean(title && title !== row.post.title);
  if (row.scope !== "full") {
    const excerpt = htmlToText(row.html).slice(0, 320);
    const translatedExcerpt = await translateText(excerpt, target);
    const htmlOk = Boolean(translatedExcerpt && translatedExcerpt !== excerpt);
    if (!titleOk && !htmlOk) return false;
    storeTranslation(
      row,
      titleOk ? title : row.post.title,
      `<p>${htmlOk ? translatedExcerpt : excerpt}</p>`,
    );
    saveTranslationCache();
    return true;
  }

  if (titleOk) {
    storeTranslation(row, title, row.html, { complete: false });
    saveTranslationCache();
  }
  const translatedHtml = await translateHtml(row.html, target);
  const htmlOk = htmlToText(translatedHtml) !== htmlToText(row.html);
  if (htmlOk || titleOk) {
    storeTranslation(row, titleOk ? title : row.post.title, htmlOk ? translatedHtml : row.html, {
      complete: htmlOk,
    });
    saveTranslationCache();
    return true;
  }
  return translateFullWithOpenAi(row, target);
}

async function fillMissingTranslations(missing, target) {
  for (const row of missing) {
    const hit = translationCache.get(row.cacheKey);
    if (isUsableHit(hit, row.html, row.scope === "full")) continue;
    try {
      await fillOneTranslation(row, target);
    } catch (error) {
      console.error("Telegram translation failed", error);
    }
  }
}

function scheduleTranslationFill(missing, target) {
  if (!missing.length || translationFill) return;
  translationFill = fillMissingTranslations(missing, target).finally(() => {
    translationFill = null;
  });
}

async function localizePosts(posts, lang, { full = true, wait = false } = {}) {
  const target = normalizeLang(lang);
  if (target === "uz" || !posts.length) return posts;
  const scope = full ? "full" : "card";

  const missing = [];
  for (const post of posts) {
    const { html } = splitMedia(post.content);
    const cacheKey = cacheKeyFor(post, target, scope);
    const hit = translationCache.get(cacheKey);
    if (!isUsableHit(hit, html, full)) missing.push({ post, html, cacheKey, scope });
  }

  if (missing.length && wait) {
    await Promise.race([
      fillMissingTranslations(missing.slice(0, full ? 1 : 8), target),
      sleep(full ? 20000 : 6000),
    ]);
    scheduleTranslationFill(
      missing.filter((row) => {
        const hit = translationCache.get(row.cacheKey);
        return !isUsableHit(hit, row.html, full);
      }),
      target,
    );
  } else {
    scheduleTranslationFill(missing, target);
  }

  return applyCachedTranslations(posts, target, scope, full);
}

export async function getTelegramPost(slugOrId, lang = "uz") {
  const posts = await getTelegramFeed();
  const key = String(slugOrId || "").replace(/^tg-/, "");
  const post = posts.find((item) => item.slug === `tg-${key}` || String(item.id) === key) || null;
  if (!post) return null;
  const [localized] = await localizePosts([post], lang, { full: true, wait: true });
  return localized;
}

export async function handleTelegramFeedRequest(request, response) {
  const requestUrl = new URL(request.url || "/", "http://localhost");
  const pathname = requestUrl.pathname;
  const lang = normalizeLang(requestUrl.searchParams.get("lang"));
  const match = pathname.match(/^\/telegram-feed\/?([^/?#]+)?\/?$/);
  if (!match) return false;
  if (request.method !== "GET") {
    response.statusCode = 405;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ success: false, error: { message: "Method not allowed" } }));
    return true;
  }

  try {
    if (pathname === "/telegram-feed/translate" || pathname === "/telegram-feed/translate/") {
      const text = String(requestUrl.searchParams.get("q") || "");
      const translated = await translateText(text, lang);
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader("Cache-Control", "no-store");
      response.end(JSON.stringify({ success: true, data: translated }));
      return true;
    }

    const slug = match[1];
    if (slug) {
      const post = await getTelegramPost(slug, lang);
      if (!post) {
        response.statusCode = 404;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify({ success: false, error: { message: "Post topilmadi" } }));
        return true;
      }
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader("Cache-Control", lang === "uz" ? "public, max-age=30" : "no-store");
      response.end(JSON.stringify({ success: true, data: post }));
      return true;
    }

    const feed = await getTelegramFeed();
    const posts = await localizePosts(feed, lang, { full: false, wait: false });
    const originals = new Map(feed.map((post) => [post.slug, post.title]));
    const marked = posts.map((post) => ({
      ...post,
      translated: lang === "uz" || post.title !== originals.get(post.slug),
    }));
    const pending = lang !== "uz" && marked.some((post) => !post.translated);
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader(
      "Cache-Control",
      pending ? "no-store" : lang === "uz" ? "public, max-age=30" : "private, max-age=60",
    );
    response.end(JSON.stringify({ success: true, data: marked }));
  } catch (error) {
    response.statusCode = 502;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ success: false, error: { message: error?.message || "Telegram oqimi olinmadi" } }));
  }
  return true;
}
