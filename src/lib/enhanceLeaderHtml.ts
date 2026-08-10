import { stripHtml } from "@/lib/html";

/**
 * Leader activity/biography HTML — strip legacy CKEditor inline styles
 * and apply readable semantic classes.
 */
export function enhanceLeaderHtml(html: string): string {
  if (!html?.trim()) return html;
  if (typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  stripPresentation(body);
  unwrapRedundant(body);
  removeEmptyBlocks(body);

  body.querySelectorAll("ul").forEach((ul) => ul.classList.add("leader-cms-list"));
  body.querySelectorAll("ol").forEach((ol) => ol.classList.add("leader-cms-list", "leader-cms-list--ordered"));
  body.querySelectorAll("li").forEach((li) => li.classList.add("leader-cms-item"));
  body.querySelectorAll("p").forEach((p) => p.classList.add("leader-cms-p"));
  body.querySelectorAll("strong, b").forEach((el) => el.classList.add("leader-cms-strong"));

  const processed = body.innerHTML.trim();
  return stripHtml(processed) ? processed : "";
}

function stripPresentation(root: ParentNode) {
  root.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
  root.querySelectorAll("font").forEach((font) => {
    const span = docCreateSpan(font);
    font.replaceWith(span);
  });

  function docCreateSpan(font: Element) {
    const span = font.ownerDocument!.createElement("span");
    span.innerHTML = font.innerHTML;
    return span;
  }
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
        const onlyBlock = Array.from(div.childNodes).every(
          (n) => n.nodeType === Node.TEXT_NODE || (n as Element).tagName === "SPAN",
        );
        if (onlyBlock) {
          div.replaceWith(...Array.from(div.childNodes));
          changed = true;
        }
      }
    });
  }
}

function removeEmptyBlocks(root: ParentNode) {
  root.querySelectorAll("p, li, div").forEach((el) => {
    const text = el.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!text && !el.querySelector("img, table, ul, ol")) {
      el.remove();
    }
  });
}
