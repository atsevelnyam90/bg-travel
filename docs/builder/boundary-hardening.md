# Builder Boundary Hardening

## Зорилго

Builder package-уудыг generic engine хэвээр нь хадгалж, app-specific business logic санамсаргүй
шургуулахаас хамгаална.

Canonical repo: `winu-software-factory`.

## Чангалах 3 boundary

### 1. Portal нь backend-only package import хийхгүй

Portal тал зөвхөн frontend-safe package ашиглана:

- `@winu/builder-ui`
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
- Runtime datasource adapter: host backend
- Runtime UI composition: portal feature
- Shared API schema: `backend/packages/contracts`

## Одоогийн шийдвэр

- Publish хийхгүй, in-repo package model хэвээр.
- Package exports `dist` хэвээр.
- Watch build дараагийн ажил.
- `winu-starter`-ийг canonical гэж үзэхгүй.

## Command

Backend эсвэл portal-аас:

```bash
pnpm check:boundaries
```

Repo root-оос:

```bash
node scripts/check-boundaries.mjs
```
