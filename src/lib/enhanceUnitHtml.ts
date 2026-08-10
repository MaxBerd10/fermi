/**
 * Institut bo'limlari CMS HTML — toza matn va ro'yxatlar.
 */
export function enhanceUnitHtml(html: string, variant?: "faq" | "contacts" | "documents"): string {
  if (!html?.trim()) return html;
  if (typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  stripPresentation(body);
  body.querySelectorAll("hr").forEach((hr) => hr.remove());
  unwrapRedundant(body);
  unwrapBodyWrappers(body);
  promoteSectionTitles(body);
  normalizeLists(body);
  normalizeParagraphs(body);
  normalizeImages(body);
  normalizeTables(body);

  if (variant === "faq") normalizeFaq(body);
  if (variant === "contacts") normalizeContactBlocks(body);

  return body.innerHTML;
}

function stripPresentation(root: ParentNode) {
  root.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
  root.querySelectorAll("font").forEach((font) => {
    const span = font.ownerDocument!.createElement("span");
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });
}

function unwrapRedundant(root: ParentNode) {
  let changed = true;
  while (changed) {
    changed = false;
    root.querySelectorAll("span").forEach((span) => {
      if (span.attributes.length === 0 && span.parentElement) {
        span.replaceWith(...Array.from(span.childNodes));
        changed = true;
      }
    });
    root.querySelectorAll("div").forEach((div) => {
      if (!div.classList.length && !div.attributes.length && div.parentElement?.tagName !== "BODY") {
        const text = div.textContent?.trim();
        if (!text) {
          div.remove();
          changed = true;
        } else if (!div.querySelector("table, ul, ol, img")) {
          const p = div.ownerDocument!.createElement("p");
          p.innerHTML = div.innerHTML;
          div.replaceWith(p);
          changed = true;
        }
      }
    });
  }
}

/** Markazlashtirilgan yoki ortiqcha tashqi div qoplamalarini ochish */
function unwrapBodyWrappers(body: HTMLElement) {
  let changed = true;
  while (changed) {
    changed = false;
    body.querySelectorAll(":scope > div").forEach((div) => {
      if (!div.classList.length && !div.attributes.length) {
        div.replaceWith(...Array.from(div.childNodes));
        changed = true;
      }
    });
  }
}

function promoteSectionTitles(body: HTMLElement) {
  body.querySelectorAll("p, div, h4").forEach((el) => {
    if (el.querySelector("ul, ol, table, img")) return;

    const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (!text) return;

    const strong = el.querySelector("strong, b");
    const strongText = strong?.textContent?.replace(/\s+/g, " ").trim().replace(/:$/, "") ?? "";

    const isTitleLike =
      strong &&
      strongText &&
      (text === strongText || text === `${strongText}:` || text.length - strongText.length < 4) &&
      /vazifa|yo'nalish|maqsad|faoliyat|tarkib|nizom|mas'uliyat|funksiya|hisob|vazifalar|markaz|haqida|tarkibi|faoliyati|tarixi|tarix|mutaxassislik|yo'nalishlar|hujjat/i.test(
        strongText,
      ) &&
      !/^\d*\.?\s*Savol:/i.test(text) &&
      !/^Javob:/i.test(text);

    if (!isTitleLike) return;

    const title = body.ownerDocument!.createElement("p");
    title.className = "unit-cms-section-title";
    title.textContent = strongText;
    el.replaceWith(title);
  });

  body.querySelectorAll("h4").forEach((h4) => {
    if (h4.classList.contains("unit-cms-section-title")) return;
    const text = h4.textContent?.replace(/\s+/g, " ").trim().replace(/:$/, "") ?? "";
    if (!text) return;
    const title = body.ownerDocument!.createElement("p");
    title.className = "unit-cms-section-title";
    title.textContent = text;
    h4.replaceWith(title);
  });
}

function normalizeLists(root: ParentNode) {
  root.querySelectorAll("ul").forEach((ul) => ul.classList.add("unit-cms-list"));
  root.querySelectorAll("ol").forEach((ol) => ol.classList.add("unit-cms-list", "unit-cms-list--ordered"));
  root.querySelectorAll("li").forEach((li) => {
    li.classList.add("unit-cms-item");
    const first = li.firstChild;
    if (first?.nodeType === Node.TEXT_NODE && /^[\s\-–—•]+/.test(first.textContent ?? "")) {
      first.textContent = (first.textContent ?? "").replace(/^[\s\-–—•]+/, "");
    }
  });
}

function normalizeParagraphs(root: ParentNode) {
  root.querySelectorAll("p").forEach((p) => {
    if (!p.classList.contains("unit-cms-section-title")) {
      p.classList.add("unit-cms-p");
    }
  });
  root.querySelectorAll("strong, b").forEach((el) => {
    if (!el.closest(".unit-cms-section-title")) {
      el.classList.add("unit-cms-strong");
    }
  });
}

function normalizeImages(root: ParentNode) {
  root.querySelectorAll("img").forEach((img) => {
    img.classList.add("unit-cms-img");
    img.setAttribute("loading", "lazy");
    img.removeAttribute("width");
    img.removeAttribute("height");
  });
}

function normalizeTables(root: ParentNode) {
  root.querySelectorAll("table").forEach((table) => {
    table.classList.add("unit-cms-table");
    const wrap = table.ownerDocument!.createElement("div");
    wrap.className = "unit-cms-table-wrap";
    table.parentElement?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
}

function normalizeFaq(body: HTMLElement) {
  body.querySelectorAll("p").forEach((p) => {
    const text = p.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (/^\d*\.?\s*Savol:/i.test(text)) {
      p.classList.add("unit-cms-faq-q");
    } else if (/^Javob:/i.test(text)) {
      p.classList.add("unit-cms-faq-a");
    }
  });
  body.querySelectorAll(".article-text, #article-text").forEach((el) => {
    el.classList.add("unit-cms-faq-block");
    el.removeAttribute("id");
  });
}

function normalizeContactBlocks(body: HTMLElement) {
  body.querySelectorAll(":scope > div").forEach((div) => {
    if (div.querySelector("table, ul, ol")) return;
    const strong = div.querySelector("strong, b");
    if (!strong) return;
    const text = div.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (text.length > 20 && text.length < 600) {
      div.classList.add("unit-cms-contact-card");
    }
  });
}
