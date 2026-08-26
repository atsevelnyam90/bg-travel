# Builder Package Plan

Эцсийн зорилго: **Builder нь starter-аас бүрэн ангид reusable package болно.**

Starter нь builder-ийг хөгжүүлэх host project хэвээр байж болно. Гэхдээ builder-ийн
backend core болон frontend UI нь өөр project дээр package update-аар авах боломжтой
байх ёстой.

## Final Shape

```text
backend/
  packages/
    builder-backend/
      src/
        router/
        usecases/
        metadata/
        runtime/
        datasources/
        triggers/
        migrations/

  src/
    modules/builder/        # thin host wrappers/adapters only

portal/
  packages/
    builder-ui/
      src/
        api/
        hooks/
        components/
        runtime/
        admin/

  src/
    features/builder/
      index.ts              # thin host wrapper only
```

Ингэсний дараа random project дээр:

```ts
// backend
import { createBuilderRouter } from "@winu/builder-backend";

app.use(
  "/api/v1/builder",
  requireRole("dev"),
  createBuilderRouter({ db, logger }),
);
```

```tsx
// portal
import { BuilderAdmin, DynamicForm, DynamicGrid } from "@winu/builder-ui";

<BuilderAdmin />
<DynamicForm id="..." />
<DynamicGrid id="..." />
```

## Ownership

Package-owned:

- builder metadata API
- form/list/view CRUD
- generic datasource introspection
- generic table read/write runtime
- trigger runner and built-in trigger handlers
- dynamic form/grid/list UI
- builder admin UI
- API client/hooks used by builder UI
- builder metadata schema migrations and schema version check

Host app-owned:

- DB connection/config
- auth guard for builder route, for example `requireRole("dev")`
- route mount path
- nav/menu entry
- generated project migrations if the host uses Prisma migration workflow
- optional custom datasource adapters
- app-specific pages that render package components

Not builder-owned:

- app domain table migrations such as `products`, `orders`, `users`
- app role/permission model internals
- app domain services unless explicitly provided as optional adapters

## Key Decision

Builder is a **generic dynamic builder**.

The host project creates and owns its domain tables. Builder reads existing table metadata and
builds form/grid/view behavior on top of those tables. Product/user-specific service rules are
optional extension adapters, not the default core design.

## Backend Package Contract

`@winu/builder-backend` should expose:

```ts
createBuilderRouter({
  requireAuth,
  adminGuard,
  auditFromRequest,
  getPermissions,
  errors,
  adminUseCases,
  runtimeUseCases,
  runtimeAdapters?,
});

runBuilderMigrations({ db });
assertBuilderSchemaVersion({ db });
```

The package should not import host paths such as:

```ts
@/lib/prisma
@/lib/errors
@/lib/logger
@/middlewares/requirePermission
@/modules/products/*
@/modules/users/*
```

Instead it receives small dependencies:

- `requireAuth`: host authentication middleware
- `adminGuard`: host authorization middleware for builder admin routes
- `auditFromRequest`: optional host audit writer
- `getPermissions`: host auth context reader for runtime view checks
- `errors`: host error factory adapter
- `adminUseCases` / `runtimeUseCases`: package-safe usecase contracts
- `runtimeAdapters`: optional overrides for special tables

## Frontend Package Contract

`@winu/builder-ui` should expose:

```ts
BuilderAdmin
DynamicForm
DynamicGrid
DynamicList
createBuilderApiClient
```

The package should not import host paths such as:

```ts
@/features/*
@/config/nav
@/lib/env
```

It can depend on shared UI primitives only through one of these strategies:

- package owns its builder-specific UI components
- host passes UI adapters/components
- shared `@winu/ui` package is introduced later

## Migration Story

Package update and DB update are separate.

Frontend update:

```bash
pnpm update @winu/contracts @winu/builder-ui
```

Backend update:

```bash
pnpm update @winu/contracts @winu/builder-backend
pnpm builder:migrate
```

Builder migrations affect only builder metadata tables, for example:

- `builder_definitions`
- `builder_views`
- `builder_schema_migrations`

