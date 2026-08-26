"use client";

import { useSyncExternalStore } from "react";

// ГАНЦ эх сурвалж. winu-portal-д isMobile/useMediaQuery/innerWidth шалгалт
// 123 өөр газар өөр өөрөөр бичигдсэн — үүнийг давтахгүй (09-mobile-desktop.md).
//
// Энэ нь ЗӨВХӨН дэлгэцийн өргөнийг хэлнэ. Web ↔ native ялгааг мэдэхийг
// хүсвэл `platform`-ыг ашигла — тэр хоёр өөр тэнхлэг.
const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

// Сервер дээр desktop гэж үзнэ — hydration зөрчлөөс сэргийлж
// layout сонголтыг зөвхөн client дээр эцэслэнэ.
function getServerSnapshot() {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
