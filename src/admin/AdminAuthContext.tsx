import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { me } from "@/api/auth";
import { getAccessToken } from "@/api/client";
import type { AuthUser } from "@/types/content";

interface AdminAuthState {
  status: "loading" | "authed" | "unauthed";
  user: AuthUser | null;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminAuthState["status"]>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  async function check() {
    if (!getAccessToken()) {
      setStatus("unauthed");
      setUser(null);
      return;
    }
    try {
      const u = await me();
      if (u.role === "admin") {
        setUser(u);
        setStatus("authed");
      } else {
        setUser(null);
        setStatus("unauthed");
      }
    } catch {
      setUser(null);
      setStatus("unauthed");
    }
  }

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminAuthContext.Provider value={{ status, user, refresh: check }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
