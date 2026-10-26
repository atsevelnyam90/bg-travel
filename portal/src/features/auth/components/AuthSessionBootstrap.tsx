"use client";

import { useSession } from "../hooks/useSession";

/**
 * Session query-г route layout-аас хамааралгүй active байлгана.
 * Ингэснээр public ↔ admin client navigation query-г цуцлахгүй бөгөөд бүх guard
 * нэг QueryClient cache-ээс ижил auth state уншина.
 */
export function AuthSessionBootstrap() {
  useSession();
  return null;
}
