/**
 * Legacy CKEditor HTML → clean semantic markup for `.cms-article` styling.
 * Runs in the browser (DOMParser); safe no-op during SSR/build.
 */
export type CmsEnhanceOptions = { slug?: string };

export function getCmsArticleModifier(slug?: string): string {
  if (slug === "institut-tarixi") return "cms-article--history";
  if (slug === "usmle-dasturi") return "cms-article--usmle";
  if (slug === "ichki-tartib-qoidalar") return "cms-article--regulations";
  if (slug === "tibbiyotdagi-islohotlar-inson-qadri-uchun") return "cms-article--reforms";
  if (slug === "ecaqa-xalqaro-maxsus-akkreditatsiya") return "cms-article--accreditation";
  if (slug === "institut-ilmiy-kengashi") return "cms-article--council";
  if (slug === "ilmiy-kengash-nizomi" || slug === "ilmiy-kengash-tarkibi" || slug === "kengash-kun-tartibi") {
    return "cms-article--council-pdf";
  }
  if (slug === "ilmiy-kengash") return "cms-article--council-decisions";
  if (slug === "avtoreferatlar") return "cms-article--autoreferat";
  if (slug === "tahrir-hayati-kengashi") return "cms-article--journal-editorial";
  if (slug === "jcpm-2023" || slug === "jcpm-2024" || slug === "jcpm-2025") return "cms-article--journal-archive";
  if (
    slug === "institut-ijtimoy-tibbiy-gazetasi" ||
    slug?.startsWith("institut-gazetasi-arxivi-") ||
    slug === "institut-gazetasi-2025"
  ) {
    return "cms-article--newspaper";
  }
  if (
    slug === "talim-togrisia" ||
    slug === "kredit-modul-nizomi" ||
    slug === "prezident-farmon-va-qarorlari" ||
    slug === "taraqqiyot-strategiyasi" ||
    slug === "davlat-dasturlari" ||
    slug === "oliy-talimning-davlat-talim-standarti" ||
    slug === "oliy-talim-yonalishlari-va-mutaxassisliklari-klassifikatori" ||
    slug === "ozbeksiton-respublikasi-ssv-buyruqlari"
  ) {
    return "cms-article--regulatory";
  }
  if (
    slug === "ilmiy-konferensiyalar" ||
    slug === "respublika-ilmiy-konferensiyalari" ||
    slug === "fan-olimpiadalari"
  ) {
    return "cms-article--conference";
  }
  if (
    slug === "rektorat" ||
    slug === "oquv-binolari" ||
    slug === "2-oquv-kampusi" ||
    slug === "vivariy" ||
    slug === "simulatsiya-markazi" ||
    slug === "kongress-majmuasi" ||
    slug === "sport-majmualari" ||
    slug === "talabalar-turar-joylari-4"
  ) {
    return "cms-article--buildings";
  }
  if (
    slug === "klinik-va-profilaktik-tibbiyot-jurnali" ||
    slug === "jurnal-xaqida" ||
    slug === "maqola-namunasi"
  ) {
    return "cms-article--journal-pdf";
  }
  return "";
}

export function enhanceCmsHtml(html: string, options?: CmsEnhanceOptions): string {
  if (!html?.trim()) return html;
  if (typeof DOMParser === "undefined") return html;

  const slug = options?.slug ?? "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  stripLegacyStyles(body);

  if (slug === "institut-tarixi") {
    buildHistoryLayout(body);
    return body.innerHTML;
  }

  if (slug === "usmle-dasturi") {
    buildUsmleLayout(body);
    return body.innerHTML;
  }

  if (slug === "ichki-tartib-qoidalar") {
    buildRegulationsLayout(body);
    return body.innerHTML;
  }

  if (slug === "institut-ilmiy-kengashi") {
    buildCouncilMainLayout(body);
    return body.innerHTML;
  }

  if (slug === "ilmiy-kengash") {
    buildCouncilDecisionsLayout(body);
    return body.innerHTML;
  }

  if (slug === "avtoreferatlar") {
    buildAutoreferatLayout(body);
    return body.innerHTML;
  }

  if (slug === "tahrir-hayati-kengashi") {
    buildJournalEditorialLayout(body);
    return body.innerHTML;
  }

  if (slug === "jcpm-2023" || slug === "jcpm-2024" || slug === "jcpm-2025") {
    buildJournalArchiveLayout(body, slug.replace("jcpm-", ""));
    return body.innerHTML;
  }

  normalizeHeroImage(body);
  fixHorizontalRulesInLists(body);
  promoteCenteredHeadings(body);
  promoteDivHeadings(body);
  promoteSubsectionHeadings(body);
  promoteMissionCallout(body);
  convertBrListsToUl(body);
  convertDashElementsToLists(body);
  convertNumberedBlocks(body);
  unwrapListParagraphs(body);
  promoteNumberedHeadings(body);
  promoteValueHeadings(body);
  markIntroParagraph(body);
  markLeadParagraph(body);
  body.querySelectorAll("ul, ol").forEach((list) => {
    if (!list.classList.contains("cms-stat-grid") && !list.classList.contains("cms-timeline")) {
      list.classList.add("cms-feature-list");
    }
  });

  return body.innerHTML;
}

function stripLegacyStyles(root: ParentNode) {
  root.querySelectorAll("[style]").forEach((el) => {
    const style = el.getAttribute("style") ?? "";
    const cleaned = style
      .replace(/font-family\s*:\s*[^;]+;?/gi, "")
      .replace(/font-size\s*:\s*[^;]+;?/gi, "")
      .replace(/color\s*:\s*[^;]+;?/gi, "")
      .replace(/text-align\s*:\s*justify;?/gi, "")
      .replace(/^\s*;\s*/g, "")
      .trim();
    if (cleaned) el.setAttribute("style", cleaned);
    else el.removeAttribute("style");
  });
  root.querySelectorAll("font").forEach((el) => {
    const span = el.ownerDocument.createElement("span");
    span.innerHTML = el.innerHTML;
    el.replaceWith(span);
  });
}

