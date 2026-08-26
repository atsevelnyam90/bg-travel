"use client";

import type { ReactNode } from "react";
import type { Permission } from "@/lib/permissions";
import { hasEvery, hasPermission, hasSome } from "@/lib/permissions";
import { useSession } from "./hooks/useSession";

/**
 * Session-той холбогдсон эрхийн шалгалт.
 *
 * `lib/permissions` нь цэвэр (React-гүй) үлдэнэ — энэ нь түүнийг session-д
 * холбож өгнө. Тиймээс дэлгэц бүрд ctx объект угсрах шаардлагагүй.
 */
export function usePermissions() {
  const { session } = useSession();
  const granted = session?.permissions ?? [];

  return {
    granted,
    can: (permission: Permission) => hasPermission(granted, permission),
    canEvery: (permissions: Permission[]) => hasEvery(granted, permissions),
    canSome: (permissions: Permission[]) => hasSome(granted, permissions),
  };
}

type CanProps = {
  do: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

/** UI-д эрхээр нуух. Хамгаалалт БИШ — backend үргэлж дахин шалгана. */
export function Can({ do: permission, children, fallback = null }: CanProps) {
  return usePermissions().can(permission) ? children : fallback;
}