They do not create app domain tables. Domain tables are still created by the host project.

Migration rules:

- append-only by default
- do not drop old metadata columns in minor versions
- transform JSON metadata safely and idempotently
- keep schema version in DB
- runtime should fail with a clear message if DB schema is older than package code
- current starter script is `pnpm builder:migrate`; a published package can later expose
  `pnpm builder migrate` as a CLI wrapper
- `@winu/builder-backend` currently depends on `@winu/contracts`; external projects must update
  the matching contract package together with the builder packages
- `@winu/contracts`, `@winu/builder-backend`, and `@winu/builder-ui` publish `dist` output,
  not raw `src`
- package `prepack` scripts run `pnpm build` so publish/pack artifacts are generated first

## Current Status

Done:

- `backend/packages/builder-backend` workspace package exists
- `portal/packages/builder-ui` workspace package exists
- `@winu/builder-ui` exposes `createBuilderApiClient` with host-injected API transport
- `@winu/builder-ui` exposes `createBuilderHooks` with host-injected builder API client
- `@winu/builder-ui` exposes runtime utilities for default form/entry values and value formatting
- `@winu/builder-ui` exposes `createDynamicFormComponent` with host-injected form/UI adapters
- `@winu/builder-ui` exposes `createDynamicListComponent` with host-injected table/UI adapters
- `@winu/builder-ui` exposes `createDynamicViewComponent` with host-injected table/dialog/UI adapters
- `@winu/builder-ui` exposes `createRuntimeEntryDialogComponent` with host-injected dialog/form adapters
- `@winu/builder-ui` exposes admin entity manager factories for route-edit and dialog-edit screens
- `@winu/builder-ui` owns pure form/list editor state helpers for entity values, db-table imports, trigger route mapping, and update input construction
- `@winu/builder-ui` exposes form/list editor page factories that own load/reset/save/import/redirect orchestration
- `@winu/builder-ui` exposes a view dialog factory that owns reset/save/error orchestration and view input conversion
- builder package tarballs exclude test/spec files via package-local `.npmignore`
- `@winu/contracts`, `@winu/builder-backend`, and `@winu/builder-ui` exports point at `dist`
- portal builder API wrapper now uses `@winu/builder-ui/api` instead of owning endpoint paths
- portal builder hook wrapper now uses `@winu/builder-ui/hooks` instead of owning React Query logic
- portal runtime components now use `@winu/builder-ui/runtime` for shared runtime logic
- portal `DynamicForm`, `DynamicList`, `DynamicView`, and `RuntimeEntryDialog` are now adapter wrappers around `@winu/builder-ui/components`
- portal `BuilderFormsPage`, `BuilderListsPage`, and `BuilderViewsPage` are now adapter wrappers around `@winu/builder-ui/admin`
- portal form/list editor pages now use `@winu/builder-ui/admin` for schema conversion/import helpers
- portal form/list editor pages now use `@winu/builder-ui/admin` page factories; only host design-system body JSX remains in portal
- portal `BuilderViewDialog` now uses `@winu/builder-ui/admin`; only host design-system shell/body JSX remains in portal
- pure backend DTO mapper helpers moved to `@winu/builder-backend`
- backend metadata repository contract added to `@winu/builder-backend`
- backend datasource repository contract added to `@winu/builder-backend`
- backend error factory contract added to `@winu/builder-backend`
- datasource introspection/options usecases moved to `@winu/builder-backend` factory
- form/list/view metadata usecases moved to `@winu/builder-backend` factories
- generic runtime adapter logic moved to `@winu/builder-backend`
- runtime adapter registry/dispatcher moved to `@winu/builder-backend`
- runtime usecases moved to `@winu/builder-backend` factory
- backend router/controllers moved to `@winu/builder-backend` router factory
- builder schema migration contract/service moved to `@winu/builder-backend`
- builder schema migration table added as `builder_schema_migrations`
- package-owned baseline schema version is `1`
- trigger types, runner, and built-in handlers moved to `@winu/builder-backend`
- runtime adapter contract moved to `@winu/builder-backend`
- host backend has a Prisma migration repository adapter for builder schema migrations
- host backend has `pnpm builder:migrate` for package-owned builder metadata migrations
- builder router accepts a host `schemaGuard`; starter wires it after auth/permission middleware
- host builder route now only wires auth, admin guard, permissions, audit, errors, usecases, and runtime adapters
- host backend wraps package trigger runner with app `logger` and `badRequest`
- host metadata repository now hides Prisma query/data shapes behind the package contract
- host datasource repository now hides Prisma/raw SQL option queries behind the package contract
- host generic runtime repository now hides Prisma/raw SQL list/create queries behind the package contract
- host backend centralizes app error helpers in `shared/builderErrors`
- host backend keeps thin wrappers for metadata and runtime usecases
- host backend registers `products/users` as starter example table-specific runtime adapters