function normalizeHeroImage(root: ParentNode) {
  const img = root.querySelector("img");
  if (!img) return;

  const container = img.closest("p, div");
  if (!container) return;

  const figure = img.ownerDocument.createElement("figure");
  figure.className = "cms-hero-figure";
  img.classList.add("cms-hero-image");
  img.removeAttribute("style");
  img.removeAttribute("height");
  img.removeAttribute("width");

  figure.appendChild(img);
  container.replaceWith(figure);
}

function unwrapListParagraphs(root: ParentNode) {
  root.querySelectorAll("li > p").forEach((p) => {
    const li = p.parentElement;
    if (!li) return;
    while (p.firstChild) li.insertBefore(p.firstChild, p);
    p.remove();
  });
}

function fixHorizontalRulesInLists(root: ParentNode) {
  root.querySelectorAll("li").forEach((li) => {
    const hr = li.querySelector(":scope > hr");
    if (!hr) return;

    const tail: Node[] = [];
    let node = hr.nextSibling;
    while (node) {
      const next = node.nextSibling;
      tail.push(node);
      node = next;
    }
    hr.remove();
    tail.forEach((n) => li.removeChild(n));

    if (!li.textContent?.trim()) li.remove();

    const ul = li.closest("ul, ol");
    const anchor = ul ?? li;
    const divider = li.ownerDocument.createElement("div");
    divider.className = "cms-section-divider";
    divider.setAttribute("role", "separator");
    anchor.after(divider);

    const frag = li.ownerDocument.createDocumentFragment();
    tail.forEach((n) => frag.appendChild(n));
    divider.after(frag);
  });

  root.querySelectorAll("hr").forEach((hr) => {
    const divider = hr.ownerDocument.createElement("div");
    divider.className = "cms-section-divider";
    divider.setAttribute("role", "separator");
    hr.replaceWith(divider);
  });
}

function promoteCenteredHeadings(root: ParentNode) {
  let firstTitle = true;
  root.querySelectorAll("p").forEach((p) => {
    if (p.querySelector("img")) return;

    const style = p.getAttribute("style") ?? "";
    const isCenter = /text-align\s*:\s*center/i.test(style);
    const strong = p.querySelector(":scope > strong, :scope > span > strong");
    if (!isCenter || !strong) return;

    const plain = p.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    const strongText = strong.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (plain !== strongText) return;

    const h2 = p.ownerDocument.createElement("h2");
    h2.className = firstTitle ? "cms-institute-title" : "cms-section-title";
    h2.innerHTML = strong.innerHTML.trim();
    firstTitle = false;
    p.replaceWith(h2);
  });
}

function promoteDivHeadings(root: ParentNode) {
  root.querySelectorAll("div").forEach((div) => {
    if (div.querySelector(":scope > div, :scope > ul, :scope > ol, :scope > table")) return;

    const strong = div.querySelector(":scope > strong, :scope > span strong, :scope > a strong");
    if (!strong) return;

    const text = div.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    const strongText = strong.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    const isHeading =
      text === strongText ||
      text === `${strongText}:` ||
      (text.startsWith(strongText) && text.length - strongText.length <= 2);

    if (!isHeading || text.length > 140) return;

    const h2 = div.ownerDocument.createElement("h2");
    h2.className = "cms-section-title";
    h2.innerHTML = strong.innerHTML.replace(/:\s*$/, "").trim();
    div.replaceWith(h2);
  });
}

function promoteSubsectionHeadings(root: ParentNode) {
  root.querySelectorAll("p").forEach((p) => {
    const strong = p.querySelector(":scope > strong, :scope > span > strong");
    if (!strong) return;

    const text = p.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    const strongText = strong.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (text !== strongText && text !== `${strongText}:`) return;
    if (text.length > 120) return;

    const h3 = p.ownerDocument.createElement("h3");
    h3.className = "cms-subsection-title";
    h3.innerHTML = strong.innerHTML.replace(/:\s*$/, "").trim();
    p.replaceWith(h3);
  });
}

function promoteMissionCallout(root: ParentNode) {
  root.querySelectorAll("p").forEach((p) => {
    const strong = p.querySelector(":scope > strong, :scope > span > strong");
    if (!strong) return;

    const text = p.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    const strongText = strong.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (text !== strongText || text.length < 80) return;

    const aside = p.ownerDocument.createElement("aside");
    aside.className = "cms-mission-callout";
    aside.innerHTML = `<p>${strong.innerHTML}</p>`;
    p.replaceWith(aside);
  });
}

function convertBrListsToUl(root: ParentNode) {
  root.querySelectorAll("div, p").forEach((el) => {
    if (el.querySelector(":scope > div, :scope > ul, :scope > ol")) return;
    if (!/<br\s*\/?>/i.test(el.innerHTML)) return;

    const parts = el.innerHTML.split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean);
    const dashParts = parts.filter((part) => part.replace(/<[^>]+>/g, "").trim().startsWith("-"));
    if (dashParts.length < 2) return;

    const ul = el.ownerDocument.createElement("ul");
    ul.className = "cms-feature-list";
    dashParts.forEach((part) => {
      const li = el.ownerDocument.createElement("li");
      li.innerHTML = part.replace(/^-\s*/, "").trim();
      ul.appendChild(li);
    });
    el.replaceWith(ul);
  });
}

