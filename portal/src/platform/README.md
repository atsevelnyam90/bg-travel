# platform/

Web ↔ Capacitor native ялгааг нуух adapter. Дэлгэрэнгүй: `docs/09-mobile-desktop.md`.

## Дүрэм

- App код `@capacitor/*`-ыг **import хийхгүй**
- App код `isNative()` шалгахгүй — `platform.*` дуудна
- `isNativeRuntime()`-ыг зөвхөн bootstrap дээр adapter сонгоход

## Native нэмэх

1. Capacitor plugin-үүдээ суулга
2. `platform/native.ts` үүсгэ — `PlatformAdapter` хэрэгжүүл
3. Bootstrap дээр:

```ts
if (isNativeRuntime()) {
  const { nativePlatform } = await import("@/platform/native");
  registerPlatform(nativePlatform);
}
```

## Шинэ чадвар нэмэх

`types.ts`-д метод нэм → `web.ts` болон `native.ts` хоёуланд хэрэгжүүл.
Хоёрын аль нэгэнд боломжгүй бол `null` буцаах эсвэл no-op болго — app код салаалахгүй.
