import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.css'
import './styles/cms-content.css'
import './styles/news-content.css'
import './styles/newspaper-content.css'
import './styles/regulatory-content.css'
import './styles/conference-content.css'
import './styles/buildings-content.css'
import './styles/leader-content.css'
import './styles/menu-section-content.css'
import './styles/faculty-content.css'
import './styles/department-content.css'
import './styles/unit-content.css'
import './styles/science-activity-content.css'
import './styles/admission-content.css'
import './styles/student-content.css'
import './styles/xorijiy-content.css'
import './styles/kongress-content.css'
import App from './App.tsx'
import ErrorBoundary from './components/shared/ErrorBoundary.tsx'

// index.html loads the Google Fonts / remixicon stylesheets with media="print" so they
// don't block the initial render — this flips each one to media="all" once it's actually
// loaded. This has to happen here (in the bundled, same-origin script) rather than via an
// inline onload="..." attribute on the <link> itself, because the site's CSP is
// `script-src 'self'` with no 'unsafe-inline', which silently blocks inline event handlers.
function activateDeferredStylesheets() {
  document.querySelectorAll<HTMLLinkElement>('link[data-defer-stylesheet]').forEach((link) => {
    const activate = () => { link.media = "all"; };
    // The resource may have already finished loading (from cache, or simply beaten this
    // script to it) before this listener attaches — `.sheet` is only non-null once loaded,
    // so check it directly instead of relying solely on an event that may have already fired.
    if (link.sheet) activate();
    else link.addEventListener("load", activate, { once: true });
  });
}

activateDeferredStylesheets();

function reloadOnceForStaleBuild() {
  try {
    if (sessionStorage.getItem("fermi-chunk-reload")) return false;
    sessionStorage.setItem("fermi-chunk-reload", "1");
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadOnceForStaleBuild();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