function convertDashElementsToLists(root: ParentNode) {
  root.querySelectorAll("div, p").forEach((el) => {
    if (el.closest("ul, ol, aside, figure")) return;
    if (el.querySelector(":scope > div, :scope > ul, :scope > ol, :scope > table, :scope > hr")) return;

    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!text.startsWith("-")) return;

    el.setAttribute("data-cms-dash", "1");
    const statMatch = text.match(/^-\s*(.+?)\s-\s*(.+)$/);
    if (statMatch) el.setAttribute("data-cms-stat", "1");
  });

  root.querySelectorAll("*").forEach((parent) => {
    let i = 0;
    while (i < parent.children.length) {
      const child = parent.children[i];
      if (!child.hasAttribute("data-cms-dash")) {
        i++;
        continue;
      }

      const group: Element[] = [];
      let j = i;
      while (j < parent.children.length && parent.children[j].hasAttribute("data-cms-dash")) {
        group.push(parent.children[j]);
        j++;
      }

      const isStat = group.length > 0 && group.every((g) => g.hasAttribute("data-cms-stat"));
      const ul = parent.ownerDocument.createElement("ul");
      ul.className = isStat ? "cms-stat-grid" : "cms-feature-list";

      group.forEach((g) => {
        const li = parent.ownerDocument.createElement("li");
        const raw = g.textContent?.replace(/\u00a0/g, " ").trim().replace(/^-\s*/, "") ?? "";

        if (isStat) {
          const parts = raw.match(/^(.+?)\s-\s*(.+)$/);
          if (parts) {
            li.innerHTML = `<span class="cms-stat-label">${parts[1].trim()}</span><span class="cms-stat-value">${parts[2].trim()}</span>`;
          } else {
            li.textContent = raw;
          }
        } else {
          li.innerHTML = g.innerHTML.replace(/^-\s*/, "").trim();
        }

        ul.appendChild(li);
        g.remove();
      });

      parent.insertBefore(ul, parent.children[i] ?? null);
      i++;
    }
  });
}

function convertNumberedBlocks(root: ParentNode) {
  root.querySelectorAll("div, p").forEach((el) => {
    if (el.closest("ul, ol, aside, figure")) return;
    if (el.querySelector(":scope > div, :scope > ul, :scope > ol")) return;

    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    const match = text.match(/^(\d+)\.\s/);
    if (!match) return;

    el.classList.add("cms-dept-card");
    el.setAttribute("data-num", match[1]);
  });
}

function promoteNumberedHeadings(root: ParentNode) {
  root.querySelectorAll("p").forEach((p) => {
    const text = p.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!/^\d+\)\s/.test(text)) return;
    const h3 = p.ownerDocument.createElement("h3");
    h3.className = "cms-subsection-title";
    h3.textContent = text;
    p.replaceWith(h3);
  });
}

function promoteValueHeadings(root: ParentNode) {
  root.querySelectorAll("p").forEach((p) => {
    const strong = p.querySelector(":scope > strong, :scope > span > strong");
    if (!strong || p.children.length > 2) return;

    const plain = p.textContent?.trim() ?? "";
    const strongText = strong.textContent?.trim() ?? "";
    if (plain !== strongText) return;
    if (p.getAttribute("style")?.includes("center")) return;

    const h4 = p.ownerDocument.createElement("h4");
    h4.className = "cms-value-title";
    h4.innerHTML = strong.innerHTML.trim();
    p.replaceWith(h4);
  });
}

function markIntroParagraph(root: ParentNode) {
  const title = root.querySelector(".cms-institute-title");
  const start = title ?? root.querySelector(".cms-hero-figure");
  if (!start) return;

  let next = start.nextElementSibling;
  while (next && (next.classList.contains("cms-section-divider") || next.tagName === "H2")) {
    next = next.nextElementSibling;
  }
  if (next?.tagName === "P") next.classList.add("cms-intro");
}

function markLeadParagraph(root: ParentNode) {
  const firstSection = root.querySelector("h2.cms-section-title");
  if (!firstSection) return;
  const next = firstSection.nextElementSibling;
  if (next?.tagName === "P") next.classList.add("cms-lead");
}

type HistoryDirectorMeta = {
  match: RegExp;
  period: string;
  name: string;
  degree: string;
  role: string;
  lifespan?: string;
  current?: boolean;
};

const HISTORY_DIRECTORS: HistoryDirectorMeta[] = [
  {
    match: /Mirzayev/i,
    period: "1992–1997",
    name: "Mirzaev Komiljon Mirzaevich",
    degree: "Tibbiyot fanlari doktori, professor",
    role: "Tibbiyot markazi direktori va Farg'ona davlat universiteti ma’naviy-ma’rifiy ishlar bo'yicha prorektori",
  },
  {
    match: /Nishano/i,
    period: "1998–2005",
    name: "Nishonov Yusuf Nishonovich",
    degree: "Tibbiyot fanlari doktori, professor",
    role: "Toshkent davlat 2-tibbiyot instituti Farg'ona filiali direktori",
    lifespan: "1946–2025",
  },
  {
    match: /Abdurahmonov|Abduraxmonov/i,
    period: "2005–2012",
    name: "Abduraxmonov Muhammadjon",
    degree: "Tibbiyot fanlari doktori, professor",
    role: "Toshkent tibbiyot akademiyasi Farg'ona filiali direktori",
  },
  {
    match: /Usmanov/i,
    period: "2012–2015",
    name: "Usmanov Ravshan Djaxangirovich",
    degree: "Tibbiyot fanlari doktori, professor",
    role: "Toshkent tibbiyot akademiyasi Farg'ona filiali direktori",
  },
  {
    match: /Mamatqulov/i,
    period: "2015–2017",
    name: "Mamatqulov Xasan Adusamatovich",
    degree: "Tibbiyot fanlari doktori, professor",
    role: "Toshkent tibbiyot akademiyasi Farg'ona filiali direktori",
  },
  {
    match: /Sultanov/i,
    period: "2017–2021",
    name: "Sultanov Gafurdjon Ne'matbekovich",
    degree: "Tibbiyot fanlari nomzodi",
    role: "Toshkent tibbiyot akademiyasi Farg'ona filiali direktori",
  },
  {
    match: /Sidikov/i,
    period: "2021 yildan",
    name: "Sidikov Akmal Abdikaxarovich",
    degree: "Tibbiyot fanlari doktori, professor",
    role: "2021 yildan hozirga qadar Farg'ona jamoat salomatligi tibbiyot instituti rektori",
    current: true,
  },
];

function buildHistoryLayout(body: HTMLElement) {
  stripLegacyStyles(body);
  normalizeHistoryLogo(body);
  markAcademicSplit(body);
  promoteHistoryHeadings(body);
  fixHorizontalRulesInLists(body);
  refineHistoryTimeline(body);
  extractHistoryPersonCards(body);
  assembleDirectorSection(body);
  assembleAcademicLeaders(body);
  purgeLoosePersonCards(body);
  wrapHistoryContentSections(body);
  normalizeHistoryArchiveImage(body);
  buildHistoryPhotoGallery(body);
  cleanupHistoryEmptyNodes(body);
  markHistoryIntro(body);
}

