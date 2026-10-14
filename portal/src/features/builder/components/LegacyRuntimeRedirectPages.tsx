"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function useLegacyRuntimeRedirect(targetPath: string) {
  const router = useRouter();
  const id = useSearchParams().get("id");

  useEffect(() => {
    router.replace(id ? `${targetPath}?id=${encodeURIComponent(id)}` : targetPath);
  }, [id, router, targetPath]);
}

export function LegacyDynamicFormRedirectPage() {
  useLegacyRuntimeRedirect("/admin/winu/form");
  return null;
}

export function LegacyDynamicListRedirectPage() {
  useLegacyRuntimeRedirect("/admin/winu/list");
  return null;
}

export function LegacyDynamicViewRedirectPage() {
  useLegacyRuntimeRedirect("/admin/winu/view");
  return null;
}
