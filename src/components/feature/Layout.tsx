import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MedicalAtmosphere from "./MedicalAtmosphere";
import { MenuProvider } from "../../context/MenuContext";

// The chat widget pulls in the AI client and the ~5 KB knowledge base, none of
// which the first paint needs — most visits never open it. Load it after the
// page is interactive; the only visible effect is the floating button appearing
// a beat later.
const AiChatWidget = lazy(() => import("./AiChatWidget"));

export default function Layout() {
  return (
    <MenuProvider>
      <div className="relative min-h-screen text-foreground-900 flex flex-col bg-transparent">
        <MedicalAtmosphere />
        <div className="relative z-10 flex flex-col flex-1 min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Suspense fallback={null}>
          <AiChatWidget />
        </Suspense>
      </div>
    </MenuProvider>
  );
}
