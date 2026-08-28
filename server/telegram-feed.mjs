import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_CHANNEL = "ferghana_medical_institute";
const CACHE_TTL_MS = 60_000;
const TELEGRAM_ID_OFFSET = 1_000_000;
const LANG_NAMES = { ru: "Russian", en: "English" };

let cache = { expiresAt: 0, posts: null, error: null };
let openAiApiKey = "";
let openAiModel = "gpt-4o-mini";
let openAiDisabled = false;
const translationCache = new Map();
const translationCacheFile = resolve(dirname(fileURLToPath(import.meta.url)), "../.tmp/telegram-translations.json");

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

async function translateWithGoogle(text, lang) {
  const source = String(text || "").trim();
  if (!source) return source;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "uz");
  url.searchParams.set("tl", lang);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", source.slice(0, 4500));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; FerMI-web/1.0)" } });
      if (response.status === 429) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      if (!response.ok) return source;
      const payload = await response.json();
      return decodeEntities((payload?.[0] || []).map((row) => row?.[0] || "").join("").trim() || source);
    } catch {
      await sleep(400 * (attempt + 1));
    }
  }
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

async function requestTranslations(items, lang) {
  const key = ensureOpenAiKey();
  if (key && !openAiDisabled) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openAiModel,
        temperature: 0.2,
        response_format: { type: "json_object" },
        max_tokens: 5000,
        messages: [
          {
            role: "system",
            content:
              `Translate official Fergana Medical Institute of Public Health (FerMI / FJSTI) Telegram posts from Uzbek into ${LANG_NAMES[lang]}. ` +
              `Return JSON: {"items":[{"slug":"","title":"","html":""}]}. ` +
              "Keep HTML tags, emoji, hashtags, @mentions and URLs. Translate visible text only. " +
              "Institute name: English = Fergana Medical Institute of Public Health; Russian = Ферганский медицинский институт общественного здоровья. " +
              "Do not add commentary.",
          },
          { role: "user", content: JSON.stringify({ items }) },
        ],
      }),
    });

    if (response.status === 401 || response.status === 403) {
      openAiDisabled = true;
    } else if (response.ok) {
      const payload = await response.json();
      const raw = String(payload?.choices?.[0]?.message?.content || "").trim();
      const parsed = JSON.parse(raw);
      const translated = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
      if (translated.length) return translated;
    }
  }

  return mapPool(items, 2, async (item) => ({
    slug: item.slug,
    title: decodeEntities(await translateWithGoogle(item.title, lang)),
    html: await translateWithGoogle(item.html, lang),
  }));
}

let translationFill = null;

function applyCachedTranslations(posts, target, scope, full) {
  return posts.map((post) => {
    const { images } = splitMedia(post.content);
    const hit = translationCache.get(`${post.slug}:${target}:${post.title}:${scope}`);
    if (!hit) return post;
    return {
      ...post,
      title: hit.title,
      content: full ? `${hit.html}${images.join("")}` : hit.html,
    };
  });
}

async function fillMissingTranslations(missing, target) {
  const chunkSize = 4;
  let wrote = false;
  for (let index = 0; index < missing.length; index += chunkSize) {
    const chunk = missing.slice(index, index + chunkSize);
    try {
      const translated = await requestTranslations(
        chunk.map(({ post, html, scope: itemScope }) => ({
          slug: post.slug,
          title: post.title,
          html: itemScope === "full" ? html.slice(0, 2500) : htmlToText(html).slice(0, 320),
        })),
        target,
      );
      for (const item of translated) {
        const row = chunk.find((entry) => entry.post.slug === item.slug);
        if (!row || !item?.title) continue;
        const title = decodeEntities(String(item.title).trim());
        if (title === row.post.title) continue;
        const html = row.scope === "full" ? String(item.html || row.html) : `<p>${String(item.html || "")}</p>`;
        translationCache.set(row.cacheKey, { title, html });
        wrote = true;
      }
    } catch (error) {
      console.error("Telegram translation failed", error);
    }
  }
  if (wrote) saveTranslationCache();
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
    const cacheKey = `${post.slug}:${target}:${post.title}:${scope}`;
    if (!translationCache.has(cacheKey)) missing.push({ post, html, cacheKey, scope });
  }

  if (missing.length && wait) {
    await Promise.race([fillMissingTranslations(missing, target), sleep(6000)]);
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
      response.setHeader("Cache-Control", lang === "uz" ? "public, max-age=30" : "private, max-age=30");
      response.end(JSON.stringify({ success: true, data: post }));
      return true;
    }

    const posts = await localizePosts(await getTelegramFeed(), lang, { full: false });
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", lang === "uz" ? "public, max-age=30" : "private, max-age=30");
    response.end(JSON.stringify({ success: true, data: posts }));
  } catch (error) {
    response.statusCode = 502;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ success: false, error: { message: error?.message || "Telegram oqimi olinmadi" } }));
  }
  return true;
}
