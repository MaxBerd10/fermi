import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useMenu } from "../../hooks/useMenu";
import { useApi } from "../../hooks/useApi";
import { getSettings } from "../../api/settings";
import { useAccessibilityPanel } from "../../context/AccessibilityContext";
import type { MenuNode } from "../../types/menu";
import BrandMark from "../shared/BrandMark";
import { normalizeYearLabels, normalizeMenuHref } from "@/lib/siteConstants";

const LOGO_IMG = "/images/logo.png?v=2";
const MORE_ID = -1;
const NAV_GAP = 1;

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const iconBtn = (solid: boolean) =>
  `ios-icon-btn cursor-pointer ${
    solid
      ? "!bg-primary-50/80 !border-primary-100/80 text-foreground-700 hover:!bg-primary-100"
      : "text-white"
  }`;

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [openMenuRect, setOpenMenuRect] = useState<Rect | null>(null);
  const [hoveredChild, setHoveredChild] = useState<number | null>(null);
  const [hoveredChildRect, setHoveredChildRect] = useState<Rect | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<"uz" | "ru" | "en">((i18n.language?.slice(0, 2) as "uz" | "ru" | "en") || "uz");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(0);
  const { setOpen: setA11yOpen } = useAccessibilityPanel();

  const { menu } = useMenu();
  const { data: settings } = useApi(getSettings, []);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navMeasureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = navContainerRef.current;
    const measure = navMeasureRef.current;
    if (!container || !measure) return;

    function recompute() {
      const available = container!.clientWidth;
      const itemEls = Array.from(measure!.querySelectorAll<HTMLElement>("[data-measure-item]"));
      const moreEl = measure!.querySelector<HTMLElement>("[data-measure-more]");
      const widths = itemEls.map((el) => el.getBoundingClientRect().width);
      const moreWidth = moreEl ? moreEl.getBoundingClientRect().width : 0;

      const totalAll = widths.reduce((sum, w, i) => sum + w + (i > 0 ? NAV_GAP : 0), 0);
      if (totalAll <= available) {
        setVisibleCount(widths.length);
        return;
      }

      const budget = available - moreWidth - NAV_GAP;
      let total = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = total + (count > 0 ? NAV_GAP : 0) + widths[i];
        if (next > budget) break;
        total = next;
        count++;
      }
      setVisibleCount(count);
    }

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [menu]);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpenMenu(null);
      setOpenMenuRect(null);
      setHoveredChild(null);
      setHoveredChildRect(null);
    }, 280);
  };
  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    // The dropdown portals are positioned from a one-time getBoundingClientRect() snapshot,
    // so they don't track the trigger as the page scrolls — close them instead of letting
    // them float disconnected from their trigger.
    function closeOnScroll() {
      cancelClose();
      setOpenMenu(null);
      setOpenMenuRect(null);
      setHoveredChild(null);
      setHoveredChildRect(null);
    }
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, []);

  // Light hero banners need dark frosted nav for readable contrast
  const solid = true;

  useEffect(() => {
    setOpenMenu(null);
    setOpenMenuRect(null);
    setHoveredChild(null);
    setHoveredChildRect(null);
    setMobileOpen(false);
    setShowLangMenu(false);
    setShowSearch(false);
  }, [location.pathname]);

  function changeLanguage(l: "uz" | "ru" | "en") {
    setShowLangMenu(false);
    localStorage.setItem("i18nextLng", l);
    window.location.reload();
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearch(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  const isExternal = (url: string) => url.startsWith("http");

  const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode; className: string }) => {
    if (isExternal(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      );
    }
    if (!href || href === "#") {
      return (
        <a href="#" onClick={(e) => e.preventDefault()} className={className}>
          {children}
        </a>
      );
    }
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  };

  const visibleItems = menu.slice(0, visibleCount);
  const overflowItems = menu.slice(visibleCount);

  const openItem =
    openMenu === MORE_ID
      ? ({ id: MORE_ID, title: "", urlType: "", urlValue: "", href: "#", children: overflowItems } as MenuNode)
      : openMenu !== null
      ? menu.find((m) => m.id === openMenu)
      : null;
  const hoveredChildNode = hoveredChild !== null ? openItem?.children.find((c) => c.id === hoveredChild) : null;

  return (
    <>
      <header className="w-full sticky top-0 z-50">
        {/* Main nav bar */}
        <div className={`relative transition-all duration-300 ${solid ? "nav-glass" : "nav-glass-clear"}`}>
          <div className="section-container flex items-center justify-between gap-2 sm:gap-3 h-[56px] md:h-[64px]">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0 min-w-0">
              <img
                src={LOGO_IMG}
                alt={settings?.logo?.title || "FerMI — Fergana Medical Institute"}
                className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain drop-shadow-sm flex-shrink-0"
              />
              <BrandMark
                size="md"
                showFull
                className={`brand-fermi--nav ${solid ? "text-primary-950" : "text-white"}`}
              />
            </Link>

            <nav ref={navContainerRef} className="hidden lg:flex items-center justify-end gap-px flex-1 min-w-0">
              {visibleItems.map((item: MenuNode) => (
                <div
                  key={item.id}
                  className="relative flex-shrink-0"
                  onMouseEnter={(e) => {
                    cancelClose();
                    setOpenMenu(item.id);
                    setOpenMenuRect(e.currentTarget.getBoundingClientRect());
                    setHoveredChild(null);
                    setHoveredChildRect(null);
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <NavLink
                    href={normalizeMenuHref(item.href)}
                    className={`flex items-center gap-px px-1.5 py-1.5 font-heading text-[12px] font-semibold tracking-normal cursor-pointer whitespace-nowrap rounded-full transition-colors duration-200 ${
                      solid
                        ? "text-foreground-700 hover:text-primary-800 hover:bg-primary-50/70"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    } ${
                      openMenu === item.id
                        ? solid
                          ? "text-primary-800 bg-primary-50/80"
                          : "text-white bg-white/15"
                        : ""
                    }`}
                  >
                    {normalizeYearLabels(item.title.trim())}
                    {item.children.length > 0 && (
                      <i
                        className={`ri-arrow-down-s-line text-xs opacity-50 transition-transform duration-200 ${
                          openMenu === item.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </NavLink>
                </div>
              ))}

              {overflowItems.length > 0 && (
                <div
                  className="relative flex-shrink-0"
                  onMouseEnter={(e) => {
                    cancelClose();
                    setOpenMenu(MORE_ID);
                    setOpenMenuRect(e.currentTarget.getBoundingClientRect());
                    setHoveredChild(null);
                    setHoveredChildRect(null);
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    className={`flex items-center gap-px px-1.5 py-1.5 font-heading text-[12px] font-semibold tracking-normal cursor-pointer whitespace-nowrap rounded-full transition-colors duration-200 ${
                      solid
                        ? "text-foreground-700 hover:text-primary-800 hover:bg-primary-50/70"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    } ${
                      openMenu === MORE_ID
                        ? solid
                          ? "text-primary-800 bg-primary-50/80"
                          : "text-white bg-white/15"
                        : ""
                    }`}
                  >
                    {t("nav.more")}
                    <i
                      className={`ri-arrow-down-s-line text-xs opacity-50 transition-transform duration-200 ${
                        openMenu === MORE_ID ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              )}
            </nav>

            {/* Off-screen row used only to measure natural item widths for the priority nav above */}
            <div ref={navMeasureRef} className="fixed -top-[9999px] left-0 flex items-center gap-px pointer-events-none" aria-hidden="true">
              {menu.map((item: MenuNode) => (
                <span
                  key={item.id}
                  data-measure-item
                  className="flex items-center gap-px px-1.5 py-1.5 font-heading text-[12px] font-semibold tracking-normal whitespace-nowrap"
                >
                  {normalizeYearLabels(item.title.trim())}
                  {item.children.length > 0 && <i className="ri-arrow-down-s-line text-xs opacity-50" />}
                </span>
              ))}
              <span
                data-measure-more
                className="flex items-center gap-px px-1.5 py-1.5 font-heading text-[12px] font-semibold tracking-normal whitespace-nowrap"
              >
                {t("nav.more")}
                <i className="ri-arrow-down-s-line text-xs opacity-50" />
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={iconBtn(solid)}
                aria-label={t("nav.search")}
              >
                <i className="ri-search-line text-lg" />
              </button>

              <button
                type="button"
                onClick={() => setA11yOpen(true)}
                className={`hidden md:flex ${iconBtn(solid)}`}
                aria-label={t("nav.accessibility")}
                title={t("nav.accessibility")}
              >
                <i className="ri-eye-line text-lg" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`${iconBtn(solid)} !w-auto !px-2.5 gap-1 uppercase text-xs font-semibold`}
                  aria-label="Language"
                >
                  {lang}
                  <i className="ri-arrow-down-s-line text-[10px] opacity-60" />
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-1.5 z-20 min-w-[148px] frosted-glass py-1.5 shadow-xl overflow-hidden">
                    {(["uz", "ru", "en"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => changeLanguage(l)}
                        className={`w-full text-left px-3.5 py-2.5 text-sm cursor-pointer transition-colors duration-200 ${
                          lang === l
                            ? "bg-primary-50/90 text-primary-800 font-semibold"
                            : "text-foreground-600 hover:bg-background-100/80"
                        }`}
                      >
                        {l === "uz" ? "O’zbek" : l === "ru" ? "Русский" : "English"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/qabul"
                className="hidden md:inline-flex items-center h-9 px-4 rounded-full bg-[#0a1158] hover:bg-[#060a3d] text-white text-[0.8125rem] font-semibold shadow-[0_6px_16px_rgba(10,17,88,0.28)] transition-colors cursor-pointer ml-0.5"
              >
                {t("footer.qabul")}
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:!hidden ${iconBtn(solid)}`}
                aria-label={t("nav.menu")}
              >
                <i className={`${mobileOpen ? "ri-close-line" : "ri-menu-line"} text-xl`} />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="absolute left-0 right-0 top-full frosted-glass !rounded-none border-x-0 py-3 sm:py-4 shadow-[0_16px_40px_rgba(20,24,40,0.1)]">
              <div className="section-container">
                <form className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3" onSubmit={onSearchSubmit}>
                  <div className="flex-1 relative min-w-0">
                    <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("nav.searchPlaceholder")}
                      className="w-full h-11 pl-11 pr-4 rounded-full border border-primary-100/80 bg-white/70 text-base focus:outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100/50 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="uni-btn !h-11 flex-1 sm:flex-none cursor-pointer">
                      {t("nav.searchSubmit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="ios-icon-btn !bg-primary-50 !border-primary-100 text-foreground-700 cursor-pointer"
                      aria-label="Close"
                    >
                      <i className="ri-close-line text-xl" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {mobileOpen && (
            <div className="lg:!hidden frosted-glass nav-dropdown-panel !rounded-none border-x-0 max-h-[calc(100dvh-56px)] overflow-y-auto overscroll-contain">
              <nav className="px-3 sm:px-4 py-3 sm:py-4 space-y-0.5">
                {menu.map((item: MenuNode) => (
                  <details key={item.id} className="group overflow-hidden">
                    <summary className="flex items-center justify-between min-h-[44px] px-3 py-3 text-sm font-semibold tracking-wide text-foreground-800 cursor-pointer list-none hover:bg-primary-50/70 transition-colors rounded-xl">
                      <span className="pr-2">{normalizeYearLabels(item.title.trim())}</span>
                      {item.children.length > 0 && (
                        <i className="ri-arrow-down-s-line text-foreground-400 transition-transform duration-200 group-open:rotate-180 flex-shrink-0" />
                      )}
                    </summary>
                    <div className="px-2 pb-2 space-y-0.5 border-l border-primary-100 ml-3">
                      {item.children.map((child) =>
                        child.children.length > 0 ? (
                          <details key={child.id} className="group/inner">
                            <summary className="flex items-center justify-between min-h-[44px] px-3 py-2.5 text-sm font-medium text-foreground-600 cursor-pointer list-none hover:bg-background-100 transition-colors rounded-lg">
                              <span className="pr-2">{normalizeYearLabels(child.title)}</span>
                              <i className="ri-arrow-down-s-line text-xs text-foreground-400 transition-transform duration-200 group-open/inner:rotate-180 flex-shrink-0" />
                            </summary>
                            <div className="pl-3 py-1 space-y-0.5">
                              {child.children.map((grandchild) => (
                                <NavLink
                                  key={grandchild.id}
                                  href={normalizeMenuHref(grandchild.href)}
                                  className="block min-h-[40px] px-3 py-2 text-sm text-foreground-500 hover:text-primary-800 hover:bg-primary-50 cursor-pointer transition-colors rounded-lg"
                                >
                                  {normalizeYearLabels(grandchild.title)}
                                </NavLink>
                              ))}
                            </div>
                          </details>
                        ) : (
                          <NavLink
                            key={child.id}
                            href={normalizeMenuHref(child.href)}
                            className="block min-h-[44px] px-3 py-2.5 text-sm font-medium text-foreground-600 hover:text-primary-800 hover:bg-primary-50 cursor-pointer transition-colors rounded-lg"
                          >
                            {normalizeYearLabels(child.title)}
                          </NavLink>
                        )
                      )}
                    </div>
                  </details>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setA11yOpen(true);
                  }}
                  className="md:hidden w-full flex items-center gap-2 min-h-[44px] px-3 py-3 text-sm font-semibold text-foreground-800 hover:bg-primary-50/70 rounded-xl cursor-pointer"
                >
                  <i className="ri-eye-line text-lg" />
                  {t("nav.accessibility")}
                </button>
                <Link
                  to="/qabul"
                  className="uni-btn-gold w-full mt-3 cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("footer.qabul")}
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {openItem && openMenuRect && openItem.children.length > 0 &&
        createPortal(
          <div
            className="fixed z-[60] w-72 min-w-[18rem]"
            style={{ left: openMenuRect.left, top: openMenuRect.bottom + 4 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div
              className="nav-dropdown-panel py-2 max-h-[70vh] overflow-y-auto animate-fade-in-up"
              style={{ animationDuration: "0.1s" }}
            >
              {openItem.children.map((child) => (
                <div
                  key={child.id}
                  onMouseEnter={(e) => {
                    cancelClose();
                    setHoveredChild(child.id);
                    setHoveredChildRect(e.currentTarget.getBoundingClientRect());
                  }}
                >
                  <NavLink
                    href={normalizeMenuHref(child.href)}
                    className="group flex items-center justify-between gap-3 mx-1.5 px-3.5 py-2.5 font-heading text-sm font-medium text-foreground-800 hover:text-primary-800 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors duration-200 leading-snug"
                  >
                    <span className="line-clamp-2">{normalizeYearLabels(child.title)}</span>
                    {child.children.length > 0 && (
                      <i className="ri-arrow-right-s-line text-foreground-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </NavLink>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}

      {hoveredChildNode && hoveredChildRect && hoveredChildNode.children.length > 0 &&
        createPortal(
          <div
            className="fixed z-[70] w-80 min-w-[20rem] max-w-[22rem]"
            style={{ left: hoveredChildRect.right + 4, top: hoveredChildRect.top - 4 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div
              className="nav-dropdown-panel py-2 max-h-[70vh] overflow-y-auto animate-fade-in-up"
              style={{ animationDuration: "0.08s" }}
            >
              {hoveredChildNode.children.map((grandchild) => (
                <NavLink
                  key={grandchild.id}
                  href={normalizeMenuHref(grandchild.href)}
                  className="block mx-1.5 px-3.5 py-2.5 font-heading text-sm font-medium text-foreground-800 hover:text-primary-800 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors duration-200 leading-snug"
                >
                  <span className="line-clamp-2">{normalizeYearLabels(grandchild.title)}</span>
                </NavLink>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
