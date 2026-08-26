import type { PlatformAdapter } from "./types";
import { webPlatform } from "./web";

// Default нь web. Capacitor-той төслүүд bootstrap дээрээ native хэрэгжүүлэлтээ
// бүртгүүлнэ — ингэснээр:
//   - Capacitor суулгаагүй төсөлд typecheck ажиллана
//   - web-only клиент native кодыг bundle-даа татахгүй
//   - тестэд mock adapter бүртгэж болно
//
// Native төсөлд:
//   // app/providers.tsx эсвэл эхлэлийн файл дээр
//   if (isNativeRuntime()) {
//     const { nativePlatform } = await import("@/platform/native");
//     registerPlatform(nativePlatform);
//   }
let current: PlatformAdapter = webPlatform;

export function registerPlatform(adapter: PlatformAdapter): void {
  current = adapter;
}

/**
 * Capacitor-ыг import хийхгүйгээр native орчинг таних.
 * Зөвхөн bootstrap дээр adapter сонгоход хэрэглэнэ — app кодод БИШ.
 */
export function isNativeRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const capacitor = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return capacitor?.isNativePlatform?.() ?? false;
}

/**
 * App кодын хэрэглэх ганц гарц.
 *
 *   await platform.share({ url });
 *   await platform.storage.set("k", "v");
 *
 * `if (isNative())` шалгалтыг app кодод БҮҮ бич.
 */
export const platform: PlatformAdapter = {
  get name() {
    return current.name;
  },
  storage: {
    get: (key) => current.storage.get(key),
    set: (key, value) => current.storage.set(key, value),
    remove: (key) => current.storage.remove(key),
  },
  share: (input) => current.share(input),
  pickImage: () => current.pickImage(),
  openExternal: (url) => current.openExternal(url),
};

export type { PickedFile, PlatformAdapter, PlatformStorage, ShareInput } from "./types";
export { webPlatform } from "./web";
