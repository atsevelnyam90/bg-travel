# Builder Boundary Hardening

## Зорилго

Builder package-уудыг generic engine хэвээр нь хадгалж, app-specific business logic санамсаргүй
шургуулахаас хамгаална.

Canonical repo: `winu-builder` (`@duke333/builder-*`).

## Чангалах 3 boundary

### 1. Portal нь backend-only package import хийхгүй

Portal тал зөвхөн frontend-safe package ашиглана:

- `@duke333/builder-ui`
- generated contracts
- portal API client

Хориглох import:

- `@winu/builder-backend`
- `@winu/mn-integrations`
- backend folder руу харсан relative import

Guardrail:

```bash
node scripts/check-boundaries.mjs
```

### 2. Builder package app-specific logic мэдэхгүй

Builder package дотор `Product`, `User`, `Order`, `Marketplace` зэрэг domain logic орохгүй.

Зөв байрлал:

```text
backend/src/modules/<domain>/triggers
backend/src/modules/<domain>/usecases
backend/src/modules/<domain>/repositories
```

Буруу байрлал:

```text
backend/packages/builder-backend/src/products
portal/packages/builder-ui/src/users
```

Guardrail нь builder package дотор app-specific folder/file нэр эсвэл app-specific module import
орсон эсэхийг шалгана. Display text, form title, view title, test fixture-ийн `"Product Form"`
гэх мэт metadata нэрийг хориглохгүй.

### 3. Ownership docs тодорхой байх

Builder metadata, runtime, app logic-ийн эзэн:

- Form/List/View schema: builder metadata
- Trigger config: builder metadata
- Trigger implementation: app backend module
- Generic runtime datasource adapter: builder backend package
- Domain-specific runtime adapter: тухайн app-ийн domain module
- Generic runtime UI composition: builder UI package
- Domain-specific runtime action: тухайн app-ийн feature
- Shared API schema: `backend/packages/contracts`

## Одоогийн шийдвэр

- Builder нь npm дээрх `@duke333/builder-*` package-аас хэрэглэгдэнэ.
- Portal нэг `builder.config.tsx`-д transport/provider/admin editor-оо холбоно.
- Portal-ийн `features/builder/presentation/` нь app-ийн shared DataGrid, form, drawer болон action
  menu-г package-ийн optional `BuilderProvider.components` slot-д нэг удаа холбоно.
- Ердийн runtime page `BuilderForm`, `BuilderGrid`, `BuilderView`-ийг ID-гаар шууд дуудна.
- Backend нэг `builder.config.ts`-д auth, audit, Prisma repositories, trigger registry-гээ холбоно.
- Product/User custom adapter болон Order trigger зэрэг business logic domain module-д үлдэнэ.
- App талд generic repository, mapper, CRUD state эсвэл API wiring хуулж хадгалахгүй. Presentation
  adapter нь зөвхөн app design system-ийн renderer бөгөөд domain бүрт давхардахгүй.

## Command

Backend эсвэл portal-аас:

```bash
pnpm check:boundaries
```

Repo root-оос:

```bash
node scripts/check-boundaries.mjs
```
