/**
 * Faculty CMS HTML — strip legacy CKEditor styles and apply readable layout.
 */
export function enhanceFacultyHtml(html: string): string {
  if (!html?.trim()) return html;
  if (typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  stripPresentation(body);
  splitHrListItems(body);
  unwrapRedundant(body);
  promoteMissionBlock(body);
  normalizeLists(body);
  normalizeParagraphs(body);

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
        const onlyInline = Array.from(div.childNodes).every(
          (n) =>
            n.nodeType === Node.TEXT_NODE ||
            ["SPAN", "STRONG", "B", "EM", "I"].includes((n as Element).tagName ?? ""),
        );
        if (onlyInline || div.textContent?.trim() === "") {
          if (div.textContent?.trim()) {
            const p = div.ownerDocument!.createElement("p");
            p.innerHTML = div.innerHTML;
            div.replaceWith(p);
          } else {
            div.remove();
          }
          changed = true;
        }
      }
    });
  }
}

function splitHrListItems(root: ParentNode) {
  root.querySelectorAll("hr").forEach((hr) => hr.remove());
}

function promoteMissionBlock(body: HTMLElement) {
  const first = body.firstElementChild;
  if (!first) return;
  const text = first.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (/vazifasi/i.test(text) && text.length > 80) {
    first.remove();
    const next = body.firstElementChild;
    if (next && !next.textContent?.trim()) next.remove();
  }
}

function normalizeLists(root: ParentNode) {
  root.querySelectorAll("ul").forEach((ul) => ul.classList.add("faculty-cms-list"));
  root.querySelectorAll("ol").forEach((ol) => ol.classList.add("faculty-cms-list", "faculty-cms-list--ordered"));
  root.querySelectorAll("li").forEach((li) => li.classList.add("faculty-cms-item"));
}

function normalizeParagraphs(root: ParentNode) {
  root.querySelectorAll("p").forEach((p) => p.classList.add("faculty-cms-p"));
  root.querySelectorAll("strong, b").forEach((el) => el.classList.add("faculty-cms-strong"));
}
