"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export type AppBuilderPresentationShellProps = {
  open: boolean;
  presentation: "dialog" | "drawer";
  title: string;
  description: string;
  onClose(): void;
  children: ReactNode;
};

export function AppBuilderPresentationShell({
  open,
  presentation,
  title,
  description,
  onClose,
  children,
}: AppBuilderPresentationShellProps) {
  if (presentation === "drawer") {
    return (
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent
          side="right"
          className="gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl data-[side=right]:lg:max-w-4xl"
        >
          <SheetHeader className="border-b bg-muted/20 px-5 py-4 pr-12">
            <SheetTitle className="text-lg">{title}</SheetTitle>
            <SheetDescription className="truncate">{description}</SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[88dvh] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="border-b bg-muted/20 px-5 py-4 pr-12">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="truncate">{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