function isDirectorImageSrc(src: string): boolean {
  return HISTORY_DIRECTORS.some((d) => d.match.test(src));
}

function markAcademicSplit(body: HTMLElement) {
  body.querySelectorAll("div, p").forEach((el) => {
    if (el.closest(".cms-history-hero")) return;
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!/o[''`']?quv va ilmiy/i.test(text) || !/rahbarlari/i.test(text)) return;
    if (text.length > 90) return;

    const h3 = body.ownerDocument.createElement("h3");
    h3.id = "cms-academic-split";
    h3.className = "cms-history-subhead cms-history-subhead--academic";
    h3.textContent = "O'quv va ilmiy yo'nalishlar rahbarlari";
    el.replaceWith(h3);
  });
}

function isHistoryPortraitImg(img: HTMLImageElement): boolean {
  const src = img.getAttribute("src") ?? "";
  if (src.includes("/logo/")) return false;
  if (src.includes("fotogallery")) return false;
  if (/screenshot/i.test(src)) return false;
  return isDirectorImageSrc(src) || /Institut%20tarixi|Institut tarixi|Rektorat|pedagogika|kafedra/i.test(src);
}

function isHistoryGalleryImg(img: HTMLImageElement): boolean {
  return (img.getAttribute("src") ?? "").includes("fotogallery");
}

function normalizeHistoryLogo(body: HTMLElement) {
  const logo = body.querySelector('img[src*="/logo/"]');
  if (!logo) return;

  const originalContainer = logo.closest("div, p");

  logo.classList.add("cms-history-logo");
  logo.removeAttribute("style");
  logo.removeAttribute("width");
  logo.removeAttribute("height");

  const hero = body.ownerDocument.createElement("header");
  hero.className = "cms-history-hero";
  const wrap = body.ownerDocument.createElement("div");
  wrap.className = "cms-history-logo-wrap";
  wrap.appendChild(logo);
  hero.appendChild(wrap);

  if (originalContainer?.parentNode) {
    originalContainer.replaceWith(hero);
  } else {
    body.insertBefore(hero, body.firstChild);
  }
}

function promoteHistoryHeadings(body: HTMLElement) {
  body.querySelectorAll("div, p").forEach((el) => {
    if (el.closest(".cms-history-person, .cms-history-hero, .cms-timeline")) return;
    if (el.querySelector("img")) return;

    const strong = el.querySelector(":scope > strong, :scope > span > strong");
    if (strong) {
      const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
      const strongText = strong.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
      const isHeading =
        text === strongText ||
        text === `${strongText}:` ||
        (text.startsWith(strongText) && text.length - strongText.length <= 2);
      if (!isHeading || text.length > 140) return;

      const plain = strongText.replace(/:\s*$/, "").trim();
      if (/^Institut haqida$/i.test(plain)) {
        el.remove();
        return;
      }

      const style = el.getAttribute("style") ?? "";
      const isCenter = /text-align\s*:\s*center/i.test(style);
      const heading = body.ownerDocument.createElement(isCenter ? "h2" : "h3");
      heading.className = isCenter ? "cms-section-title" : "cms-history-subhead";
      heading.innerHTML = strong.innerHTML.replace(/:\s*$/, "").trim();
      el.replaceWith(heading);
      return;
    }

    const plain = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (
      plain.length >= 8 &&
      plain.length <= 80 &&
      !el.querySelector("strong, a, ul, ol") &&
      !/Institutga turli yillarda/i.test(plain) &&
      !/Institutda o/i.test(plain) &&
      !/o[''`']?quv va ilmiy/i.test(plain)
    ) {
      const h3 = body.ownerDocument.createElement("h3");
      h3.className = "cms-history-subhead";
      h3.textContent = plain;
      el.replaceWith(h3);
    }
  });
}

function refineHistoryTimeline(body: HTMLElement) {
  const ul = body.querySelector("ul");
  if (!ul) return;

  ul.classList.add("cms-timeline");

  [...ul.querySelectorAll(":scope > li")].forEach((li) => {
    const text = li.textContent?.replace(/\u00a0/g, " ").trim() ?? "";

    if (/Institutga turli yillarda/i.test(text)) {
      li.remove();
      return;
    }

    if (/^\d{4}[–—-]\d{4}\s*[—–-]/.test(text) || /^\d{4}\s+yildan/i.test(text)) {
      li.remove();
      return;
    }

    li.classList.add("cms-timeline__item");
    li.querySelectorAll("hr").forEach((hr) => hr.remove());

    const yearMatch = text.match(/\b(1998|2005|2020)\b/)?.[1];
    if (yearMatch) {
      const badge = body.ownerDocument.createElement("span");
      badge.className = "cms-timeline__year";
      badge.textContent = yearMatch;
      li.insertBefore(badge, li.firstChild);
      badge.after(body.ownerDocument.createTextNode(" "));
    }
  });

  if (!ul.querySelector("li")) ul.remove();
}

function applyDirectorCard(card: HTMLElement, meta: HistoryDirectorMeta, index: number) {
  card.className = "cms-history-person cms-history-person--director";
  if (meta.current) card.classList.add("cms-history-person--current");

  let photo = card.querySelector(".cms-history-person__photo");
  if (!photo) {
    photo = card.ownerDocument.createElement("div");
    photo.className = "cms-history-person__photo";
    const img = card.querySelector("img");
    if (img) photo.appendChild(img);
    card.prepend(photo);
  }

  let indexEl = photo.querySelector(".cms-history-person__index");
  if (!indexEl) {
    indexEl = card.ownerDocument.createElement("span");
    indexEl.className = "cms-history-person__index";
    photo.appendChild(indexEl);
  }
  indexEl.textContent = String(index);

  let info = card.querySelector(".cms-history-person__info") as HTMLElement | null;
  if (!info) {
    info = card.ownerDocument.createElement("div");
    info.className = "cms-history-person__info";
    card.appendChild(info);
  }

  info.innerHTML = "";

  const period = card.ownerDocument.createElement("span");
  period.className = "cms-history-person__period";
  period.textContent = meta.period;
  info.appendChild(period);

  const name = card.ownerDocument.createElement("h4");
  name.className = "cms-history-person__name";
  name.textContent = meta.name;
  info.appendChild(name);

  const degree = card.ownerDocument.createElement("p");
  degree.className = "cms-history-person__degree";
  degree.textContent = meta.degree;
  info.appendChild(degree);

  const role = card.ownerDocument.createElement("p");
  role.className = "cms-history-person__role";
  role.textContent = meta.role;
  info.appendChild(role);

  if (meta.lifespan) {
    const life = card.ownerDocument.createElement("span");
    life.className = "cms-history-person__lifespan";
    life.textContent = meta.lifespan;
    info.appendChild(life);
  }
}

