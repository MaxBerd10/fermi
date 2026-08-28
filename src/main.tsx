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

