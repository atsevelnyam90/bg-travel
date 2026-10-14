# Builder Bind File Model

Created: 2026-10-08

Goal: builder package-ийг app дээр ашиглахдаа олон integration file тараахгүй,
backend дээр нэг bind file, frontend дээр нэг bind file гэсэн загварыг барих.

## Core Idea

App дээр builder-ийн package source байхгүй байна.

App дээр зөвхөн package-ийг host app-тай холбох bind/config layer байна:

```txt
backend/src/modules/builder/builder.config.ts
portal/src/features/builder/builder.config.tsx
```

Энэ 2 файл бол app дээрх гол integration point.

## Backend Bind File

Target file:

```txt
backend/src/modules/builder/builder.config.ts
```

Энэ файл package-ийн backend integration factory-г дуудна.

Example target API:

```ts
import { createBuilderBackendIntegration } from "@duke333/builder-backend/integration";
import { prisma, prismaUnfiltered } from "@/lib/prisma";
import { requireAuth } from "@/middlewares/requirePermission";

export const {
  builderRouter,
  runBuilderMigrations,
  requireBuilderSchemaVersion,
} = createBuilderBackendIntegration({
  prisma,
  prismaUnfiltered,
  requireAuth,
});
```

Important: `createBuilderBackendIntegration` нь app дээрх file биш. Энэ бол
`@duke333/builder-backend` package дотор байх factory function.

App дээр backend bind file 1 ширхэг хэвээр байна.

## Frontend Bind File

Target file:

```txt
portal/src/features/builder/builder.config.tsx
```

Энэ файл package-ийн frontend integration factory-г дуудна.

Example target API:

```tsx
import { createBuilderPortalIntegration } from "@duke333/builder-ui/integration";
import { api } from "@/lib/api/apiClient";

export const builder = createBuilderPortalIntegration({
  api,
  adminBasePath: "/admin/dev/builder",
});

export const {
  AdminHomePage,
  AdminFormsPage,
  AdminNewFormPage,
  AdminEditFormPage,
  AdminListsPage,
  AdminNewListPage,
  AdminEditListPage,
  AdminViewsPage,
  AdminNewViewPage,
  AdminEditViewPage,
} = builder.adminPages;
```

Important: `createBuilderPortalIntegration` нь app дээрх file биш. Энэ бол
`@duke333/builder-ui` package дотор байх factory function.

App дээр frontend bind file 1 ширхэг хэвээр байна.

## Auth And Permission Rule

Default rule:

- Auth заавал байна.
- Permission default requirement биш.
- Login хийсэн хэрэглэгч builder admin/runtime руу орж болно.
- Permission хэрэгтэй app бол optional guard/config нэмнэ.

Backend default:

```ts
createBuilderBackendIntegration({
  prisma,
  prismaUnfiltered,
  requireAuth,
});
```

Backend optional advanced:

```ts
createBuilderBackendIntegration({
  prisma,
  prismaUnfiltered,
  requireAuth,
  adminGuard: requirePermission("org:manage"),
});
```

Frontend default:

```tsx
createBuilderPortalIntegration({
  api,
  adminBasePath: "/admin/dev/builder",
});
```

Frontend optional advanced:

```tsx
createBuilderPortalIntegration({
  api,
  adminBasePath: "/admin/dev/builder",
  permissions: [
    { label: "Products read", value: "product:read" },
    { label: "Products write", value: "product:write" },
  ],
});
```

Builder package app-specific permission нэр мэдэхгүй байх ёстой.

## Route Files Are Not Bind Files

Frontend route files байж болно. Гэхдээ тэд bind logic агуулахгүй.

Example route file:

```tsx
import { AdminHomePage } from "@/features/builder/builder.config";

export default AdminHomePage;
```

Route files нь зөвхөн page/router entry. Гол bind logic нь
`portal/src/features/builder/builder.config.tsx` дээр байна.

Backend route mount ч мөн адил нимгэн байна:

```ts
import { builderRouter } from "@/modules/builder";

routes.use("/builder", builderRouter);
```

## Init Target

Future CLI:

```bash
pnpm dlx @duke333/builder-cli init
```

Энэ command дараахыг үүсгэнэ эсвэл patch/snippet өгнө:

- backend bind file
- frontend bind file
- frontend admin route files
- backend route mount snippet
- Prisma schema/migration template

## Do Not Do

- App дээр олон builder integration file тараахгүй.
- Package factory function-ийг app file гэж ойлгохгүй.
- Permission-ийг mandatory болгохгүй.
- Builder package app-ийн domain module import хийхгүй.
- Host app дотор builder package source copy хийхгүй.

## Definition Of Done

- Backend дээр гол bind 1 file:
  - `backend/src/modules/builder/builder.config.ts`
- Frontend дээр гол bind 1 file:
  - `portal/src/features/builder/builder.config.tsx`
- Route files нимгэн entry байна.
- Auth default байна.
- Permission optional байна.
- Package factory functions package дотор байна.
- App-specific runtime adapter/trigger logic app дээр үлдэнэ.
