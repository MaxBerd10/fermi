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
  // Content pasted straight out of a PDF viewer's text layer survives as a run of
  // invisible, absolutely-positioned single-character <div>s ("S" "I" "D" "D" …).
  // Must run before stripPresentation() removes the style attribute this depends on.
  collapsePdfTextLayerArtifacts(body);
  stripPresentation(body);
  // Some list items smuggle a section heading in after an <hr> ("… <hr> For students
  // of the Clinical program:"). Lift that out into its own block before <hr>s are
  // dropped, so it doesn't get mashed onto the end of the list item.
  splitListItemsAtHr(body);
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

    // Aspect ratio alone can't tell a logo from a photo — both are typically landscape.
    // The CMS editor's default insertion width splits them cleanly in practice: real
    // logos/department icons land around 240-300px, while regular content photos default
    // to ~460px. Bound the width so this fallback only catches the logo-sized cluster —
    // without it, ~40% of all department photos were getting crushed into a 7rem logo box.
    if (/logo|gerb|emblem/.test(src) || (w > 0 && w <= 320 && h > 0 && h <= w * 0.85)) {
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

// A PDF viewer's text layer overlays one invisible, absolutely-positioned <div> per
// character/word on top of the rendered page so text can be selected — signature:
// position:absolute plus color:transparent. Selecting text there and pasting it into
// the CMS carries that whole fragment-per-character structure along, which then
// renders as one character per line (each <div> is block-level once its style is
// stripped). Detect runs of 2+ such siblings and collapse them into one text run.
function isPdfTextLayerFragment(el: Element): boolean {
  const style = el.getAttribute("style") ?? "";
  return /position\s*:\s*absolute/i.test(style) && /color\s*:\s*transparent/i.test(style);
}

function collapsePdfTextLayerArtifacts(root: Element) {
  const containers = [root, ...Array.from(root.querySelectorAll("*"))];
  containers.forEach((container) => {
    const nodes = Array.from(container.childNodes);
    let i = 0;
    while (i < nodes.length) {
      const start = nodes[i];
      if (!(start instanceof Element) || !isPdfTextLayerFragment(start)) {
        i++;
        continue;
      }
      // A run is fragment elements optionally interleaved with whitespace-only text
      // nodes (the "\r\n" between them in the source) — absorb those too, so no blank
      // lines are left behind once the fragments collapse into one line.
      const runNodes: Node[] = [start];
      const fragmentTexts: string[] = [start.textContent || ""];
      let j = i + 1;
      while (j < nodes.length) {
        const next = nodes[j];
        if (next instanceof Element && isPdfTextLayerFragment(next)) {
          runNodes.push(next);
          fragmentTexts.push(next.textContent || "");
          j++;
        } else if (next.nodeType === Node.TEXT_NODE && !(next.textContent || "").trim()) {
          runNodes.push(next);
          j++;
        } else {
          break;
        }
      }
      if (fragmentTexts.length >= 2) {
        const p = container.ownerDocument!.createElement("p");
        p.textContent = fragmentTexts.join("");
        runNodes[0].parentNode?.insertBefore(p, runNodes[0]);
        runNodes.forEach((n) => n.parentNode?.removeChild(n));
      }
      i = j;
    }
  });
}

function stripPresentation(root: ParentNode) {
  root.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
  // CMS content is sometimes pasted straight from an external page (ChatGPT, a PDF
  // viewer's own site chrome) rather than typed — that carries the source's own
  // classes (e.g. Tailwind's "flex"/"flex-col") along for the ride. Since fermi.uz's
  // frontend uses Tailwind too, those foreign classes actually apply and scramble the
  // layout. Every class we want on the rendered output is added by this file itself,
  // further down the pipeline, so it's safe to strip all incoming classes here.
  root.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));
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

function splitListItemsAtHr(root: ParentNode) {
  // Snapshot first — the tree is rewritten as we go.
  Array.from(root.querySelectorAll("li")).forEach((li) => {
    const list = li.parentElement;
    if (!list || (list.tagName !== "OL" && list.tagName !== "UL")) return;
    const hr = li.querySelector("hr");
    if (!hr) return;

    // Collect every node that comes after <hr> within this <li> — following siblings
    // of the <hr> and of each of its ancestors, up to the <li> itself.
    const tail: Node[] = [];
    let cursor: Node | null = hr;
    while (cursor && cursor !== li) {
      let sib = cursor.nextSibling;
      while (sib) {
        tail.push(sib);
        sib = sib.nextSibling;
      }
      cursor = cursor.parentNode;
    }
    hr.remove();
    tail.forEach((n) => n.parentNode?.removeChild(n));

    const tailText = tail
      .map((n) => n.textContent || "")
      .join("")
      .replace(/ /g, " ")
      .trim();
    const tailHasMedia = tail.some(
      (n) => n.nodeType === 1 && !!(n as Element).querySelector?.("img, table"),
    );
    // A bare trailing <hr> (decorative separator between items) — nothing to lift.
    if (!tailText && !tailHasMedia) {
      if (!li.textContent?.trim() && !li.querySelector("img")) li.remove();
      return;
    }

    const doc = li.ownerDocument!;
    const frag = doc.createDocumentFragment();
    const BLOCK = /^(P|DIV|H[1-6]|UL|OL|TABLE|FIGURE|BLOCKQUOTE)$/;
    tail.forEach((n) => {
      if (n.nodeType === 3) {
        const t = (n.textContent || "").trim();
        if (t) {
          const p = doc.createElement("p");
          p.textContent = t;
          frag.appendChild(p);
        }
      } else if (n.nodeType === 1) {
        const el = n as Element;
        if (BLOCK.test(el.tagName)) {
          frag.appendChild(el);
        } else {
          const p = doc.createElement("p");
          p.appendChild(el);
          frag.appendChild(p);
        }
      }
    });

    // Any <li>s that followed this one belong to a fresh list after the lifted block.
    const rest: Element[] = [];
    let sib = li.nextElementSibling;
    while (sib) {
      const next = sib.nextElementSibling;
      rest.push(sib);
      sib = next;
    }
    if (rest.length) {
      const newList = doc.createElement(list.tagName);
      rest.forEach((r) => newList.appendChild(r));
      frag.appendChild(newList);
    }

    list.after(frag);
    if (!li.textContent?.trim() && !li.querySelector("img")) li.remove();
  });
}

function normalizeLists(root: ParentNode) {
  root.querySelectorAll("li").forEach((li) => {
    li.classList.add("department-cms-item");

    // Some language versions wrap the item's text in a lone <p>/<div> (an artefact of
    // how it was pasted into the CMS), others put it straight in the <li>. Flatten the
    // wrapper so every version lines up against the number badge the same way.
    const kids = Array.from(li.children);
    if (
      kids.length === 1 &&
      (kids[0].tagName === "P" || kids[0].tagName === "DIV") &&
      !kids[0].querySelector("ul, ol, img, table")
    ) {
      const wrapper = kids[0];
      while (wrapper.firstChild) li.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    }
  });

  // In a department article every list is an enumeration (subjects taught, duties,
  // publications). Render them all with the same numbered style regardless of whether
  // that language's editor happened to use <ul> or <ol>.
  root.querySelectorAll("ul, ol").forEach((list) => {
    list.classList.add("department-cms-list", "department-cms-list--ordered");
  });
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
