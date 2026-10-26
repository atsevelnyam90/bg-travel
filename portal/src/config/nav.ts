import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Map as MapIcon, ShoppingCart } from "lucide-react";
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
    label: "Үндсэн цэс",
    items: [
      {
        label: "Хяналтын самбар",
        mobileLabel: "Самбар",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      { label: "Захиалга", href: "/admin/orders", icon: ShoppingCart, permission: "order:read" },
      { label: "Аялал", href: "/admin/travels", icon: MapIcon, permission: "org:manage" },
    ],
  },
];
