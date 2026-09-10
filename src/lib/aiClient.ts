import KB from "@/data/fjsti-kb.json";

export type AiSource = { title: string; href: string };
export type AiLink = { label?: string; title?: string; href: string; reason?: string };

type KbDoc = { id: string; title: string; href: string; tags?: string[]; text: string };

const SYSTEM_BASE = `Siz Farg'ona jamoat salomatligi tibbiyot instituti (FerMI) rasmiy saytining FerMI Ai maslahatchisisiz.
Qoidalar:
- Faqat quyidagi KONTEKST va umumiy institut ma'lumotiga tayaning. Kontekstda bo'lmasa — aniq ayting va /aloqa yoki virtual qabulxonaga yo'naltiring.
- Tibbiy tashxis yoki davolash maslahati BERMANG.
- Javobni foydalanuvchi tilida yozing (uz/ru/en).
- Qisqa, aniq, amaliy bo'ling.
- Havolalarni FAQAT markdown formatida yozing: [Fakultetlar](/#faculties-news) yoki [Qabul](/qabul) yoki [HEMIS](http://hemis.fjsti.uz). Yalang'och path yozmang va "sahifaga o'ting" deb qoldirmang — har doim bosiladigan [matn](url) bering.
- HEMIS: http://hemis.fjsti.uz | Qabul: /qabul | my.edu.uz`;

