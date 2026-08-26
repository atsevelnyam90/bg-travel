<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — starter

AI coding agent энэ repo дээр ажиллахдаа **энэ файлыг эхэлж уншина**.
Дүрмүүд заавал биелүүлэх шаардлагатай — тодорхойгүй бол таамаглахгүй, асууна.

Код өөрчлөхөөс өмнө root `RULES.md`-ийг уншина. `RULES.md` нь энэ файлын
mandatory operating rules extension.

Дэлгэрэнгүй төлөвлөгөө: `~/Desktop/docs/` (00–09).

## 1. Stack

| Зүйл | Утга |
|---|---|
| Framework | Next.js 16 App Router, **client-first** |
| UI | Tailwind v4 + shadcn/ui (radix-nova), lucide icon |
| Server state | TanStack Query |
| Форм | React Hook Form + zod |
| Lint/format | Biome |
| Тест | Vitest + Testing Library |
| Package manager | pnpm |

## 2. Бүтэц

```
backend/                        Node + Express 5
  src/
    lib/          env, errors, asyncHandler
    middlewares/  requirePermission, currentUser
    modules/      домэйн бүрийн бизнес логик
    routes/       зам + middleware + validation, логик БАЙХГҮЙ
    server.ts     middleware ДАРААЛАЛ (raw-body webhook эхэнд!)
  prisma/
  scripts/gen-contracts.mjs     contracts → portal руу
  packages/                     ← BACKEND-ийн package-ууд
    contracts/                  zod schema — API-ийн ЭЗЭН
    mn-integrations/            e-Barimt, ДАН, банк, SMS, QR

portal/                         Next.js 16 frontend
  src/
    app/          Next route. Thin — логик features/ рүү
    features/     ДОМЭЙН бүр өөрийн folder (гол дүрэм)
      <domain>/
        api.ts  schema.ts  permissions.ts
        hooks/  useX.ts (дата) + useXScreen.ts (state+action)
        components/  XScreen.tsx  [.desktop.tsx / .mobile.tsx]
    api/generated/  ← ҮҮСГЭГДСЭН. ГАРААР БҮҮ ЗАС
    platform/     web ↔ Capacitor adapter
    components/   ui/ (shadcn — БҮҮ ЗАС), layout/ data/ form/ feedback/
    lib/          env, useBreakpoint, api, permissions, utils
    config/       nav.ts (өгөгдөл), brand.ts
  packages/                     ← PORTAL-ын package-ууд (ирээдүйд: ui г.м)

admin/            3 дахь app нэмэх бол ижил хэлбэрээр, өөрийн packages/-тай
```

### Contract — backend эзэмшинэ

API-г backend тодорхойлдог тул `backend/packages/contracts` нь **цорын ганц эх сурвалж**.
Portal нь `portal/src/api/generated/contracts`-аас уншина — энэ нь **хуулбар**.

```bash
pnpm gen:contracts     # backend/packages/contracts → portal/src/api/generated
```

- Contract өөрчилсний дараа **заавал** `pnpm gen:contracts` ажиллуулж commit хий
- `portal/src/api/generated/**` -д **гараар гар хүрэхгүй**
- CI (`contracts-in-sync`) дахин үүсгэж, ялгаа гарвал унана

winu-д portal 26 DTO файлыг гараар хуулж бичсэн байсан тул backend enum
өөрчлөгдвөл зөвхөн runtime-д мэдэгддэг байв. Энэ нь тэр ангиллын алдааг үхүүлнэ.

### ⚠️ Сервер / клиент хил

`@winu/mn-integrations` дотор банкны нэвтрэх мэдээлэл (`KB_PASSWORD`,
`BONUM_APP_SECRET`) уншдаг код байна.

- Энэ нь **backend-ийн package** — `backend/packages/` дотор
- **`portal`-ын dependency болгож БОЛОХГҮЙ**, `portal/src`-ээс import хийж **БОЛОХГҮЙ**
- CI (`server-only-boundary`) шалгана

Portal ↔ backend хооронд хуваалцах цорын ганц зүйл бол **generated contract**.

## 3. Хатуу дүрмүүд