Still host-bound:

- builder metadata repository implementation
- datasource repository implementation
- generic runtime repository implementation
- builder schema migration repository implementation
- product/user starter example runtime behavior
- route mount path and host auth/permission middleware
- portal builder form/list editor body JSX and view dialog shell/body JSX
- portal runtime UI adapters for host design system components
- portal generated contract type binding for builder API

## Work Plan

### Phase 1 - Backend Package Core

Move package-safe backend code first.

1. Move pure mapper/schema helpers to `@winu/builder-backend`.
2. Move trigger compatibility wrappers out of host once imports use package directly.
3. Define package DB interface for metadata and generic SQL operations.
4. Move metadata repository behind that DB interface.
5. Move app error handling behind the package error contract.
6. Move generic datasource introspection behind the DB interface.
7. Move generic runtime read/write behind the DB interface.
8. Move router/controllers/usecases into package.
9. Leave host `backend/src/modules/builder` as thin wrappers/adapters.

### Phase 2 - Remove App-Specific Defaults

1. Remove `products/users` from default runtime core.
2. Re-add them only as optional example/custom datasource adapters.
3. Make generic table CRUD the default behavior.

### Phase 3 - Builder Metadata Migrations

1. Add `builder_schema_migrations`. Done.
2. Add package migration files or migration runner. Done.
3. Add `assertBuilderSchemaVersion`. Done.
4. Document `pnpm builder:migrate` workflow. Done.
5. Wire schema guard into builder routes. Done.
6. Later: expose package CLI as `pnpm builder migrate`.

### Phase 4 - Frontend Package

1. Move API client to `@winu/builder-ui`. Done.
2. Move query hooks to `@winu/builder-ui` with host API client injection. Done.
3. Move runtime utility logic to `@winu/builder-ui`. Done.
4. Move `DynamicList` component orchestration to `@winu/builder-ui`. Done.
5. Move `DynamicForm` component orchestration to `@winu/builder-ui`. Done.
6. Move `DynamicView` component orchestration. Done.
7. Move `RuntimeEntryDialog` component orchestration. Done.
8. Move admin builder list screens. Done.
9. Move admin editor state helpers. Done.
10. Move admin form/list editor page orchestration. Done.
11. Move admin view dialog orchestration. Done.
12. Move packages from `src` exports to `dist` exports. Done.
13. Move remaining admin editor/dialog body JSX after deciding UI primitive strategy.
14. Keep portal routes as wrappers only.
15. Publish to private registry when update distribution is needed.

### Phase 5 - Update Flow

Until private publishing is ready:

```bash
git fetch starter
git cherry-pick -x <builder-only-commit>
```

After publishing:

```bash
pnpm update @winu/contracts @winu/builder-backend @winu/builder-ui
pnpm builder:migrate
pnpm typecheck
pnpm test
```

## Rules

- Builder package must not import host `@/*` paths.
- Builder core must be generic; app-specific datasource logic is optional.
- Builder metadata migration must preserve existing metadata.
- Package update must never silently require manual DB changes.
- Host wrappers should stay thin and boring.
- Packages publish `dist`; workspace scripts build package dist before root dev/typecheck/build.