function assembleDirectorSection(body: HTMLElement) {
  if (body.querySelector(".cms-history-block--directors")) return;

  const directorCards = [...body.querySelectorAll(".cms-history-person")].filter((card) =>
    isDirectorImageSrc(card.querySelector("img")?.getAttribute("src") ?? ""),
  );

  const section = body.ownerDocument.createElement("section");
  section.className = "cms-history-block cms-history-block--directors";

  const heading = body.ownerDocument.createElement("h2");
  heading.className = "cms-section-title";
  heading.textContent = "Institut rahbarlari";
  section.appendChild(heading);

  const intro = body.ownerDocument.createElement("p");
  intro.className = "cms-history-directors-intro";
  intro.textContent =
    "Institutga turli yillarda quyidagi rahbarlar direktor va rektorlik qilgan:";
  section.appendChild(intro);

  const grid = body.ownerDocument.createElement("div");
  grid.className = "cms-history-people cms-history-people--directors";

  HISTORY_DIRECTORS.forEach((meta, i) => {
    const card = directorCards.find((c) =>
      meta.match.test(c.querySelector("img")?.getAttribute("src") ?? ""),
    ) as HTMLElement | undefined;
    if (!card) return;
    applyDirectorCard(card, meta, i + 1);
    grid.appendChild(card);
  });

  section.appendChild(grid);

  const anchor = body.querySelector(".cms-timeline") ?? body.querySelector("#cms-academic-split");

  if (anchor) {
    anchor.after(section);
  } else {
    body.appendChild(section);
  }

  body.querySelectorAll(".cms-history-directors-intro").forEach((el) => {
    if (!section.contains(el)) el.remove();
  });

  directorCards.forEach((card) => {
    if (!grid.contains(card)) card.remove();
  });
}

