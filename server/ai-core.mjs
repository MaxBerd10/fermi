import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB = JSON.parse(readFileSync(join(__dirname, "knowledge/fjsti-kb.json"), "utf8"));

const rateBucket = new Map();

function clientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export function rateLimit(req, limit = 40, windowMs = 60_000) {
  const ip = clientIp(req);
  const now = Date.now();
  const hit = rateBucket.get(ip) || { n: 0, t: now };
  if (now - hit.t > windowMs) {
    hit.n = 0;
    hit.t = now;
  }
  hit.n += 1;
  rateBucket.set(ip, hit);
  return hit.n <= limit;
}

function tokenize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/+.-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/** Simple keyword RAG over institute knowledge base */
export function retrieve(query, k = 5) {
  const qTokens = tokenize(query);
  if (!qTokens.length) return KB.slice(0, k);

  const scored = KB.map((doc) => {
    const hay = tokenize(`${doc.title} ${doc.text} ${(doc.tags || []).join(" ")}`);
    let score = 0;
    for (const t of qTokens) {
      if (hay.includes(t)) score += 2;
      else if (hay.some((h) => h.includes(t) || t.includes(h))) score += 1;
    }
    for (const tag of doc.tags || []) {
      if (qTokens.some((t) => tag.includes(t) || t.includes(tag))) score += 1.5;
    }
    return { doc, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = (scored.length ? scored : KB.map((doc) => ({ doc, score: 0 }))).slice(0, k);
  return top.map((x) => x.doc);
}

function contextBlock(docs) {
  return docs
    .map((d, i) => `[${i + 1}] ${d.title}\nURL: ${d.href}\n${d.text}`)
    .join("\n\n");
}

const SYSTEM_BASE = `Siz Farg'ona jamoat salomatligi tibbiyot instituti (FJSTI / FerMI) rasmiy saytining AI maslahatchisisiz.
Qoidalar:
- Faqat quyidagi KONTEKST va umumiy institut ma'lumotiga tayaning. Kontekstda bo'lmasa — aniq ayting va /aloqa yoki virtual qabulxonaga yo'naltiring.
- Tibbiy tashxis yoki davolash maslahati BERMANG.
- Javobni foydalanuvchi tilida yozing (uz/ru/en).
- Qisqa, aniq, amaliy bo'ling.
- Havolalarni FAQAT markdown formatida yozing: [Fakultetlar](/#faculties-news) yoki [Qabul](/qabul) yoki [HEMIS](http://hemis.fjsti.uz). Yalang'och path yozmang va "sahifaga o'ting" deb qoldirmang — har doim bosiladigan [matn](url) bering.
- HEMIS: http://hemis.fjsti.uz | Qabul: /qabul | my.edu.uz`;

async function openaiChat({ apiKey, model, messages, temperature = 0.3, json = false }) {
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY sozlanmagan");
    err.status = 503;
    throw err;
  }
  const body = {
    model: model || "gpt-4o-mini",
    messages,
    temperature,
  };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `OpenAI xato: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data.choices?.[0]?.message?.content?.trim() || "";
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 400_000) {
        reject(new Error("Body juda katta"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Noto'g'ri JSON"));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function createAiMiddleware({ apiKey, model }) {
  return async function aiMiddleware(req, res, next) {
    if (!req.url?.startsWith("/api/ai")) return next();

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== "POST") {
      send(res, 405, { error: "Method not allowed" });
      return;
    }

    if (!rateLimit(req)) {
      send(res, 429, { error: "Juda ko'p so'rov. Biroz kuting." });
      return;
    }

    const path = req.url.split("?")[0].replace(/\/$/, "");

    try {
      const body = await readJsonBody(req);
      const lang = ["uz", "ru", "en"].includes(body.lang) ? body.lang : "uz";

      if (path === "/api/ai/chat") {
        const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
        const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
        const docs = retrieve(lastUser, 5);
        const content = await openaiChat({
          apiKey,
          model,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_BASE}\nTil: ${lang}\n\nKONTEKST:\n${contextBlock(docs)}`,
            },
            ...messages.map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: String(m.content || "").slice(0, 4000),
            })),
          ],
        });
        send(res, 200, {
          reply: content,
          sources: docs.map((d) => ({ title: d.title, href: d.href })),
        });
        return;
      }

      if (path === "/api/ai/pathfinder") {
        const freeText = String(body.freeText || "");
        const interest = String(body.interest || "");
        const level = String(body.level || "");
        const query = `${freeText} ${interest} ${level}`;
        const docs = retrieve(query || "fakultet qabul pathfinder", 5);
        const content = await openaiChat({
          apiKey,
          model,
          json: true,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_BASE}
Til: ${lang}
Vazifa: PathFinder natijasini JSON qaytaring:
{"title":"...","summary":"...","faculty":"...","level":"...","steps":["...","...","..."],"links":[{"label":"...","href":"..."}]}
Faqat institut yo'nalishlari: Davolash, Pediatriya, Tibbiy profilaktika va jamoat salomatligi, Xalqaro.
KONTEKST:\n${contextBlock(docs)}`,
            },
            {
              role: "user",
              content: `Qiziqish matni: ${freeText || "(yo'q)"}\nTanlangan interest: ${interest || "-"}\nDaraja: ${level || "-"}`,
            },
          ],
        });
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = { title: "Tavsiya", summary: content, steps: [], links: [{ label: "Qabul", href: "/qabul" }] };
        }
        send(res, 200, { ...parsed, sources: docs.map((d) => ({ title: d.title, href: d.href })) });
        return;
      }

      if (path === "/api/ai/search") {
        const query = String(body.query || "").trim();
        if (!query) {
          send(res, 400, { error: "query kerak" });
          return;
        }
        const docs = retrieve(query, 6);
        const content = await openaiChat({
          apiKey,
          model,
          json: true,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_BASE}
Til: ${lang}
Vazifa: qidiruvni tushunib JSON qaytaring:
{"interpretation":"...","suggestions":[{"title":"...","href":"...","reason":"..."}]}
suggestions 3-6 ta, faqat kontekst URL lari.
KONTEKST:\n${contextBlock(docs)}`,
            },
            { role: "user", content: query },
          ],
        });
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = {
            interpretation: content,
            suggestions: docs.map((d) => ({ title: d.title, href: d.href, reason: d.text.slice(0, 120) })),
          };
        }
        send(res, 200, parsed);
        return;
      }

      if (path === "/api/ai/qabul") {
        const question = String(body.question || "").trim();
        const docs = retrieve(`${question} qabul bakalavriat ordinatura`, 5);
        const content = await openaiChat({
          apiKey,
          model,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_BASE}
Til: ${lang}
Siz qabul bo'yicha yordamchisiz. my.edu.uz ga yo'naltiring. Hujjatlar va bosqichlarni qisqa ayting.
KONTEKST:\n${contextBlock(docs)}`,
            },
            { role: "user", content: question || "Qabul haqida qisqa ma'lumot bering" },
          ],
        });
        send(res, 200, {
          reply: content,
          links: [
            { label: "Qabul sahifasi", href: "/qabul" },
            { label: "my.edu.uz", href: "https://my.edu.uz" },
            { label: "Virtual qabulxona", href: "/virtual-reception/17" },
          ],
          sources: docs.map((d) => ({ title: d.title, href: d.href })),
        });
        return;
      }

      if (path === "/api/ai/faculty") {
        const text = String(body.text || "").trim();
        const docs = retrieve(`${text} fakultet pediatriya davolash`, 5);
        const content = await openaiChat({
          apiKey,
          model,
          json: true,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_BASE}
Til: ${lang}
JSON: {"faculty":"...","why":"...","alternatives":["..."],"next":["..."],"href":"/#faculties-news"}
KONTEKST:\n${contextBlock(docs)}`,
            },
            { role: "user", content: text || "Menga mos fakultetni tavsiya qiling" },
          ],
        });
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = { faculty: "Maslahat", why: content, alternatives: [], next: [], href: "/#faculties-news" };
        }
        send(res, 200, parsed);
        return;
      }

      if (path === "/api/ai/reception") {
        const text = String(body.text || "").trim();
        if (!text) {
          send(res, 400, { error: "text kerak" });
          return;
        }
        const content = await openaiChat({
          apiKey,
          model,
          json: true,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_BASE}
Til: ${lang}
Virtual qabulxona yordamchisi. JSON qaytaring:
{"polished":"tuzatilgan rasmiy matn","subject":"qisqa mavzu","summary":"1-2 gaplik xulosa (admin uchun)","category":"qabul|talim|kadr|boshqa"}
Tibbiy tashxis yozmang. Matnni o'zbek/rus/ingliz rasmiy uslubida tuzating.`,
            },
            { role: "user", content: text.slice(0, 6000) },
          ],
        });
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = { polished: text, subject: "Murojaat", summary: content, category: "boshqa" };
        }
        send(res, 200, parsed);
        return;
      }

      if (path === "/api/ai/summarize") {
        const title = String(body.title || "");
        const htmlOrText = String(body.content || "").replace(/<[^>]+>/g, " ").slice(0, 12000);
        if (!htmlOrText.trim()) {
          send(res, 400, { error: "content kerak" });
          return;
        }
        const content = await openaiChat({
          apiKey,
          model,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_BASE}
Til: ${lang}
Vazifa: yangilik/blog uchun 3–5 gaplik xulosa. Faqat berilgan matnga tayaning. Sarlavha qo'shmang, faqat xulosa.`,
            },
            { role: "user", content: `Sarlavha: ${title}\n\nMatn:\n${htmlOrText}` },
          ],
        });
        send(res, 200, { summary: content });
        return;
      }

      send(res, 404, { error: "Unknown AI endpoint" });
    } catch (e) {
      send(res, e.status || 500, { error: e.message || "AI xatosi" });
    }
  };
}
