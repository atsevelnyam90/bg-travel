# @winu/mn-integrations

Монголын үйлчилгээ үзүүлэгчидтэй холбогдох интеграцууд. winu-backend-ээс гаргаж авсан.

Эдгээрийг интернетийн ямар ч starter-аас олохгүй — package-ийн гол үнэ цэн энд.

## Модулиуд

| Модуль | Агуулга |
|---|---|
| `ebarimt` | Татварын баримт: `EbarimtClient`, ТТД шалгах, ангилал хайлт |
| `payment/bonum` | Bonum gateway — нэхэмжлэх, QPay QR, картын токен, HMAC checksum |
| `payment/kb` | Хаан банк Corporate Gateway (CG001) — токен, данс шалгах, шилжүүлэг |
| `sms` | CosoLine / CallPro SMS |
| `qr` | EMVCo төлбөрийн QR — унших / бүтээх |
| `banks` | Монголбанкны оролцогч банкуудын код + BIC |
| `mn` | Регистрийн дугаар задлах, кирилл транслитер, УБ цагийн бүс |

## Хэрэглээ

```ts
import { qr, banks, sms } from "@winu/mn-integrations";

const parsed = qr.parseEmvcoQr(rawQrString);
const khan = banks.findBankByCode("050000");

const smsClient = sms.createSmsClient({
  baseUrl: process.env.COSO_SMS_BASE_URL!,
  apiKey: process.env.COSO_SMS_API_KEY!,
  from: process.env.COSO_SMS_FROM!,
});
await smsClient.send({ to: "99119911", text: "Баталгаажуулах код: 1234" });
```

## Орчны хувьсагч

| Модуль | Хувьсагч |
|---|---|
| `payment/kb` | `KB_BASE_URL`, `KB_USERNAME`, `KB_PASSWORD`, `WINU_PAYOUT_SOURCE_BANK_CODE` |
| `payment/bonum` | `BONUM_API_BASE_URL`, `BONUM_APP_SECRET`, `BONUM_TERMINAL_ID`, `BONUM_MERCHANT_CHECKSUM_KEY`, `BONUM_INVOICE_CALLBACK_URL`, `BONUM_INVOICE_PROVIDERS`, `BONUM_INVOICE_EXPIRES_SEC` |
| `sms` | Env уншдаггүй — `createSmsClient({...})`-д шууд дамжуулна |

`kb` нь `configureKb({...})`-ээр env-ийг дарж бичих боломжтой (тест, олон тенант).

## winu-гээс зөөхөд хийсэн өөрчлөлт

| Юу | Яагаад |
|---|---|
| `node-fetch` хамаарал хассан (`kb`) | Node 18+ дээр `fetch` global |
| Модуль ачаалах үеийн `process.env` унших → залхуу (`kb`) | dotenv-ийг import-ын дараа ачаалдаг орчинд эвдэрдэг |
| `kbGet<T = any>` → `<T = unknown>` | `any` хориотой |
| SMS-ийг factory болгосон | winu-гийн утасны дугаар, sender ID default байсныг арилгасан |
| `KHAN_BANK_CODE` const → `getSourceBankCode()` | Мөн адил залхуу тохиргоо |
| **EMVCo parse засвар** | Доор үз |

## ⚠️ Зассан алдаа — EMVCo QR

`parseEmvcoQr` нь задлахын өмнө payload доторх **бүх зайг устгадаг** байсан
(`raw.replace(/\s/g, "")`).

EMVCo-д merchant name (tag 59), city (60), purpose (50) зэрэг талбар зайтай байж болох
бөгөөд `toTlv` уртыг **зайтай нь** бодож бичдэг. Зайг устгахад бодит урт нь бичигдсэн
уртаас богино болж, **тухайн талбараас хойших бүх унших байрлал шилждэг** — дараагийн
тагийн эхний тэмдэгтүүд утга руу цутгадаг.

```
Бүтээсэн:  ...59 13 "TEST MERCHANT" 60 11 "Ulaanbaatar"...
Уншсан:    merchantName = "TESTMERCHANT6"   ← "6" нь tag 60-ын эхнээс
```

Зөвхөн гадна талын зайг авдаг болгож зассан. `qr/emvco.spec.ts`-д round-trip тест нэмсэн.

> Энэ алдаа **winu дээр хэвээр байгаа** — `winu-backend/src/utils/parseEmvcoQr.ts` болон
> `winu-portal/src/utils/parseEmvcoQr.ts` хоёуланд. Тэнд ч засах хэрэгтэй.

## Тест

```bash
pnpm test:run
```
