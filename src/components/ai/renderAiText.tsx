import { Fragment, type ReactNode } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";

const MD_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const BARE_URL = /(https?:\/\/[^\s<>"']+|\/(?:[a-zA-Z0-9#?&=/_.-])+)/g;

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:");
}

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "").split("?")[0];
  if (!id) return;
  const go = () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  go();
  window.setTimeout(go, 120);
  window.setTimeout(go, 350);
}

/** Navigate from AI chat/source links (closes widget via event). */
export function goAiHref(href: string, navigate: NavigateFunction) {
  const cleaned = href.trim().replace(/[),.;]+$/, "");
  if (!cleaned) return;

  window.dispatchEvent(new Event("fjsti-ai-close"));

  if (isExternal(cleaned)) {
    window.open(cleaned, "_blank", "noopener,noreferrer");
    return;
  }

  let pathname = cleaned;
  let hash = "";

  if (cleaned.startsWith("/#")) {
    pathname = "/";
    hash = cleaned.slice(2);
  } else if (cleaned.startsWith("#")) {
    pathname = window.location.pathname || "/";
    hash = cleaned.slice(1);
  } else if (cleaned.includes("#")) {
    const i = cleaned.indexOf("#");
    pathname = cleaned.slice(0, i) || "/";
    hash = cleaned.slice(i + 1);
  }

  navigate(hash ? { pathname, hash } : pathname);

  if (hash) {
    scrollToHash(hash);
  } else {
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }
}

function Linkish({
  href,
  children,
  onDark,
  navigate,
}: {
  href: string;
  children: ReactNode;
  onDark?: boolean;
  navigate: NavigateFunction;
}) {
  const cls = onDark
    ? "underline font-semibold text-[#ffd600] hover:text-white cursor-pointer"
    : "underline font-semibold text-[#0a1158] hover:text-[#060a3d] cursor-pointer";

  const cleaned = href.trim();

  if (isExternal(cleaned)) {
    return (
      <a
        href={cleaned}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onClick={() => window.dispatchEvent(new Event("fjsti-ai-close"))}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={cleaned.startsWith("#") ? cleaned : cleaned}
      className={cls}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        goAiHref(cleaned, navigate);
      }}
    >
      {children}
    </a>
  );
}

/** Renders AI text with clickable [label](url) and bare URLs/paths */
export function renderAiText(text: string, onDark = false): ReactNode[] {
  // Hook must live in a component — use RenderAiText instead from callers that need navigate.
  // Kept for compatibility: wraps via inner component pattern below.
  return [<RenderAiTextInner key="ai-text" text={text} onDark={onDark} />];
}

function RenderAiTextInner({ text, onDark }: { text: string; onDark?: boolean }) {
  const navigate = useNavigate();
  const parts: ReactNode[] = [];
  let key = 0;
  const md = [...text.matchAll(MD_LINK)];

  type Seg = { type: "text" | "md"; start: number; end: number; label?: string; href?: string };
  const segs: Seg[] = [];
  let cursor = 0;
  for (const m of md) {
    const start = m.index ?? 0;
    if (start > cursor) segs.push({ type: "text", start: cursor, end: start });
    segs.push({ type: "md", start, end: start + m[0].length, label: m[1], href: m[2].trim() });
    cursor = start + m[0].length;
  }
  if (cursor < text.length) segs.push({ type: "text", start: cursor, end: text.length });
  if (!segs.length) segs.push({ type: "text", start: 0, end: text.length });

  for (const seg of segs) {
    if (seg.type === "md" && seg.href && seg.label) {
      parts.push(
        <Linkish key={key++} href={seg.href} onDark={onDark} navigate={navigate}>
          {seg.label}
        </Linkish>,
      );
      continue;
    }

    const chunk = text.slice(seg.start, seg.end);
    let bareLast = 0;
    const bares = [...chunk.matchAll(BARE_URL)];
    if (!bares.length) {
      parts.push(<Fragment key={key++}>{chunk}</Fragment>);
      continue;
    }
    for (const b of bares) {
      const i = b.index ?? 0;
      if (i > bareLast) parts.push(<Fragment key={key++}>{chunk.slice(bareLast, i)}</Fragment>);
      const href = b[1];
      if (href.startsWith("/") && href.length < 2) {
        parts.push(<Fragment key={key++}>{href}</Fragment>);
      } else {
        parts.push(
          <Linkish key={key++} href={href} onDark={onDark} navigate={navigate}>
            {href.startsWith("http") ? href.replace(/^https?:\/\//, "") : href}
          </Linkish>,
        );
      }
      bareLast = i + href.length;
    }
    if (bareLast < chunk.length) parts.push(<Fragment key={key++}>{chunk.slice(bareLast)}</Fragment>);
  }

  return <>{parts}</>;
}
