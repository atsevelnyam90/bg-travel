"use client";

import { useMemo } from "react";
import type { NavItem, NavSection } from "@/config/nav";
import { usePermissions } from "@/features/auth";

/**
 * Цэсийг хэрэглэгчийн эрхээр шүүнэ.
 *
 * ⚠️ Энэ бол ХАРАГДАЦ. Эрхгүй хүн URL-ыг гараар бичиж орж болно —
 * бодит хамгаалалт нь backend-ийн requirePermission (05-permissions.md §3).
 */
export function useVisibleNav(sections: NavSection[]): NavSection[] {
  const { granted } = usePermissions();

  return useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: section.items
            .map((item) => filterNavItem(item, granted))
            .filter((item): item is NavItem => Boolean(item)),
        }))
        // Бүх зүйл нь шүүгдсэн хэсгийн гарчиг ганцаараа үлдэхээс сэргийлнэ.
        .filter((section) => section.items.length > 0),
    [sections, granted],
  );
}

function filterNavItem(item: NavItem, granted: readonly string[]): NavItem | null {
  if (item.permission && !granted.includes(item.permission)) return null;

  const children = item.children
    ?.map((child) => filterNavItem(child, granted))
    .filter((child): child is NavItem => Boolean(child));

  return { ...item, children };
}
