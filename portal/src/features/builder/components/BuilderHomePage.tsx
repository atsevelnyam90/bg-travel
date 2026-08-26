"use client";

import { FileInput, LayoutList, Rows3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const items = [
  {
    title: "Dynamic Forms",
    href: "/winu/builder/forms",
    description: "Дан form schema үүсгэж, засаж, replicate хийнэ.",
    icon: FileInput,
  },
  {
    title: "Dynamic Lists",
    href: "/winu/builder/lists",
    description: "Дан list/grid column schema үүсгэж, засаж, replicate хийнэ.",
    icon: LayoutList,
  },
  {
    title: "Dynamic Views",
    href: "/winu/builder/views",
    description: "Form + List сонгож нийлүүлээд runtime route дээр дуудна.",
    icon: Rows3,
  },
];

export function BuilderHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Builder</h1>
        <p className="mt-1 text-muted-foreground">
          Form, List, View тус тусдаа үүсээд id/key-р runtime дээр дуудагдана.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.href} className="rounded-lg border bg-background p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <item.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-medium">{item.title}</h2>
                <p className="mt-1 text-muted-foreground text-sm">{item.description}</p>
              </div>
            </div>
            <Button asChild className="mt-4" size="sm">
              <Link href={item.href}>Нээх</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
