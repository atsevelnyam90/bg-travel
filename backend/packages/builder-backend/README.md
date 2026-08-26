# @winu/builder-backend

Backend талын builder package. Энэ package нь builder metadata CRUD, runtime CRUD,
trigger runner, datasource introspection, builder schema migration logic-ийг эзэмшинэ.

## Starter Дотор

`winu-starter/backend` package-г workspace dependency-ээр ашиглаж байгаа:

```json
{
  "dependencies": {
    "@winu/builder-backend": "workspace:*",
    "@winu/contracts": "workspace:*"
  }
}
```

Ажиллуулах:

```bash
cd backend
pnpm install
pnpm builder:migrate
pnpm dev
```

`pnpm dev`, `pnpm build`, `pnpm typecheck` нь `packages/*` build-ийг автоматаар
түрүүлж ажиллуулна.

## Host App Дээр Холбох

Host backend package-г router factory-аар mount хийнэ. Auth, permission, audit, DB
repository adapter-уудыг host app өгнө.

```ts
import { createBuilderRouter } from "@winu/builder-backend/router";

app.use(
  "/api/v1/builder",
  createBuilderRouter({
    requireAuth,
    adminGuard,
    schemaGuard,
    auditFromRequest,
    getPermissions: (req) => req.auth?.permissions ?? [],
    errors,
    adminUseCases,
    runtimeUseCases,
    runtimeAdapters,
  }),
);
```

Starter дээр энэ wiring нь `backend/src/modules/builder` дотор thin wrapper хэлбэрээр
байгаа.

## Migration

Builder migration нь зөвхөн builder metadata table-уудыг хөндөнө:

- `builder_definitions`
- `builder_views`
- `builder_schema_migrations`

Domain table буюу `products`, `orders`, `users` зэрэг нь host project-ийн өмч хэвээр.

```bash
pnpm builder:migrate
```

Prisma app migration тусдаа:

```bash
pnpm db:migrate   # dev
pnpm db:deploy    # production
```

## Publish / Update

Private registry нээгдсэний дараа external project дээр:

```bash
pnpm add @winu/contracts @winu/builder-backend
pnpm builder:migrate
```

Update:

```bash
pnpm update @winu/contracts @winu/builder-backend
pnpm builder:migrate
```

Package нь `dist` output publish хийнэ. `prepack` нь publish/pack хийхээс өмнө
`pnpm build` ажиллуулна.