| # | Дүрэм |
|---|---|
| 1 | `portal/src/components/ui/**` болон `globals.css` -д **гар хүрэхгүй** (shadcn). Өөрчлөх бол дээр нь wrapper |
| 2 | Шинэ домэйн = `features/<name>/` folder |
| 3 | **`useEffect` + `fetch` хориотой** — бүх сервер дата TanStack Query-ээр, `lib/api/apiClient.ts`-аар |
| 3б | API contract өөрчилвөл `backend/packages/contracts` зас → `pnpm gen:contracts` → commit |
| 3в | `portal/src/api/generated/**` -д гараар гар хүрэхгүй |
| 4 | State нь `use<X>Screen()`-д. `.desktop.tsx` / `.mobile.tsx` дотор `useState` **байж болохгүй** |
| 5 | Файл ~400 мөрөөс хэтэрвэл салга |
| 6 | `any` хориотой (Biome error). `unknown` + zod |
| 7 | Хүнд lib заавал `dynamic()` — chart, xlsx, pdf, map, editor |
| 8 | Дэлгэцийн өргөн → `useIsMobile()` (`lib/useBreakpoint.ts`). Өөр хувилбар бүү бич |
| 9 | Capacitor-ыг app кодоос **import хийхгүй** — зөвхөн `platform/` дотор |
| 10 | **`"use server"` хориотой** — Capacitor static build эвдэрнэ (CI шалгана) |
| 11 | env-ийг `process.env`-ээс шууд биш, `lib/env.ts`-ээс (web болон api тус тусдаа) |
| 11б | Нууц утга **зөвхөн `backend`**-д. `NEXT_PUBLIC_*` нь нийтэд ил гэж үз |
| 12 | Эрх: `can()` / `<Can>`. Backend талд `requirePermission()` **үргэлж заавал** — UI нуух нь хамгаалалт биш |
| 13 | Багцын эрх ба хэрэглэгчийн эрх (`can`) хоёрыг **бүү хутга** |
| 14 | Prisma client ганц instance — `@/lib/prisma`. Шинээр `new PrismaClient()` **үүсгэхгүй** |
| 15 | Эрхийн жагсаалтыг зөвхөн `backend/packages/contracts/src/permissions.ts`-д. Portal дахин бичихгүй |
| 16 | Нууц үг — `modules/auth/passwordService` (scrypt). bcrypt/argon2 нэмэхгүй (native build) |
| 17 | Session нь **DB-д**. Санах ойн Map ашиглахгүй — winu-гийн алдааг давтахгүй |
| 18 | Хүснэгт: `useDataTableState()` → дата татах → `useDataTable()`. Дараалал чухал |
| 19 | Өнгө/зайг token-оор (`bg-primary`). `bg-[#hex]` хориотой — brand солиход эвдэрнэ |
| 20 | Шинэ UI primitive зохиохгүй — `components/ui/`-аас угсарна |
| 21 | Мөнгө = бүхэл тоо (minor unit). Float хориотой |
| 22 | Устгал = зөөлөн (`deletedAt`), query бүрт `deletedAt: null` |
| 23 | Эрэмбэлэх багануудыг ил жагсаана — клиентээс ирсэн мөрийг Prisma-д шууд өгөхгүй |
| 24 | `PERMISSIONS`-д эрх нэмсний дараа **`pnpm db:seed` ажиллуулж** DB дэх role-уудыг шинэчилнэ |
| 25 | **`orgId` НЭМЭХГҮЙ.** Нэг deployment = нэг байгууллага. `Organization` нь ганц мөртэй тохиргоо. Салбар хэрэгтэй бол `branchId` хэмжигдэхүүн болгож зөвхөн хэрэгтэй хүснэгтэд |
| 26 | `deletedAt: null` **гараар бичихгүй** — `lib/softDelete.ts` extension автоматаар. Устгагдсаныг үзэхэд `prismaUnfiltered` |
| 27 | Зөөлөн устгалтай шинэ model нэмбэл `SOFT_DELETE_MODELS`-д бүртгэнэ |
| 28 | **Mutation бүрт аудит** — `auditFromRequest(req)({ action, resource, resourceId, meta })`. Засварт `changedFields()` ашиглаж зөвхөн зөрүүг бич, бүтэн объект БИШ |
| 29 | Аудитын `meta`-д нууц утга бүү хий (нууц үг, токен, картын дугаар) |
| 30 | **Засаж болох домэйн model-д `version Int @default(0)`** — optimistic locking. `updateMany({ where: { id, version } })` + `version: { increment: 1 }`, `count === 0` бол 409 |
| 31 | Create/update схемийг САЛГА — үүсгэхэд `version` хэрэггүй, засахад заавал |
| 32 | **Файлыг backend-ээр дамжуулахгүй** — presign → клиент шууд S3 руу PUT. `lib/api/upload.ts` / `FileField` |
| 33 | Файлын НЭРИЙГ клиентээс авахгүй — түлхүүрийг сервер үүсгэнэ (зам таах, дарж бичихээс сэргийлнэ) |
| 34 | Мөнгө = бүхэл тоо, талбар нь `...Minor`. Бүх тооцоо `@winu/contracts` `money` модулиар — `Math.round` тарааж бичихгүй |
| 35 | **Баримтын дугаарт `count()+1` ХОРИОТОЙ** — `nextDocumentNumber()`. Зэрэг дуудахад давхардана |

