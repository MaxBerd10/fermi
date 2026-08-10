import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AccessibilityToolbar from "./AccessibilityToolbar";
import MedicalAtmosphere from "./MedicalAtmosphere";
import AiChatWidget from "./AiChatWidget";
import { MenuProvider } from "../../context/MenuContext";
import { AccessibilityProvider } from "../../context/AccessibilityContext";

export default function Layout() {
  return (
    <MenuProvider>
      <AccessibilityProvider>
        <div className="relative min-h-screen text-foreground-900 flex flex-col bg-transparent">
          <MedicalAtmosphere />
          <div id="a11y-content" className="relative z-10 flex flex-col flex-1 min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
          <AccessibilityToolbar />
          <AiChatWidget />
        </div>
      </AccessibilityProvider>
    </MenuProvider>
  );
}
