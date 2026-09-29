"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/parent") ||
    pathname?.startsWith("/teacher") ||
    pathname?.startsWith("/admin") ||
    pathname === "/login";

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return (
    <main className={`flex-grow ${isAppRoute ? "" : "pt-20"}`}>
      {children}
    </main>
  );
}
