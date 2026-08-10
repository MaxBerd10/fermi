import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useLocation, useRoutes } from "react-router-dom";
import { useEffect } from "react";
import routes from "./config";

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    navigateResolver(window.REACT_APP_NAVIGATE);
  });

  useEffect(() => {
    if (hash) return;

    // `behavior: "instant"` bypasses the site-wide `scroll-behavior: smooth` on <html>,
    // which would otherwise animate this and can land short if the page's height shifts mid-scroll.
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    toTop();

    // New pages pull in async data (dropdown options, images) that reflow content above the
    // fold after the initial paint; re-assert the top position through that settling window
    // instead of only once, so the page doesn't end up drifting back down.
    const observer = new MutationObserver(toTop);
    observer.observe(document.body, { childList: true, subtree: true });
    const stopObserving = setTimeout(() => observer.disconnect(), 1200);

    return () => {
      observer.disconnect();
      clearTimeout(stopObserving);
    };
  }, [pathname, hash]);

  return element;
}
