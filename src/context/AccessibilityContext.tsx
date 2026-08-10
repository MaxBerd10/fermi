import { createContext, useContext, useState, type ReactNode } from "react";

interface AccessibilityContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  open: false,
  setOpen: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AccessibilityContext.Provider value={{ open, setOpen }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityPanel() {
  return useContext(AccessibilityContext);
}