function isAfterNode(node: Element, ref: Element | null): boolean {
  if (!ref) return false;
  return (ref.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

function structureAcademicCard(card: HTMLElement) {
  card.classList.add("cms-history-person--academic");
  const info = card.querySelector(".cms-history-person__info") as HTMLElement | null;
  if (!info) return;

  info.querySelectorAll("div").forEach((div) => {
    if (div === info || div.querySelector("div, ul, ol")) return;
    if (!div.textContent?.replace(/\u00a0/g, " ").trim()) {
      div.remove();
      return;
    }
    const p = info.ownerDocument.createElement("p");
    p.innerHTML = div.innerHTML;
    div.replaceWith(p);
  });

  const firstStrong = info.querySelector("strong");
  if (firstStrong && !info.querySelector(".cms-history-person__name")) {
    const name = info.ownerDocument.createElement("h4");
    name.className = "cms-history-person__name";
    name.innerHTML = firstStrong.innerHTML.trim();
    firstStrong.replaceWith(name);
  }
}

function assembleAcademicLeaders(body: HTMLElement) {
  const split = body.querySelector("#cms-academic-split");
  if (!split) return;

  const academicCards = [...body.querySelectorAll(".cms-history-person")].filter((card) => {
    const src = card.querySelector("img")?.getAttribute("src") ?? "";
    if (isDirectorImageSrc(src)) return false;
    return isAfterNode(card as Element, split as Element);
  });

  if (academicCards.length === 0) return;

  academicCards.forEach((card) => structureAcademicCard(card as HTMLElement));

  const grid = body.ownerDocument.createElement("div");
  grid.className = "cms-history-people cms-history-people--academic";
  academicCards.forEach((card) => grid.appendChild(card));

  const intro = split.nextElementSibling;
  if (intro && intro.tagName === "P" && !intro.classList.contains("cms-history-person")) {
    intro.classList.add("cms-academic-intro");
    intro.after(grid);
  } else {
    split.after(grid);
  }
}

function purgeLoosePersonCards(body: HTMLElement) {
  body.querySelectorAll(".cms-history-person").forEach((card) => {
    if (card.closest(".cms-history-people")) return;
    const src = card.querySelector("img")?.getAttribute("src") ?? "";
    const hasInfo = card.textContent?.replace(/\u00a0/g, " ").trim();
    if (!src || !hasInfo || hasInfo.length < 8) card.remove();
  });
}

function pendingHistoryPortraits(body: HTMLElement): HTMLImageElement[] {
  return [...body.querySelectorAll("img")].filter(
    (img) => isHistoryPortraitImg(img) && !img.closest(".cms-history-person"),
  );
}

function extractHistoryPersonCards(body: HTMLElement) {
  let portraits = pendingHistoryPortraits(body);
  let guard = 0;

  while (portraits.length > 0 && guard < portraits.length + 20) {
    const target = portraits[0];
    extractSingleHistoryPerson(body, target);
    const remaining = pendingHistoryPortraits(body);
    if (remaining.length >= portraits.length) break;
    portraits = remaining;
    guard++;
  }
}

function extractSingleHistoryPerson(body: HTMLElement, img: HTMLImageElement) {
  if (img.closest(".cms-history-person")) return;

  let startEl: Element = img.parentElement ?? img;
  while (startEl.parentElement && startEl.parentElement !== body) {
    const parent = startEl.parentElement;
    const portraitsInParent = [...parent.querySelectorAll("img")].filter(isHistoryPortraitImg);
    if (portraitsInParent.length > 1) break;
    startEl = parent;
  }

  const parent = startEl.parentElement;
  if (!parent) return;

  const nodes: Node[] = [startEl];
  let sibling = startEl.nextSibling;
  while (sibling) {
    if (sibling.nodeType === Node.ELEMENT_NODE) {
      const el = sibling as Element;
      if (el.tagName === "HR") break;
      const nested = el.matches("img")
        ? (el as HTMLImageElement)
        : (el.querySelector("img") as HTMLImageElement | null);
      if (nested && isHistoryPortraitImg(nested)) break;
    }
    nodes.push(sibling);
    sibling = sibling.nextSibling;
  }

  const card = body.ownerDocument.createElement("article");
  card.className = "cms-history-person";

  const photo = body.ownerDocument.createElement("div");
  photo.className = "cms-history-person__photo";

  const info = body.ownerDocument.createElement("div");
  info.className = "cms-history-person__info";

  img.removeAttribute("style");
  img.removeAttribute("width");
  img.removeAttribute("height");
  img.className = "cms-history-person__img";
  photo.appendChild(img);

  const first = nodes[0] as Element;
  if (first !== img && first.contains(img)) {
    [...first.childNodes].forEach((n) => {
      if (n !== img) info.appendChild(n);
    });
  }

  nodes.slice(1).forEach((n) => info.appendChild(n));

  normalizePersonInfo(info);

  card.appendChild(photo);
  if (info.textContent?.replace(/\u00a0/g, " ").trim()) {
    card.appendChild(info);
  }

  parent.insertBefore(card, startEl);
  if (startEl.parentNode) startEl.remove();
}

function normalizePersonInfo(info: HTMLElement) {
  info.querySelectorAll("div, p, span").forEach((el) => {
    if (el === info) return;
    if (!el.textContent?.replace(/\u00a0/g, " ").trim()) {
      el.remove();
      return;
    }
    el.removeAttribute("style");
    if (el.tagName === "DIV" && !el.querySelector("div, ul, ol")) {
      const p = info.ownerDocument.createElement("p");
      p.innerHTML = el.innerHTML;
      el.replaceWith(p);
    }
  });

  info.querySelectorAll("strong").forEach((strong, i) => {
    if (i === 0) {
      const name = info.ownerDocument.createElement("h4");
      name.className = "cms-history-person__name";
      name.innerHTML = strong.innerHTML.trim();
      strong.replaceWith(name);
    }
  });
}

function wrapHistoryContentSections(body: HTMLElement) {
  const headings = [...body.querySelectorAll("h2.cms-section-title, h3.cms-history-subhead")].filter(
    (h) => !h.closest(".cms-history-block"),
  );
  if (headings.length === 0) return;

  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i];
    const section = body.ownerDocument.createElement("section");
    section.className = "cms-history-block";

    const label = heading.textContent ?? "";
    if (/rahbarlar|direktor|rektor/i.test(label)) {
      section.classList.add("cms-history-block--directors");
    } else if (/o[''`]quv va ilmiy|yo[''`]nalishlar rahbarlari/i.test(label)) {
      section.classList.add("cms-history-block--academic");
    } else if (/tarix sahifasi/i.test(label)) {
      section.classList.add("cms-history-block--story");
    } else if (/xalqaro hamkorlik/i.test(label)) {
      section.classList.add("cms-history-block--intl");
    } else if (/tashkil topishi|huquqiy/i.test(label)) {
      section.classList.add("cms-history-block--founding");
    }

    heading.before(section);
    section.appendChild(heading);

    let cursor = section.nextSibling;
    const nextHeading = headings[i + 1] ?? null;

    while (cursor && cursor !== nextHeading) {
      const next = cursor.nextSibling;
      section.appendChild(cursor);
      cursor = next;
    }
  }
}

function normalizeHistoryArchiveImage(body: HTMLElement) {
  body.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") ?? "";
    if (!/screenshot/i.test(src)) return;
    if (img.closest(".cms-history-archive")) return;

    img.removeAttribute("style");
    img.removeAttribute("width");
    img.removeAttribute("height");
    img.className = "cms-history-archive__img";

    const originalContainer = img.closest("p, div");
    const figure = body.ownerDocument.createElement("figure");
    figure.className = "cms-history-archive";
    figure.appendChild(img);

    if (originalContainer?.parentNode) {
      originalContainer.replaceWith(figure);
    }
  });
}

function buildHistoryPhotoGallery(body: HTMLElement) {
  const galleryImgs = [...body.querySelectorAll("img")].filter(isHistoryGalleryImg);
  if (galleryImgs.length === 0) return;

  const grid = body.ownerDocument.createElement("div");
  grid.className = "cms-photo-grid";

  const anchor = galleryImgs[0].closest("p, div");
  const insertParent = anchor?.parentElement ?? body;
  insertParent.insertBefore(grid, anchor ?? null);

  galleryImgs.forEach((img) => {
    img.removeAttribute("style");
    img.removeAttribute("width");
    img.removeAttribute("height");
    const cell = body.ownerDocument.createElement("figure");
    cell.className = "cms-photo-grid__cell";
    cell.appendChild(img);
    grid.appendChild(cell);
    const empty = img.closest("p");
    if (empty && !empty.textContent?.replace(/\u00a0/g, " ").trim()) empty.remove();
  });
}

function cleanupHistoryEmptyNodes(body: HTMLElement) {
  body.querySelectorAll("div, p").forEach((el) => {
    if (el.closest(".cms-history-person__info")) return;
    if (!el.textContent?.replace(/\u00a0/g, " ").trim() && !el.querySelector("img, ul, ol, section")) {
      el.remove();
    }
  });

  body.querySelectorAll("hr").forEach((hr) => {
    const div = hr.ownerDocument.createElement("div");
    div.className = "cms-section-divider";
    hr.replaceWith(div);
  });
}

function markHistoryIntro(body: HTMLElement) {
  const founding = body.querySelector(".cms-history-block--founding");
  if (!founding) return;
  const intro = founding.querySelector(":scope > div, :scope > p");
  if (intro && !intro.querySelector("img, ul")) intro.classList.add("cms-intro");
}

