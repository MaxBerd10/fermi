/**
 * Bakalavriat / qabul sahifalari uchun CMS HTML tozalash.
 */
export function enhanceAdmissionHtml(html: string): string {
  if (!html?.trim()) return html;
  if (typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  stripLegacy(body);
  normalizeMedia(body);
  promoteHeadings(body);
  unwrapListHeadings(body);
  normalizeLists(body);
  normalizeParagraphs(body);
  normalizeTables(body);
  normalizeLinks(body);
  body.querySelectorAll("hr").forEach((hr) => {
    const div = hr.ownerDocument.createElement("div");
    div.className = "cms-admission-divider";
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

function normalizeMedia(body: HTMLElement) {
  body.querySelectorAll("iframe").forEach((iframe) => {
    const src = iframe.getAttribute("src") ?? "";
    if (!src) return;
    const wrap = body.ownerDocument.createElement("div");
    wrap.className = "cms-admission-video";
    iframe.removeAttribute("width");
    iframe.removeAttribute("height");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", "Video");
    iframe.parentElement?.replaceChild(wrap, iframe);
    wrap.appendChild(iframe);
  });

  body.querySelectorAll("img").forEach((img) => {
    img.removeAttribute("width");
    img.removeAttribute("height");
    img.removeAttribute("style");
    img.classList.add("cms-admission-img");
    img.setAttribute("loading", "lazy");
    const parent = img.parentElement;
    if (parent?.tagName === "P" && parent.childElementCount === 1) {
      const figure = body.ownerDocument.createElement("figure");
      figure.className = "cms-admission-figure";
      parent.replaceWith(figure);
      figure.appendChild(img);
    }
  });
}

function unwrapListHeadings(body: HTMLElement) {
  body.querySelectorAll("ul li h1, ul li h2, ul li h3").forEach((heading) => {
    const li = heading.closest("li");
    if (!li) return;
    const span = body.ownerDocument.createElement("span");
    span.className = "cms-admission-list-item-text";
    span.innerHTML = heading.innerHTML;
    heading.replaceWith(span);
  });
}

function promoteHeadings(body: HTMLElement) {
  body.querySelectorAll("h1, h2, h3, p, div").forEach((el) => {
    if (el.closest("table, ul, ol, figure, .cms-admission-video")) return;
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (el.tagName === "H1") {
      const h2 = body.ownerDocument.createElement("h2");
      h2.className = "cms-admission-section-title";
      h2.textContent = text;
      el.replaceWith(h2);
      return;
    }
    const strong = el.querySelector(":scope > strong, :scope > span > strong");
    if (!strong || text.length > 140) return;
    const strongText = strong.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (text !== strongText && text !== `${strongText}:`) return;
    const h3 = body.ownerDocument.createElement("h3");
    h3.className = "cms-admission-section-title";
    h3.innerHTML = strong.innerHTML.replace(/:\s*$/, "").trim();
    el.replaceWith(h3);
  });
}

function normalizeLists(body: HTMLElement) {
  body.querySelectorAll("ul, ol").forEach((list) => list.classList.add("cms-admission-list"));
}

function normalizeParagraphs(body: HTMLElement) {
  body.querySelectorAll("p").forEach((p) => {
    if (!p.textContent?.replace(/\u00a0/g, " ").trim() && !p.querySelector("img, iframe")) {
      p.remove();
      return;
    }
    if (!p.closest("figure")) p.classList.add("cms-admission-text");
  });
}

function normalizeTables(body: HTMLElement) {
  body.querySelectorAll("table").forEach((table) => {
    table.classList.add("cms-admission-table");
    const wrap = body.ownerDocument.createElement("div");
    wrap.className = "cms-admission-table-wrap";
    table.before(wrap);
    wrap.appendChild(table);
  });
}

function normalizeLinks(body: HTMLElement) {
  body.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    if (/^https?:\/\//i.test(href)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      a.classList.add("cms-admission-link");
    }
  });
}
