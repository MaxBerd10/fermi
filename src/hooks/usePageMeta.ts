import { useEffect } from "react";

const SITE_NAME = "FJSTI.uz";
const DEFAULT_TITLE = "Farg'ona Jamoat Salomatligi Tibbiyot Instituti | FJSTI.uz — Rasmiy sayt";
const DEFAULT_DESCRIPTION =
  "Farg'ona jamoat salomatligi tibbiyot instituti (FJSTI) rasmiy veb-sayti. Qabul 2026, bakalavriat, magistratura, ordinatura, doktorantura. Zamonaviy tibbiy ta'lim Farg'ona shahri, Yangi Turon 2-a.";

/**
 * This is a pure client-side SPA (no SSR/prerendering), so without this,
 * every route keeps the static <title>/<meta description> from index.html —
 * a shared news/faculty/page link posted anywhere (the institute's own
 * Telegram channel included) previews as the homepage, not the actual
 * content. Resets to the site default on unmount so a page that forgets to
 * call this never inherits a stale title left behind by the previous route.
 */
export function usePageMeta(title?: string | null, description?: string | null) {
  useEffect(() => {
    if (title) document.title = `${title} | ${SITE_NAME}`;

    const descTag = document.querySelector('meta[name="description"]');
    if (description && descTag) descTag.setAttribute("content", description);

    return () => {
      document.title = DEFAULT_TITLE;
      if (descTag) descTag.setAttribute("content", DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
}