function buildRegulationsLayout(body: HTMLElement) {
  body.querySelectorAll("div, p").forEach((el) => {
    const style = el.getAttribute("style") ?? "";
    const isCenter = /text-align\s*:\s*center/i.test(style);
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!text) return;

    const strong = el.querySelector(":scope > strong, :scope > span > strong");
    if (isCenter && strong && /ichki tartib qoidalari|ODOB-AXLOQ KODEKSI/i.test(text)) {
      const h2 = el.ownerDocument.createElement("h2");
      h2.className = /ODOB-AXLOQ/i.test(text)
        ? "cms-reg-title cms-reg-title--split"
        : "cms-reg-title";
      h2.innerHTML = strong.innerHTML.trim();
      el.replaceWith(h2);
      return;
    }

    if (isCenter && !strong && text.length > 80 && /Qoidalar|Mehnat kodeksi/i.test(text)) {
      el.className = "cms-reg-intro";
      el.removeAttribute("style");
      return;
    }

    if (isCenter && /\d+-BOB|\d+-bob\./i.test(text)) {
      const h3 = el.ownerDocument.createElement("h3");
      h3.className = "cms-reg-chapter";
      h3.textContent = text;
      el.replaceWith(h3);
    }
  });

  body.querySelectorAll("p").forEach((p) => {
    const text = p.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!/\d+-modda\./i.test(text)) return;

    const h4 = p.ownerDocument.createElement("h4");
    h4.className = "cms-reg-article";
    h4.textContent = text.replace(/^\s+/, "");
    p.replaceWith(h4);
  });

  body.querySelectorAll("div[style*='justify'], p[style*='justify']").forEach((el) => {
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!text || text.length > 900) return;

    if (el.querySelector('[style*="0000CD"], [style*="#0000CD"]') || /^[12]\./.test(text)) {
      el.classList.add(/0000CD|#0000CD/i.test(el.innerHTML) ? "cms-reg-def" : "cms-reg-clause");
      el.removeAttribute("style");
    }
  });

  body.querySelectorAll("a[href*='.pdf']").forEach((a) => {
    a.classList.add("cms-reg-pdf-link");
    const row = a.closest("p, div");
    row?.classList.add("cms-reg-pdf-wrap");
  });

  const split = body.querySelector(".cms-reg-title--split");
  if (split) {
    const divider = body.ownerDocument.createElement("div");
    divider.className = "cms-section-divider cms-reg-split";
    split.before(divider);
  }

  body.querySelectorAll(".cms-reg-article").forEach((h4) => {
    let next = h4.nextElementSibling;
    while (next && next.tagName === "P") {
      next.classList.add("cms-reg-text");
      next = next.nextElementSibling;
    }
  });
}

function buildUsmleLayout(body: HTMLElement) {
  body.querySelectorAll(".hatnote, [class*='navigation-not-searchable']").forEach((el) => el.remove());
  body.querySelectorAll('a[title="Edit section"]').forEach((el) => el.remove());

  const steps: Element[] = [];
  body.querySelectorAll("p").forEach((p) => {
    const text = p.textContent ?? "";
    if (!/USMLE Step [123]/i.test(text)) return;
    steps.push(p);
  });

  steps.forEach((p, i) => {
    const card = body.ownerDocument.createElement("article");
    card.className = "cms-usmle-step";
    const num = (p.textContent?.match(/Step (\d)/i)?.[1] ?? String(i + 1)).charAt(0);
    card.innerHTML = `<div class="cms-usmle-step__head"><span class="cms-usmle-step__num">${num}</span><span class="cms-usmle-step__label">USMLE Step ${num}</span></div>`;
    const bodyEl = body.ownerDocument.createElement("div");
    bodyEl.className = "cms-usmle-step__body";
    bodyEl.innerHTML = p.innerHTML.replace(/<strong[^>]*>USMLE Step \d[^<]*<\/strong>/i, "").trim();
    card.appendChild(bodyEl);
    p.replaceWith(card);
  });

  body.querySelectorAll('a[href*=".pptx"], a[href*=".pdf"]').forEach((a) => {
    a.classList.add("cms-usmle-download");
    if (a.parentElement?.tagName === "P" && a.parentElement.textContent?.trim() === a.textContent?.trim()) {
      const wrap = body.ownerDocument.createElement("div");
      wrap.className = "cms-usmle-downloads";
      a.parentElement.replaceWith(wrap);
      wrap.appendChild(a);
    }
  });

  body.querySelectorAll("p").forEach((p) => {
    if (p.closest(".cms-usmle-step")) return;
    if (p.textContent && p.textContent.length > 120) p.classList.add("cms-usmle-intro");
  });
}

