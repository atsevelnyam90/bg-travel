"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";
import { RequireAuth } from "@/features/auth/components/RequireAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