function tokenize(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/+.-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function retrieve(query: string, k = 5): KbDoc[] {
  const docs = KB as KbDoc[];
  const qTokens = tokenize(query);
  if (!qTokens.length) return docs.slice(0, k);

  const scored = docs
    .map((doc) => {
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

  const top = (scored.length ? scored : docs.map((doc) => ({ doc, score: 0 }))).slice(0, k);
  return top.map((x) => x.doc);
}

function contextBlock(docs: KbDoc[]) {
  return docs.map((d, i) => `[${i + 1}] ${d.title}\nURL: ${d.href}\n${d.text}`).join("\n\n");
}

// --- Fast path -------------------------------------------------------------
// The highest-volume chat questions (contact details, HEMIS, the faculty list,
// admission steps) have fixed factual answers. Routing them through the model
// wastes an OpenAI call on every ask, adds a round-trip of latency, and risks
// the model misquoting a phone number. Answer those from the KB directly and
// only fall through to OpenAI for anything that actually needs reasoning.

type FastLang = "uz" | "ru" | "en";

const FAST_INTENTS: {
  id: string;
  match: RegExp;
  sourceIds: string[];
  reply: Record<FastLang, string>;
}[] = [
  {
    id: "contact",
    match: /(telefon|phone|номер|телефон|manzil|adres|address|адрес|e-?mail|pochta|почт|ish vaqt|ish soat|график работ|часы работ|working hours|opening hours|qayerda joylash|qayerda joyylash|где наход|manzili qayerda|bogʻlan|bog'lan|связаться|contact)/i,
    sourceIds: ["contact"],
    reply: {
      uz: "📍 Manzil: Fargʻona sh., Yangi Turon, 2-a uy\n📞 Telefon: +998 95 062-23-45, +998 95 063-23-45\n✉️ Email: info@fjsti.uz, fmioz@mail.ru\n🕘 Ish vaqti: Dushanba–Shanba, 09:00–17:00\n\n[Aloqa sahifasi](/aloqa) · [Virtual qabulxona](/virtual-reception/17)",
      ru: "📍 Адрес: г. Фергана, Янги Турон, дом 2-а\n📞 Телефон: +998 95 062-23-45, +998 95 063-23-45\n✉️ Email: info@fjsti.uz, fmioz@mail.ru\n🕘 Часы работы: понедельник–суббота, 09:00–17:00\n\n[Контакты](/aloqa) · [Виртуальная приёмная](/virtual-reception/17)",
      en: "📍 Address: Fergana, Yangi Turon 2-a\n📞 Phone: +998 95 062-23-45, +998 95 063-23-45\n✉️ Email: info@fjsti.uz, fmioz@mail.ru\n🕘 Hours: Monday–Saturday, 09:00–17:00\n\n[Contact page](/aloqa) · [Virtual reception](/virtual-reception/17)",
    },
  },
  {
    id: "hemis",
    match: /\bhemis\b|хемис|хэмис/i,
    sourceIds: ["hemis"],
    reply: {
      uz: "HEMIS — taʻlimni boshqarish tizimi: baholar, dars jadvali, kreditlar, oʻquv materiallari va talaba shaxsiy kabineti.\n\n🔗 [hemis.fjsti.uz](http://hemis.fjsti.uz)\n\nKirish uchun institut login/paroli kerak.",
      ru: "HEMIS — система управления обучением: оценки, расписание, кредиты, учебные материалы и личный кабинет студента.\n\n🔗 [hemis.fjsti.uz](http://hemis.fjsti.uz)\n\nДля входа нужны институтские логин и пароль.",
      en: "HEMIS is the learning-management system: grades, schedule, credits, study materials, and the student's personal cabinet.\n\n🔗 [hemis.fjsti.uz](http://hemis.fjsti.uz)\n\nYou sign in with your institute login and password.",
    },
  },
  {
    id: "faculties",
    match: /(fakultet|факультет|faculty|faculties)/i,
    sourceIds: ["faculties"],
    reply: {
      uz: "FerMI'da 4 ta asosiy fakultet:\n\n1. **Davolash ishi** — umumiy tibbiyot va klinik yoʻnalish\n2. **Tibbiy profilaktika va jamoat salomatligi** — epidemiologiya, profilaktika, aholi sogʻligʻi\n3. **Xalqaro fakultet** — xorijiy talabalar va xalqaro dasturlar\n4. **Pediatriya fakulteti** — bolalar salomatligi\n\n[Fakultetlar](/#faculties-news)",
      ru: "В FerMI 4 основных факультета:\n\n1. **Лечебное дело** — общая медицина и клиническое направление\n2. **Медицинская профилактика и общественное здоровье** — эпидемиология, профилактика\n3. **Международный факультет** — иностранные студенты и международные программы\n4. **Педиатрический факультет** — здоровье детей\n\n[Факультеты](/#faculties-news)",
      en: "FerMI has 4 main faculties:\n\n1. **General Medicine** — general and clinical medicine\n2. **Medical Prevention & Public Health** — epidemiology, prevention, population health\n3. **International Faculty** — international students and programmes\n4. **Pediatrics Faculty** — child health\n\n[Faculties](/#faculties-news)",
    },
  },
  {
    id: "qabul",
    match: /(qabul|abituriyent|admission|поступл|приём|прием|документы для|какие документ|kirish uchun.*hujjat|qanday hujjat|hujjatlar roʻyxat|hujjatlar ro'yxat|qaysi hujjat|topshirish uchun.*hujjat)/i,
    sourceIds: ["qabul-general"],
    reply: {
      uz: "Qabul bosqichlari:\n\n1. Onlayn roʻyxatdan oʻtish — [my.edu.uz](https://my.edu.uz)\n2. Hujjatlar: pasport, diplom, foto, tibbiy maʻlumotnoma\n3. Test sinovlari\n4. Natija va institutda roʻyxatdan oʻtish\n\n[Qabul sahifasi](/qabul) · Call-markaz: +998 95 062-23-45",
      ru: "Этапы поступления:\n\n1. Онлайн-регистрация — [my.edu.uz](https://my.edu.uz)\n2. Документы: паспорт, диплом, фото, медсправка\n3. Вступительные тесты\n4. Результат и регистрация в институте\n\n[Страница приёма](/qabul) · Колл-центр: +998 95 062-23-45",
      en: "Admission steps:\n\n1. Online registration — [my.edu.uz](https://my.edu.uz)\n2. Documents: passport, diploma, photo, medical certificate\n3. Entrance tests\n4. Result and on-site registration\n\n[Admission page](/qabul) · Call center: +998 95 062-23-45",
    },
  },
];

// Every quick-reply chip label, in all three languages, mapped to its intent.
// The chips send their own translated text as the "question", so matching the
// exact label is the most reliable route — the keyword regexes above are the
// looser fallback for free-typed questions.
const CHIP_LABELS: Record<string, string> = {
  // qabul
  "qabul hujjatlari": "qabul",
  "документы для приёма": "qabul",
  "документы для приема": "qabul",
  "admission documents": "qabul",
  // faculties
  fakultetlar: "faculties",
  факультеты: "faculties",
  faculties: "faculties",
  // hemis
  hemis: "hemis",
  // contact
  "manzil va telefon": "contact",
  "адрес и телефон": "contact",
  "address & phone": "contact",
};

// Even when a keyword matches, questions that ask for a judgement ("which faculty
// suits me", "what's the difference", "which is better") must still go to the model.
const NEEDS_MODEL = /(qaysi.*(mos|tanla|yaxshiroq|afzal)|menga mos|menga qaysi|tavsiya|maslahat|farqi nima|farqi qanday|solishtir|qaysi biri (yaxshi|afzal|mos)|which .*(suits|should i|is better)|recommend|compare|difference between|как выбрать|что лучше|посовету|порекоменду|сравни|в ч[её]м разниц|разница между|какой факультет мне)/i;

function tryFastPath(query: string, lang: string): { reply: string; sources: AiSource[] } | null {
  const q = query.trim().toLowerCase();

  // Exact chip label → its intent, no other checks needed.
  const chipIntent = CHIP_LABELS[q];

  // Long messages are almost never a plain lookup; a judgement word forces the model.
  if (!chipIntent && (!q || q.length > 120 || NEEDS_MODEL.test(q))) return null;

  const hits = chipIntent
    ? FAST_INTENTS.filter((i) => i.id === chipIntent)
    : FAST_INTENTS.filter((i) => i.match.test(q));
  if (hits.length !== 1) return null; // none, or ambiguous → let the model decide

  const intent = hits[0];
  const l: FastLang = lang === "ru" || lang === "en" ? lang : "uz";
  const docs = (KB as KbDoc[]).filter((d) => intent.sourceIds.includes(d.id));
  return { reply: intent.reply[l], sources: docs.map((d) => ({ title: d.title, href: d.href })) };
}

async function openaiChat(
  messages: { role: string; content: string }[],
  opts?: { temperature?: number; json?: boolean; maxTokens?: number }
) {
  const body: Record<string, unknown> = {
    messages,
    temperature: opts?.temperature ?? 0.3,
    // Capped explicitly — OpenAI costs are billed per output token, and gpt-4o-mini
    // will happily ramble up to its full context window if nothing stops it. The
    // server-side proxy enforces its own hard ceiling too; this is a second layer.
    max_tokens: opts?.maxTokens ?? 500,
  };
  if (opts?.json) body.response_format = { type: "json_object" };

  const res = await fetch("/openai-api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI xato: ${res.status}`);
  }
  return String(data.choices?.[0]?.message?.content || "").trim();
}

function parseJson<T>(content: string, fallback: T): T {
  try {
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function aiChat(messages: { role: "user" | "assistant"; content: string }[], lang: string) {
  // Fewer turns and a tighter per-message cap: a long back-and-forth otherwise resends
  // its whole history (as input tokens, billed the same as output) on every new turn.
  const sliced = messages.slice(-6);
  const lastUser = [...sliced].reverse().find((m) => m.role === "user")?.content || "";

  // Plain factual lookups (contact, HEMIS, faculty list, admission steps) are served
  // straight from the KB — no OpenAI call, instant, and works even when the model is
  // rate-limited or down.
  const fast = tryFastPath(lastUser, lang);
  if (fast) return fast;

  const docs = retrieve(lastUser, 5);
  const reply = await openaiChat(
    [
      { role: "system", content: `${SYSTEM_BASE}\nTil: ${lang}\n\nKONTEKST:\n${contextBlock(docs)}` },
      ...sliced.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 1500),
      })),
    ],
    { maxTokens: 450 }
  );
  return { reply, sources: docs.map((d) => ({ title: d.title, href: d.href })) };
}

export async function aiPathfinder(input: {
  freeText?: string;
  interest?: string;
  level?: string;
  lang: string;
}) {
  const query = `${input.freeText || ""} ${input.interest || ""} ${input.level || ""}`;
  const docs = retrieve(query || "fakultet qabul pathfinder", 5);
  const content = await openaiChat(
    [
      {
        role: "system",
        content: `${SYSTEM_BASE}
Til: ${input.lang}
Vazifa: PathFinder natijasini JSON qaytaring:
{"title":"...","summary":"...","faculty":"...","level":"...","steps":["...","...","..."],"links":[{"label":"...","href":"..."}]}
Faqat institut yo'nalishlari: Davolash, Pediatriya, Tibbiy profilaktika va jamoat salomatligi, Xalqaro.
KONTEKST:\n${contextBlock(docs)}`,
      },
      {
        role: "user",
        content: `Qiziqish matni: ${input.freeText || "(yo'q)"}\nTanlangan interest: ${input.interest || "-"}\nDaraja: ${input.level || "-"}`,
      },
    ],
    { json: true, maxTokens: 350 },
  );
  const parsed = parseJson(content, {
    title: "Tavsiya",
    summary: content,
    steps: [] as string[],
    links: [{ label: "Qabul", href: "/qabul" }] as AiLink[],
  });
  return { ...parsed, sources: docs.map((d) => ({ title: d.title, href: d.href })) };
}

export async function aiSearch(query: string, lang: string) {
  const docs = retrieve(query, 6);
  const content = await openaiChat(
    [
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
    { json: true, maxTokens: 350 },
  );
  return parseJson(content, {
    interpretation: content,
    suggestions: docs.map((d) => ({ title: d.title, href: d.href, reason: d.text.slice(0, 120) })),
  });
}

export async function aiQabul(question: string, lang: string) {
  const docs = retrieve(`${question} qabul bakalavriat ordinatura`, 5);
  const reply = await openaiChat([
    {
      role: "system",
      content: `${SYSTEM_BASE}
Til: ${lang}
Siz qabul bo'yicha yordamchisiz. my.edu.uz ga yo'naltiring. Hujjatlar va bosqichlarni qisqa ayting.
KONTEKST:\n${contextBlock(docs)}`,
    },
    { role: "user", content: question || "Qabul haqida qisqa ma'lumot bering" },
  ], { maxTokens: 400 });
  return {
    reply,
    links: [
      { label: "Qabul sahifasi", href: "/qabul" },
      { label: "my.edu.uz", href: "https://my.edu.uz" },
      { label: "Virtual qabulxona", href: "/virtual-reception/17" },
    ] as AiLink[],
    sources: docs.map((d) => ({ title: d.title, href: d.href })),
  };
}

export async function aiFaculty(text: string, lang: string) {
  const docs = retrieve(`${text} fakultet pediatriya davolash`, 5);
  const content = await openaiChat(
    [
      {
        role: "system",
        content: `${SYSTEM_BASE}
Til: ${lang}
JSON: {"faculty":"...","why":"...","alternatives":["..."],"next":["..."],"href":"/#faculties-news"}
KONTEKST:\n${contextBlock(docs)}`,
      },
      { role: "user", content: text || "Menga mos fakultetni tavsiya qiling" },
    ],
    { json: true, maxTokens: 350 },
  );
  return parseJson(content, {
    faculty: "Maslahat",
    why: content,
    alternatives: [] as string[],
    next: [] as string[],
    href: "/#faculties-news",
  });
}

export async function aiReception(text: string, lang: string) {
  const content = await openaiChat(
    [
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
    { temperature: 0.2, json: true, maxTokens: 900 },
  );
  return parseJson(content, {
    polished: text,
    subject: "Murojaat",
    summary: content,
    category: "boshqa",
  });
}

export async function aiSummarize(title: string, body: string, lang: string) {
  // A 3-5 sentence summary doesn't need the full article — trimming the source
  // cuts input tokens without hurting summary quality for typical news posts.
  const htmlOrText = String(body || "")
    .replace(/<[^>]+>/g, " ")
    .slice(0, 6000);
  const summary = await openaiChat(
    [
      {
        role: "system",
        content: `${SYSTEM_BASE}
Til: ${lang}
Vazifa: yangilik/blog uchun 3–5 gaplik xulosa. Faqat berilgan matnga tayaning. Sarlavha qo'shmang, faqat xulosa.`,
      },
      { role: "user", content: `Sarlavha: ${title}\n\nMatn:\n${htmlOrText}` },
    ],
    { temperature: 0.2, maxTokens: 300 },
  );
  return { summary };
}