## 4. Командууд

`backend/` болон `portal/` нь **тус тусдаа бие даасан төсөл**. Дундын workspace,
root package.json БАЙХГҮЙ — winu шиг folder-ыг нь нээгээд асаана.

```bash
cd backend        # эсвэл cd portal
pnpm install
pnpm dev
pnpm typecheck    # засвар бүрийн дараа ЗААВАЛ
pnpm lint         # pnpm lint:fix — автоматаар засах
pnpm test:run
pnpm build
```

Нэмэлт:

| Folder | Команд | Юу хийх |
|---|---|---|
| `portal` | `pnpm build:mobile` | Capacitor (`output: export` → `out/`) |
| `backend` | `pnpm gen:contracts` | contract → `portal/src/api/generated` |
| `backend` | `docker compose up -d` | Postgres :5433, Redis :6380, Mailpit :8025, MinIO :9001 |
| `backend` | `pnpm db:generate` | Prisma client (install дараа автоматаар) |
| `backend` | `pnpm db:migrate` | Хөгжүүлэлтийн migration |
| `backend` | `pnpm db:deploy` | Production migration |
| `backend` | `pnpm db:seed` | Байгууллага + role + owner |
| `backend` | `pnpm db:studio` | Prisma Studio |
| `backend` | `pnpm db:test:setup` | Тест DB (`starter_test`) бэлдэх — тест ажиллуулахаас өмнө нэг удаа |

`backend`-ийн `typecheck` / `test:run` нь өөрийн `packages/*`-ыг ч хамарна.

Порт: backend `:4000`, portal `:3000`.

## 4б. TanStack Table v9 — v8-аас ЭРС ӨӨР

Ихэнх жишээ, сургалт v8-ыг заадаг. v9-д тэдгээр ажиллахгүй:

| v8 | v9 |
|---|---|
| `useReactTable({...})` | `useTable<Features, T>({...})` |
| `getCoreRowModel: getCoreRowModel()` | Хэрэггүй — default нь өөрөө ажиллана |
| Бүх feature бэлэн | `tableFeatures({...})`-ээр **ил бүртгэнэ** |
| `columnDef.enableSorting` | Бидэнд байхгүй (sort нь сервер талд) — `meta.sortable` ашиглана |

Бидний сонголт: **sort/filter/pagination бүгд СЕРВЕР талд**. Тиймээс зөвхөн
`columnVisibilityFeature` + `rowSelectionFeature` бүртгэсэн.

Багана бичихдээ `meta` ашиглана: `{ sortable, label, align, hideOnMobile }`.
`ColumnMeta`-г `useDataTable.ts`-д module augmentation-аар өргөтгөсөн
(иймд `@tanstack/table-core` нь ил dependency).

## 4в. Public (нэвтрэлтгүй) хэсэг

Route орон зай **урьдчилан хуваарилагдсан** — route group нь URL-д нэмэгддэггүй
тул `(public)` ба `(app)` нэг орон зайг хуваалцана:

| Префикс | Хэн үзэх | Хаана |
|---|---|---|
| `/market/**` | Хэн ч | `portal/src/app/(public)/` |
| Бусад бүх | Нэвтэрсэн | `portal/src/app/(app)/` |

Backend талд ч адил: `/api/v1/public/**` нь `routes/public.routes.ts`-д тусад нь.

