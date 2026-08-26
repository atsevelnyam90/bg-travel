import type { LucideIcon } from "lucide-react";
import {
  FileInput,
  FileText,
  Hammer,
  LayoutDashboard,
  LayoutList,
  Package,
  Rows3,
  Settings,
  Users,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

// Цэс бол КОД БИШ, ӨГӨГДӨЛ. Эрхээр шүүгдэнэ, клиент бүрт солиход амар.
export type NavItem = {
  label: string;
  mobileLabel?: string;
  href: string;
  icon: LucideIcon;
  /** Байхгүй бол бүх хэрэглэгчид харагдана. */
  permission?: Permission;
  children?: NavItem[];
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    items: [
      {
        label: "Хяналтын самбар",
        mobileLabel: "Самбар",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Дэлгүүр",
    items: [{ label: "Бараа", href: "/products", icon: Package, permission: "product:read" }],
  },
  {
    label: "Удирдлага",
    items: [
      { label: "Хэрэглэгч", href: "/users", icon: Users, permission: "user:read" },
      { label: "Аудит", href: "/audit", icon: FileText, permission: "audit:read" },
      {
        label: "Builder",
        href: "/winu/builder",
        icon: Hammer,
        permission: "org:manage",
        children: [
          {
            label: "Forms",
            href: "/winu/builder/forms",
            icon: FileInput,
            permission: "org:manage",
          },
          {
            label: "Lists",
            href: "/winu/builder/lists",
            icon: LayoutList,
            permission: "org:manage",
          },
          { label: "Views", href: "/winu/builder/views", icon: Rows3, permission: "org:manage" },
        ],
      },
      { label: "Тохиргоо", href: "/settings", icon: Settings, permission: "org:manage" },
    ],
  },
];