const RESTRICTED_TEXT_RE =
  /ushbu sahifani ko[''`’]?rish faqat ro[''`’]?yxatdan o[''`’]?tgan/i;

function stripRestrictedNotice(body: HTMLElement) {
  body.querySelectorAll("p, div").forEach((el) => {
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (RESTRICTED_TEXT_RE.test(text)) el.remove();
  });
}

function buildCouncilMainLayout(body: HTMLElement) {
  stripRestrictedNotice(body);
  const paragraphs = [...body.querySelectorAll("p")].filter(
    (p) => (p.textContent?.replace(/\u00a0/g, " ").trim().length ?? 0) > 20,
  );

  if (paragraphs.length === 0) return;

  paragraphs[0].classList.add("cms-council-intro");

  const subIdx = paragraphs.findIndex((p) =>
    /kengash faoliyati|vazifalarini hal qilish/i.test(p.textContent ?? ""),
  );
  if (subIdx > 0) {
    const sub = paragraphs[subIdx];
    const h3 = body.ownerDocument.createElement("h3");
    h3.className = "cms-council-subhead";
    h3.textContent = sub.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    sub.replaceWith(h3);
  }

  [...body.querySelectorAll("p")].forEach((p) => {
    if (p.classList.contains("cms-council-intro")) return;
    const text = p.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!text || text.length < 40) {
      p.remove();
      return;
    }

    if (text.includes(";")) {
      const items = text
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 8);
      if (items.length >= 2) {
        const ul = body.ownerDocument.createElement("ul");
        ul.className = "cms-council-tasks";
        items.forEach((item) => {
          const li = body.ownerDocument.createElement("li");
          li.textContent = item.replace(/\.\s*$/, "");
          ul.appendChild(li);
        });
        p.replaceWith(ul);
        return;
      }
    }

    p.classList.add("cms-council-text");
  });
}

function buildCouncilDecisionsLayout(body: HTMLElement) {
  stripRestrictedNotice(body);
  const lines: string[] = [];

  body.querySelectorAll("p, div").forEach((el) => {
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!text || RESTRICTED_TEXT_RE.test(text)) return;
    text.split(/\n+/).forEach((line) => {
      const t = line.trim();
      if (t.length > 6 && /kengash|bayon|qaror/i.test(t)) lines.push(t);
    });
    el.remove();
  });

  if (lines.length === 0) return;

  const list = body.ownerDocument.createElement("ul");
  list.className = "cms-council-decisions";

  lines.forEach((line) => {
    const li = body.ownerDocument.createElement("li");
    li.className = "cms-council-decision";
    li.innerHTML = `<span class="cms-council-decision__icon" aria-hidden="true"><i class="ri-file-list-3-line"></i></span><span class="cms-council-decision__text">${escapeHtml(line)}</span>`;
    list.appendChild(li);
  });

  body.appendChild(list);
}

function buildAutoreferatLayout(body: HTMLElement) {
  stripRestrictedNotice(body);
  const raw = body.textContent?.replace(/\u00a0/g, " ") ?? "";
  const blocks = raw.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);

  body.innerHTML = "";
  const grid = body.ownerDocument.createElement("div");
  grid.className = "cms-autoreferat-grid";

  let currentHeader = "";
  let pendingAuthor = "";
  let pendingTitle = "";

  const flushCard = () => {
    if (!pendingAuthor && !pendingTitle) return;
    const card = body.ownerDocument.createElement("article");
    card.className = "cms-autoreferat-card";
    card.innerHTML = `
      ${currentHeader ? `<p class="cms-autoreferat-card__council">${escapeHtml(currentHeader)}</p>` : ""}
      <h3 class="cms-autoreferat-card__author">${escapeHtml(pendingAuthor)}</h3>
      <p class="cms-autoreferat-card__topic">${escapeHtml(pendingTitle)}</p>
    `;
    grid.appendChild(card);
    pendingAuthor = "";
    pendingTitle = "";
  };

  const isHeader = (line: string) =>
    /FARG[''`’]?ONA|ILMIY DARAJALAR|ILMIY KENGASH/i.test(line) && line.length > 40;

  const isAuthor = (line: string) =>
    line.length > 6 &&
    line.length < 80 &&
    line === line.toUpperCase() &&
    /[A-Z]/.test(line) &&
    !isHeader(line);

  blocks.forEach((block) => {
    block.split(/\n+/).forEach((line) => {
      const t = line.trim();
      if (!t) return;
      if (isHeader(t)) {
        flushCard();
        currentHeader = t;
        return;
      }
      if (isAuthor(t)) {
        flushCard();
        pendingAuthor = t;
        return;
      }
      if (pendingAuthor && !pendingTitle) {
        pendingTitle = t;
        flushCard();
      }
    });
  });

  flushCard();
  body.appendChild(grid);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildJournalEditorialLayout(body: HTMLElement) {
  stripRestrictedNotice(body);
  const lines: { role: string; name: string }[] = [];

  body.querySelectorAll("p, div").forEach((el) => {
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!text || /TAHRIR HAY.?ATI|ILMIY JURNALI/i.test(text) && text.length < 80) return;

    const match = text.match(/^(.{3,40}?):\s*(.+)$/);
    if (match && /muharrir|kotib|tahrir|mas.?ul/i.test(match[1])) {
      lines.push({ role: match[1].trim(), name: match[2].trim() });
      el.remove();
      return;
    }

    if (/Bosh muharrir|Mas.?ul kotib|yordamchisi/i.test(text)) {
      const idx = text.indexOf(":");
      if (idx > 0) {
        lines.push({ role: text.slice(0, idx).trim(), name: text.slice(idx + 1).trim() });
        el.remove();
      }
    }
  });

  body.innerHTML = "";
  const head = body.ownerDocument.createElement("h2");
  head.className = "cms-journal-editorial__title";
  head.textContent = "Ilmiy jurnal tahrir hay'ati";
  body.appendChild(head);

  const grid = body.ownerDocument.createElement("div");
  grid.className = "cms-journal-editorial__grid";

  lines.forEach(({ role, name }) => {
    const card = body.ownerDocument.createElement("article");
    card.className = "cms-journal-editorial__card";
    card.innerHTML = `<p class="cms-journal-editorial__role">${escapeHtml(role)}</p><p class="cms-journal-editorial__name">${escapeHtml(name)}</p>`;
    grid.appendChild(card);
  });

  body.appendChild(grid);
}

function buildJournalArchiveLayout(body: HTMLElement, year: string) {
  stripRestrictedNotice(body);
  const raw = body.textContent?.replace(/\u00a0/g, " ") ?? "";
  const seen = new Set<string>();
  const titles: string[] = [];

  raw.split(/\n+/).forEach((line) => {
    const t = line.trim().replace(/\s+/g, " ");
    if (t.length < 12) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    titles.push(t);
  });

  body.innerHTML = "";
  const head = body.ownerDocument.createElement("div");
  head.className = "cms-journal-archive__head";
  head.innerHTML = `<span class="cms-journal-archive__year">${escapeHtml(year)}</span><span class="cms-journal-archive__count">${titles.length} ${titles.length === 1 ? "maqola" : "maqola"}</span>`;
  body.appendChild(head);

  const list = body.ownerDocument.createElement("ul");
  list.className = "cms-journal-archive__list";

  titles.forEach((title, i) => {
    const li = body.ownerDocument.createElement("li");
    li.className = "cms-journal-archive__item";
    li.innerHTML = `<span class="cms-journal-archive__num">${i + 1}</span><span class="cms-journal-archive__title">${escapeHtml(title)}</span>`;
    list.appendChild(li);
  });

  body.appendChild(list);
}
