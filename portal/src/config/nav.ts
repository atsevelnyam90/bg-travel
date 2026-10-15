import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Globe,
  LayoutDashboard,
  Map as MapIcon,
  Package,
  Settings,
  ShoppingCart,
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
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Дэлгүүр",
    items: [
      { label: "Бараа", href: "/admin/products", icon: Package, permission: "product:read" },
      { label: "Захиалга", href: "/admin/orders", icon: ShoppingCart, permission: "order:read" },
    ],
  },
  {
    label: "Website",
    items: [
      { label: "Аялал", href: "/admin/travels", icon: MapIcon, permission: "org:manage" },
      {
        label: "Website pages",
        href: "/admin/website-pages",
        icon: Globe,
        permission: "org:manage",
      },
    ],
  },
  {
    label: "Удирдлага",
    items: [
      { label: "Хэрэглэгч", href: "/admin/users", icon: Users, permission: "user:read" },
      { label: "Аудит", href: "/admin/audit", icon: FileText, permission: "audit:read" },
      { label: "Тохиргоо", href: "/admin/settings", icon: Settings, permission: "org:manage" },
    ],
  },
];
