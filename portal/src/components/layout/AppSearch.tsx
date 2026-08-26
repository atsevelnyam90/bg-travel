"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { navSections } from "@/config/nav";
import { useVisibleNav } from "./useVisibleNav";

type SearchItem = {
  group: string;
  label: string;
  href: string;
  icon: (typeof navSections)[number]["items"][number]["icon"];
};

function groupItems(items: SearchItem[]) {
  return [...new Set(items.map((item) => item.group))].map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  }));
}

export function AppSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const sections = useVisibleNav(navSections);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.map((item) => ({
          group: section.label ?? "Ерөнхий",
          label: item.label,
          href: item.href,
          icon: item.icon,
        })),
      ),
    [sections],
  );

  const groups = groupItems(items);

  return (
    <>
      <Button
        variant="ghost"
        className="h-8 w-full max-w-72 justify-start gap-2 rounded-lg border-0 bg-transparent px-2 font-normal text-muted-foreground shadow-none hover:bg-muted/70 sm:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Хайх</span>
        <kbd className="ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px] sm:inline-flex">
          ⌘J
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command Palette"
        description="Цэс болон дэлгэц хайх"
      >
        <Command>
          <CommandInput placeholder="Дэлгэц хайх..." />
          <CommandList>
            <CommandEmpty>Илэрц олдсонгүй.</CommandEmpty>
            {groups.map(({ group, items: groupItems }, index) => (
              <Fragment key={group}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={group}>
                  {groupItems.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${group} ${item.label}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(item.href);
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