**Public endpoint нэмэхийн өмнө дөрвийг шалга:**

1. `requirePermission` байхгүй — зориудаар нээлттэй эсэх
2. Зөвхөн нийтэд зориулсан талбар (дотоод id, эзэмшигч, `status` гаргахгүй)
3. Зөвхөн нийтлэгдсэн (`PUBLISHED`) өгөгдөл
4. Бичих үйлдэл байхгүй (маягт бол тусад нь rate limit + captcha)

### ⚠️ Dynamic route нь Capacitor build-ыг эвдэнэ

`output: "export"` нь `[slug]` төрлийн route-д `generateStaticParams()` шаарддаг.
Байнга өөрчлөгддөг өгөгдөлд (бараа г.м) build үед бүх утгыг мэдэх боломжгүй.

**Батлагдсан:** `[slug]` route-той үед `pnpm build` (web) амжилттай, харин
`pnpm build:mobile` унана. CI-ийн portal job `build:mobile` ажиллуулдаг тул PR дээр баригдана.

**Шийдэл:** query param — `/market/product?slug=…`. `useSearchParams()` нь
Suspense хүрээ шаарддагийг мартаж болохгүй.

## 4г. Мөнгө

Мөнгийг **бүхэл тоогоор**, хамгийн жижиг нэгжээр (`priceMinor`) хадгална.
Float ашиглавал `0.1 + 0.2 !== 0.3` маягийн алдаа мөнгөнд хүрнэ.
Харуулах/оруулахад `features/market/money.ts`-ийн `formatMoney` / `toMinor`.

## 4д. Тест

| Төрөл | Хаана | Юу шалгах |
|---|---|---|
| Unit | `*.spec.ts` цэвэр функцийн хажууд | Нууц үг, токен, QR, банк, лавлагаа |
| **Integration** | `*.integration.spec.ts` | Бодит DB + supertest: auth урсгал, **эрхийн шалгалт**, public хил |

Integration тест нь **тусдаа DB** (`starter_test`) ашиглана — dev өгөгдөл хөндөгдөхгүй.
`resetDatabase()` тест бүрийн өмнө цэвэрлэнэ.

**Шинэ endpoint нэмэхдээ integration тест ЗААВАЛ бич** — ялангуяа:
- эрхгүй хэрэглэгч 403 авдаг эсэх
- нэвтрээгүй хэрэглэгч 401 авдаг эсэх
- public endpoint дотоод талбар задруулдаггүй эсэх

Эрхийн алдаа = дата алдагдал. Дүрмээр бичсэн зүйл мартагдана, тест мартагдахгүй.

## 5. Конвенц

- Файл нэр: React component `PascalCase.tsx`, бусад `camelCase.ts`
- Import alias `@/*` → `src/*`
- Тайлбар: **яагаад** гэдгийг бич, юу хийж байгааг биш
- Алдааны хариу нэг формат: `{ message, code?, details? }` — `ApiError`
- Танихгүй гадаад статусыг таамаглаж хөрвүүлэхгүй — лог бич, өгөгдлийг хөндөхгүй орхи

## 6. Do-not-touch

| Зам | Шалтгаан |
|---|---|
| `portal/src/components/ui/**`, `globals.css` | shadcn — upgrade эвдэрнэ |
| `portal/src/api/generated/**` | Үүсгэгддэг — `pnpm gen:contracts` |
| `.env*` | Нууц утга. Шинэ хувьсагч хэрэгтэй бол **нэрийг нь хэл** |
| `backend/packages/mn-integrations/**` протокол хэсэг | Банк/татварын тодорхойлолттой тохирсон |
| `node_modules/`, `.next/`, `out/` | Build артефакт |

Secret, token, checksum key-г лог, баримт, commit message-д **хэзээ ч бүү бич**.

## 7. Ажлын дараалал

1. Өөрчлөлт хийхээс өмнө холбогдох баримтыг кодтой тулга
2. Баримт кодтой зөрчилдвөл **дуугүй бүү зас, дуугүй бүү дага** — асуу
3. Том өөрчлөлтийн өмнө төлөвлөгөө танилцуул (schema, auth/permission, олон файлын refactor, гадаад интеграц)
4. Засварын дараа `pnpm typecheck && pnpm lint`
5. Хэрэглэгч хүсээгүй бол commit/push хийхгүй
