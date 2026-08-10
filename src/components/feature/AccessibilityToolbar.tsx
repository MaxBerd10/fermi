import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAccessibilityPanel } from "../../context/AccessibilityContext";

const STORAGE_KEY = "fjsti_a11y";

type Theme = "normal" | "grayscale" | "high" | "invert" | "blue" | "brown";
type Spacing = 0 | 1 | 2;

type A11yState = {
  fontSize: number;
  zoom: number;
  letterSpacing: Spacing;
  wordSpacing: Spacing;
  lineHeight: Spacing;
  theme: Theme;
  hideImages: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  stopAnimations: boolean;
  largeCursor: boolean;
};

const DEFAULTS: A11yState = {
  fontSize: 100,
  zoom: 100,
  letterSpacing: 0,
  wordSpacing: 0,
  lineHeight: 0,
  theme: "normal",
  hideImages: false,
  underlineLinks: false,
  readableFont: false,
  stopAnimations: false,
  largeCursor: false,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function loadState(): A11yState {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

function applyDom(s: A11yState) {
  const root = document.documentElement;
  root.style.fontSize = `${s.fontSize}%`;
  root.style.setProperty("--a11y-zoom", `${s.zoom / 100}`);

  const classes = [
    "a11y-theme-normal",
    "a11y-theme-grayscale",
    "a11y-theme-high",
    "a11y-theme-invert",
    "a11y-theme-blue",
    "a11y-theme-brown",
    "a11y-ls-0",
    "a11y-ls-1",
    "a11y-ls-2",
    "a11y-ws-0",
    "a11y-ws-1",
    "a11y-ws-2",
    "a11y-lh-0",
    "a11y-lh-1",
    "a11y-lh-2",
    "a11y-hide-images",
    "a11y-underline-links",
    "a11y-readable-font",
    "a11y-stop-animations",
    "a11y-large-cursor",
    "a11y-zoomed",
  ];
  root.classList.remove(...classes);

  root.classList.add(`a11y-theme-${s.theme}`);
  root.classList.add(`a11y-ls-${s.letterSpacing}`);
  root.classList.add(`a11y-ws-${s.wordSpacing}`);
  root.classList.add(`a11y-lh-${s.lineHeight}`);
  if (s.hideImages) root.classList.add("a11y-hide-images");
  if (s.underlineLinks) root.classList.add("a11y-underline-links");
  if (s.readableFont) root.classList.add("a11y-readable-font");
  if (s.stopAnimations) root.classList.add("a11y-stop-animations");
  if (s.largeCursor) root.classList.add("a11y-large-cursor");
  if (s.zoom !== 100) root.classList.add("a11y-zoomed");
}

export default function AccessibilityToolbar() {
  const { t } = useTranslation();
  const { open, setOpen } = useAccessibilityPanel();
  const titleId = useId();
  const [s, setS] = useState<A11yState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setS(loaded);
    applyDom(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyDom(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, [s, hydrated]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const patch = (partial: Partial<A11yState>) => setS((prev) => ({ ...prev, ...partial }));
  const reset = () => setS({ ...DEFAULTS });

  const spacingBtn = (
    current: Spacing,
    onPick: (v: Spacing) => void,
    labels: [string, string, string]
  ) => (
    <div className="grid grid-cols-3 gap-1.5">
      {([0, 1, 2] as Spacing[]).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className={`h-10 rounded-md border text-xs font-semibold cursor-pointer ${
            current === v
              ? "bg-primary-500 text-background-50 border-primary-500"
              : "bg-background-50 border-background-200 hover:bg-background-100 text-foreground-800"
          }`}
        >
          {labels[v]}
        </button>
      ))}
    </div>
  );

  const toggle = (
    key: keyof Pick<
      A11yState,
      "hideImages" | "underlineLinks" | "readableFont" | "stopAnimations" | "largeCursor"
    >,
    label: string,
    icon: string
  ) => (
    <button
      type="button"
      onClick={() => patch({ [key]: !s[key] })}
      className={`w-full flex items-center gap-3 px-3 h-11 rounded-md border text-sm font-medium cursor-pointer text-left ${
        s[key]
          ? "bg-primary-500 text-background-50 border-primary-500"
          : "bg-background-50 border-background-200 hover:bg-background-100 text-foreground-800"
      }`}
    >
      <i className={`${icon} text-lg shrink-0`} />
      <span className="flex-1">{label}</span>
      {s[key] && <i className="ri-check-line" />}
    </button>
  );

  const themes: { v: Theme; label: string; swatch: string }[] = [
    { v: "normal", label: t("a11y.standard"), swatch: "bg-background-50 text-foreground-900 border" },
    { v: "high", label: t("a11y.highContrast"), swatch: "bg-black text-yellow-300" },
    { v: "invert", label: t("a11y.invert"), swatch: "bg-black text-white" },
    { v: "grayscale", label: t("a11y.grayscale"), swatch: "bg-zinc-400 text-black" },
    { v: "blue", label: t("a11y.themeBlue"), swatch: "bg-sky-200 text-blue-900" },
    { v: "brown", label: t("a11y.themeBrown"), swatch: "bg-amber-100 text-amber-950" },
  ];

  const panel = open ? (
    <div className="fixed inset-0 z-[70] flex a11y-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="absolute inset-0 bg-primary-950/45" onClick={() => setOpen(false)} />
      <div className="relative w-[22rem] max-w-[100vw] h-full frosted-glass !rounded-none border-y-0 border-l-0 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-white/50 backdrop-blur-xl border-b border-primary-100/60">
          <h3 id={titleId} className="font-heading font-bold text-lg text-foreground-950 tracking-tight">
            {t("nav.accessibility")}
          </h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ios-icon-btn !bg-primary-50 !border-primary-100 text-foreground-700 cursor-pointer"
            aria-label={t("a11y.close")}
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="p-5 space-y-7">
          {/* Font size */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground-500 mb-3">
              {t("a11y.fontSize")}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => patch({ fontSize: clamp(s.fontSize - 10, 90, 160) })}
                className="w-10 h-10 rounded-md border border-background-200 hover:bg-background-100 flex items-center justify-center cursor-pointer"
                aria-label={t("a11y.decrease")}
              >
                <span className="font-heading font-bold text-sm">A−</span>
              </button>
              <div className="flex-1 text-center font-heading font-bold text-lg tabular-nums">{s.fontSize}%</div>
              <button
                type="button"
                onClick={() => patch({ fontSize: clamp(s.fontSize + 10, 90, 160) })}
                className="w-10 h-10 rounded-md border border-background-200 hover:bg-background-100 flex items-center justify-center cursor-pointer"
                aria-label={t("a11y.increase")}
              >
                <span className="font-heading font-bold text-base">A+</span>
              </button>
            </div>
          </section>

          {/* Zoom */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground-500 mb-3">
              {t("a11y.zoom")}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => patch({ zoom: clamp(s.zoom - 10, 100, 150) })}
                className="w-10 h-10 rounded-md border border-background-200 hover:bg-background-100 flex items-center justify-center cursor-pointer"
              >
                <i className="ri-zoom-out-line" />
              </button>
              <div className="flex-1 text-center font-heading font-bold text-lg tabular-nums">{s.zoom}%</div>
              <button
                type="button"
                onClick={() => patch({ zoom: clamp(s.zoom + 10, 100, 150) })}
                className="w-10 h-10 rounded-md border border-background-200 hover:bg-background-100 flex items-center justify-center cursor-pointer"
              >
                <i className="ri-zoom-in-line" />
              </button>
            </div>
          </section>

          {/* Letter spacing */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground-500 mb-3">
              {t("a11y.letterSpacing")}
            </p>
            {spacingBtn(s.letterSpacing, (v) => patch({ letterSpacing: v }), [
              t("a11y.spacingNormal"),
              t("a11y.spacingMedium"),
              t("a11y.spacingLarge"),
            ])}
          </section>

          {/* Word spacing */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground-500 mb-3">
              {t("a11y.wordSpacing")}
            </p>
            {spacingBtn(s.wordSpacing, (v) => patch({ wordSpacing: v }), [
              t("a11y.spacingNormal"),
              t("a11y.spacingMedium"),
              t("a11y.spacingLarge"),
            ])}
          </section>

          {/* Line height */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground-500 mb-3">
              {t("a11y.lineHeight")}
            </p>
            {spacingBtn(s.lineHeight, (v) => patch({ lineHeight: v }), [
              t("a11y.spacingNormal"),
              t("a11y.spacingMedium"),
              t("a11y.spacingLarge"),
            ])}
          </section>

          {/* Colors */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground-500 mb-3">
              {t("a11y.colors")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => patch({ theme: o.v })}
                  className={`flex flex-col items-stretch rounded-md border overflow-hidden cursor-pointer text-left ${
                    s.theme === o.v ? "border-primary-500 ring-2 ring-primary-500/30" : "border-background-200"
                  }`}
                >
                  <span className={`h-8 flex items-center justify-center font-heading font-bold text-sm ${o.swatch}`}>
                    A
                  </span>
                  <span className="px-2 py-2 text-[11px] font-medium text-foreground-800 leading-tight">{o.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Toggles */}
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground-500 mb-3">
              {t("a11y.extra")}
            </p>
            {toggle("hideImages", t("a11y.hideImages"), "ri-image-off-line")}
            {toggle("underlineLinks", t("a11y.underlineLinks"), "ri-link")}
            {toggle("readableFont", t("a11y.readableFont"), "ri-font-size")}
            {toggle("stopAnimations", t("a11y.stopAnimations"), "ri-pause-circle-line")}
            {toggle("largeCursor", t("a11y.largeCursor"), "ri-cursor-line")}
          </section>

          <button
            type="button"
            onClick={reset}
            className="w-full h-11 rounded-md bg-background-100 hover:bg-background-200 text-foreground-800 text-sm font-semibold cursor-pointer"
          >
            {t("a11y.reset")}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return typeof document !== "undefined" ? createPortal(panel, document.body) : null;
}
