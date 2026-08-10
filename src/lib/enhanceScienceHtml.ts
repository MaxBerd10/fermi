/**
 * Ilmiy faoliyat (menu 48) matn sahifalari uchun CMS HTML tozalash.
 */
export function enhanceScienceHtml(html: string): string {
  if (!html?.trim()) return html;
  if (typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  stripLegacy(body);
  normalizeHero(body);
  promoteHeadings(body);
  normalizeLists(body);
  normalizeParagraphs(body);
  normalizeImages(body);
  normalizeTables(body);
  body.querySelectorAll("hr").forEach((hr) => {
    const div = hr.ownerDocument.createElement("div");
    div.className = "cms-science-divider";
    div.setAttribute("role", "separator");
    hr.replaceWith(div);
  });

  return body.innerHTML;
}

function stripLegacy(root: ParentNode) {
  root.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
  root.querySelectorAll("font").forEach((font) => {
    const span = font.ownerDocument.createElement("span");
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });
}

function normalizeHero(body: HTMLElement) {
  const img = body.querySelector(":scope > p img, :scope > img, :scope > div img");
  if (!img) return;
  const container = img.closest("p, div") ?? img.parentElement;
  if (!container) return;

  const figure = body.ownerDocument.createElement("figure");
  figure.className = "cms-science-hero";
  img.classList.add("cms-science-hero__img");
  img.removeAttribute("style");
  img.removeAttribute("width");
  img.removeAttribute("height");
  figure.appendChild(img);
  container.replaceWith(figure);
}

function promoteHeadings(body: HTMLElement) {
  body.querySelectorAll("h3, h4, p, div").forEach((el) => {
    if (el.closest("table, ul, ol, figure")) return;
    const strong = el.querySelector(":scope > strong, :scope > span > strong");
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!strong || text.length > 120) return;
    const strongText = strong.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (text !== strongText && text !== `${strongText}:`) return;

    const h3 = body.ownerDocument.createElement("h3");
    h3.className = "cms-science-section-title";
    h3.innerHTML = strong.innerHTML.replace(/:\s*$/, "").trim();
    el.replaceWith(h3);
  });
}

function normalizeLists(body: HTMLElement) {
  body.querySelectorAll("ul, ol").forEach((list) => list.classList.add("cms-science-list"));
  body.querySelectorAll("p").forEach((p) => {
    const text = p.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (/^\d+\.\s/.test(text) && !p.querySelector("a")) {
      p.classList.add("cms-science-step");
    }
  });
}

function normalizeParagraphs(body: HTMLElement) {
  body.querySelectorAll("p").forEach((p) => {
    if (p.classList.contains("cms-science-step")) return;
    if (!p.textContent?.replace(/\u00a0/g, " ").trim()) {
      p.remove();
      return;
    }
    p.classList.add("cms-science-text");
  });
  body.querySelectorAll("li > p").forEach((p) => {
    const li = p.parentElement;
    if (!li) return;
    while (p.firstChild) li.insertBefore(p.firstChild, p);
    p.remove();
  });
}

function normalizeImages(body: HTMLElement) {
  body.querySelectorAll("img").forEach((img) => {
    if (img.closest(".cms-science-hero")) return;
    img.removeAttribute("style");
    img.removeAttribute("width");
    img.removeAttribute("height");
    img.classList.add("cms-science-inline-img");
  });
}

function normalizeTables(body: HTMLElement) {
  body.querySelectorAll("table").forEach((table) => {
    table.classList.add("cms-science-table");
    const wrap = body.ownerDocument.createElement("div");
    wrap.className = "cms-science-table-wrap";
    table.before(wrap);
    wrap.appendChild(table);
  });
}
