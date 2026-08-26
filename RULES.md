# RULES.md — Winu Starter Operating Rules

Энэ файл нь хүн болон AI agent хоёрт зориулсан project operating rules.
`AGENTS.md` нь agent-ийн entrypoint, энэ файл нь өдөр тутмын code/design boundary.

## 1. Mental Model

`winu-starter` нь шинэ client project эхлүүлэх template. Энэ repo дээр ажиллахдаа
дараах гурван зүйлийг бүү хутга:

- `backend` / `portal` app code
- reusable packages (`@winu/contracts`, `@winu/builder-backend`, `@winu/builder-ui`)
- generated/build artifact

Зорилго нь project бүр дээр давтагддаг boilerplate-ийг багасгах, харин app-specific
domain logic-ийг тодорхой boundary дотор үлдээх.

## 2. Hard Boundaries

- `backend/` болон `portal/` нь тусдаа project. Root package.json нэмэхгүй.
- Portal нь backend package import хийхгүй.
- Backend-only secret уншдаг package portal dependency болохгүй.
- Generated contract файлыг гараар засахгүй.
- shadcn primitive файлуудыг шууд засахгүй.
- Builder package дотор app-specific `Product`, `User`, `Order` logic хатуу бичихгүй.
- App-specific datasource/adapter logic host project талдаа байна.

## 3. Contracts

API contract-ийн эх сурвалж:

```text
backend/packages/contracts/src
```

Portal талын copy:

```text
portal/src/api/generated/contracts
```

Дүрэм:

- Contract өөрчилбөл `cd backend && pnpm gen:contracts` ажиллуулна.
- Generated файлыг гараар patch хийхгүй.
- Backend route request validation contract schema-аар явна.
- Portal feature API wrapper contract type ашиглана.
- Permission жагсаалт зөвхөн contract package-д байна.

## 4. Backend Rules

Backend structure:

```text
backend/src/modules/<domain>/
  <domain>.routes.ts
  <service-or-usecase>.ts
  <domain>.integration.spec.ts
```

Дүрэм:

- Route file нь URL, middleware, validation л хийнэ.
- Business logic module/service/usecase дотор байна.
- Protected endpoint бүр `requirePermission()`-тэй байна.
- Public endpoint зөвхөн `/api/v1/public/**` доор байна.
- Mutation бүр audit бичнэ.
- Secret/token/password/card data audit meta эсвэл log-д бичихгүй.
- Prisma client зөвхөн `@/lib/prisma`.
- Soft delete model нэмбэл `SOFT_DELETE_MODELS`-д бүртгэнэ.
- Засагддаг domain model-д `version` ашиглаж optimistic locking хийнэ.
- Money бол minor unit integer. Float хэрэглэхгүй.
- Sort column allowlist заавал байна.

## 5. Portal Rules

Portal structure:

```text
portal/src/features/<domain>/
  api.ts
  hooks/
  components/
```

Дүрэм:

- Server state зөвхөн TanStack Query + `lib/api/apiClient.ts`.
- `useEffect + fetch` pattern ашиглахгүй.
- Feature state/actions нь `use<X>Screen()` hook-д байна.
- Desktop/mobile component дотор local business state тараахгүй.
- Existing `components/data`, `components/form`, `components/ui` primitives ашиглана.
- `portal/src/components/ui/**` болон `globals.css` шууд засахгүй.
- Capacitor import зөвхөн `platform/` boundary дотор байна.
- `"use server"` ашиглахгүй.
- `NEXT_PUBLIC_*` бүх утга public гэж үзнэ.

## 6. Builder Rules

Builder-ийн үндсэн ойлголт:

```text
Form = field schema
List = column schema
View = Form + List runtime CRUD composition
```

Дүрэм:

- Builder metadata нь domain data хадгалахгүй.
- Builder package нь domain entity мэдэхгүй.
- Runtime datasource host project-ийн table/API дээр ажиллана.
- Full CRUD screen хэрэгтэй бол `DynamicView`.
- Дан form хэрэгтэй бол `DynamicForm`.
- Дан list/grid хэрэгтэй бол `DynamicList`.
- Builder lifecycle trigger болон field-level computed behavior хоёрыг бүү хутга.
- Field computed trigger roadmap: `docs/builder/field-triggers-plan.md`.
- Builder backend migration нь builder metadata table-д л хамаатай.
- App domain migration Prisma workflow-оор тусдаа явна.

## 7. Package Rules

Workspace development:

```text
@winu/contracts        backend/packages/contracts
@winu/builder-backend  backend/packages/builder-backend
@winu/builder-ui       portal/packages/builder-ui
```

Дүрэм:

- Package exports `dist` рүү заана.
- Package source өөрчилсний дараа холбогдох `build/typecheck/test` ажиллуулна.
- External project update хийхдээ backend дээр builder package update + migration хамт явна.
- Private registry publish нээгдэх хүртэл starter дотор `workspace:*` ашиглана.
- Package boundary эвдэх import нэмэхгүй.

## 8. Migrations

App DB migration:

```bash
cd backend
pnpm db:migrate   # dev
pnpm db:deploy    # production
```

Builder metadata migration:

```bash
cd backend
pnpm builder:migrate
```

Дүрэм:

- App domain table-ийг builder migration үүсгэхгүй.
- Builder migration нь `builder_definitions`, `builder_views`,
  `builder_schema_migrations` зэрэг metadata table-д л хамаатай.
- Schema өөрчилсөн бол Prisma generate/typecheck марталгүй ажиллуулна.

## 9. Verification

Өөрчлөлтийн scope-оос хамаарч шалгана:

```bash
cd backend
pnpm typecheck
pnpm lint
pnpm test:run

cd portal
pnpm typecheck
pnpm lint
pnpm test:run
```

Minimum:

- Backend code өөрчилсөн бол backend `typecheck` + `lint`.
- Portal code өөрчилсөн бол portal `typecheck` + `lint`.
- Contract өөрчилсөн бол `gen:contracts` + backend/portal typecheck.
- Package logic өөрчилсөн бол package tests.
- Endpoint нэмсэн бол integration test.

## 10. Do Not Touch Without Reason

- `.env*`
- `node_modules/`
- `.next/`
- `out/`
- generated contracts
- shadcn generated primitives
- package `dist/` manually
- bank/tax protocol internals under `mn-integrations`

## 11. Decision Logging

Том шийдвэрийг code дотор нууц refactor маягаар хийхгүй. Дараах төрлийн ажлыг docs дээр
үлдээнэ:

- builder architecture
- package/release flow
- migration/versioning strategy
- field trigger/computed behavior
- builder form layout
- auth/permission model change
- mobile/Capacitor build constraint

Existing docs:

- `docs/builder/winu-builder.md`
- `docs/builder/in-repo-package-plan.md`
- `docs/builder/field-triggers-plan.md`
- `docs/builder/form-layout-plan.md`
- `docs/builder/boundary-hardening.md`
- `docs/mobile/capacitor-build.md`
