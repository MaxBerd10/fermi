/**
 * Department CMS HTML — strip legacy styles, compact staff portraits, readable layout.
 */
export function enhanceDepartmentHtml(html: string, options?: { excludeStaffName?: string }): string {
  if (!html?.trim()) return html;

  const stripped = stripHeavyBase64Images(html);
  if (typeof DOMParser === "undefined") return stripped;

  const doc = new DOMParser().parseFromString(stripped, "text/html");
  const body = doc.body;

  classifyImagesFromStyle(body);
  stripPresentation(body);
  body.querySelectorAll("hr").forEach((hr) => hr.remove());
  unwrapRedundant(body);
  buildStaffCards(body, options?.excludeStaffName);
  removeHeroDuplicateLogo(body);
  finalizeImages(body);
  normalizeLists(body);
  normalizeParagraphs(body);

  return body.innerHTML;
}

function stripHeavyBase64Images(html: string): string {
  return html.replace(/src="data:image\/[^"]+"/gi, 'src="" data-inline-stripped="true"');
}

function readInlineDimensions(img: Element): { w: number; h: number } {
  const style = img.getAttribute("style") ?? "";
  const wMatch = style.match(/width:\s*(\d+)px/i) ?? style.match(/width=(\d+)/i);
  const hMatch = style.match(/height:\s*(\d+)px/i) ?? style.match(/height=(\d+)/i);
  return {
    w: wMatch ? Number(wMatch[1]) : Number(img.getAttribute("width") || 0),
    h: hMatch ? Number(hMatch[1]) : Number(img.getAttribute("height") || 0),
  };
}

function classifyImagesFromStyle(root: ParentNode) {
  root.querySelectorAll("img").forEach((img) => {
    if (img.getAttribute("data-inline-stripped") === "true" || !img.getAttribute("src")) return;

    const src = (img.getAttribute("src") ?? "").toLowerCase();
    const { w, h } = readInlineDimensions(img);

    if (/logo|gerb|emblem/.test(src) || (w >= 280 && h > 0 && h <= w * 0.85)) {
      img.dataset.imgKind = "logo";
      return;
    }

    if (w > 0 && h > 0 && h >= w * 1.15 && w <= 280) {
      img.dataset.imgKind = "portrait";
      return;
    }

    if (h > 420 || w > 520) {
      img.dataset.imgKind = "banner";
      return;
    }

    img.dataset.imgKind = "inline";
  });
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

function imgOuterBlock(img: HTMLImageElement): HTMLElement | null {
  let node: HTMLElement | null = img.parentElement;
  while (node && node.tagName !== "BODY") {
    const text = node.textContent?.replace(/\s+/g, "").trim() ?? "";
    const imgCount = node.querySelectorAll("img").length;
    if (imgCount === 1 && text.length < 8) return node;
    if (node.parentElement?.tagName === "BODY") return node;
    node = node.parentElement;
  }
  return img.parentElement;
}

function nextContentBlock(el: Element | null): HTMLElement | null {
  let node = el?.nextElementSibling ?? null;
  while (node) {
    if (node.tagName === "HR") {
      node = node.nextElementSibling;
      continue;
    }
    const text = node.textContent?.trim() ?? "";
    if (!text) {
      node = node.nextElementSibling;
      continue;
    }
    return node as HTMLElement;
  }
  return null;
}

function normalizePersonName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`'ʻʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function buildStaffCards(body: HTMLElement, excludeStaffName?: string) {
  const exclude = excludeStaffName ? normalizePersonName(excludeStaffName) : "";
  const portraits = Array.from(body.querySelectorAll('img[data-img-kind="portrait"]')) as HTMLImageElement[];
  if (portraits.length === 0) return;

  const cards: HTMLElement[] = [];

  for (const img of portraits) {
    const imgBlock = imgOuterBlock(img);
    if (!imgBlock || imgBlock.closest(".department-staff-card")) continue;

    const details = nextContentBlock(imgBlock);
    const card = body.ownerDocument!.createElement("article");
    card.className = "department-staff-card";

    const figure = body.ownerDocument!.createElement("figure");
    figure.className = "department-staff-card__photo";
    figure.appendChild(img.cloneNode(true));
    card.appendChild(figure);

    if (details) {
      const info = body.ownerDocument!.createElement("div");
      info.className = "department-staff-card__info";
      info.innerHTML = details.innerHTML;

      if (exclude) {
        const strong = info.querySelector("strong");
        const cardName = normalizePersonName(strong?.textContent ?? info.textContent ?? "");
        if (cardName.includes(exclude) || exclude.includes(cardName.split(" ").slice(0, 2).join(" "))) {
          imgBlock.remove();
          continue;
        }
      }

      card.appendChild(info);
      details.remove();
    }

    imgBlock.replaceWith(card);
    cards.push(card);
  }

  if (cards.length >= 2) {
    const grid = body.ownerDocument!.createElement("div");
    grid.className = "department-staff-grid";
    cards[0].parentNode?.insertBefore(grid, cards[0]);
    cards.forEach((card) => grid.appendChild(card));
  }
}

function removeHeroDuplicateLogo(body: HTMLElement) {
  const logo = body.querySelector('img[data-img-kind="logo"]');
  if (logo) {
    const block = imgOuterBlock(logo as HTMLImageElement);
    block?.remove();
  }
}

function finalizeImages(root: ParentNode) {
  root.querySelectorAll("img").forEach((img) => {
    if (img.getAttribute("data-inline-stripped") === "true" || !img.getAttribute("src")) {
      img.classList.add("department-cms-img--stripped");
      return;
    }

    const kind = img.getAttribute("data-img-kind") ?? "inline";
    img.classList.add("department-cms-img", `department-cms-img--${kind}`);
    img.setAttribute("loading", "lazy");
    img.removeAttribute("width");
    img.removeAttribute("height");
    img.removeAttribute("data-img-kind");
  });
}

function normalizeLists(root: ParentNode) {
  root.querySelectorAll("ul").forEach((ul) => ul.classList.add("department-cms-list"));
  root.querySelectorAll("ol").forEach((ol) => ol.classList.add("department-cms-list", "department-cms-list--ordered"));
  root.querySelectorAll("li").forEach((li) => li.classList.add("department-cms-item"));
}

function normalizeParagraphs(root: ParentNode) {
  root.querySelectorAll("p").forEach((p) => {
    if (!p.closest(".department-staff-card__info")) {
      p.classList.add("department-cms-p");
    }
  });
  root.querySelectorAll("strong, b").forEach((el) => el.classList.add("department-cms-strong"));
  root.querySelectorAll("h3, h4").forEach((el) => {
    if (!el.classList.contains("department-fallback-heading")) {
      el.classList.add("department-cms-subtitle");
    }
  });
}
