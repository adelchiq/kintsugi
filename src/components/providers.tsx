"use client";

import { SessionProvider } from "next-auth/react";

import { AppProvider } from "@/context/app-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>{children}</AppProvider>
    </SessionProvider>
  );
}
