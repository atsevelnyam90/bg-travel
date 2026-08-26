"use client";

import type { CSSProperties, ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSearch } from "./AppSearch";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";

/**
 * Нэг responsive бүтэц — desktop/mobile-д ТУСДАА файл хийгээгүй.
 *
 * Sidebar нь mobile дээр shadcn-ий Sheet болж хувирдаг (өөрөө зохицдог),
 * дээр нь хурдан хандалтад bottom nav нэмсэн. Хоёр өөр компонент болгож
 * салгах шаардлагагүй — интерактив загвар нь ижил (09-mobile-desktop.md §3).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const topSafeAreaStyle = {
    minHeight: "calc(3rem + env(safe-area-inset-top, 0px))",
    paddingTop: "env(safe-area-inset-top, 0px)",
  } as CSSProperties;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-clip">
        <header
          className="sticky top-0 z-20 flex shrink-0 items-end border-b bg-background/80 backdrop-blur-md"
          style={topSafeAreaStyle}
        >
          <div className="mx-auto flex h-12 w-full max-w-screen-2xl items-center gap-3 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <AppSearch />
          </div>
        </header>

        <div className="mx-auto min-w-0 w-full max-w-screen-2xl flex-1 overflow-x-hidden p-4 md:p-6">
          {children}
        </div>

        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
