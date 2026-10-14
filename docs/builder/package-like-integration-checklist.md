# Builder Install + Init Readiness

Created: 2026-10-08  
Status: ready for supported Winu-style apps after package publish.

## Goal

After install, a new app can run:

```bash
pnpm dlx @duke333/builder-cli init
```

The command scaffolds the Builder bind files, admin routes, and Prisma setup files with minimal
manual wiring.

## Done

- [x] Builder source is separated from the host app.
- [x] Host app uses npm packages:
  - `@duke333/builder-contracts`
  - `@duke333/builder-backend`
  - `@duke333/builder-ui`
- [x] Host app keeps only bind/config/adapter files.
- [x] Backend package does not import host contracts, app modules, Prisma client, or env.
- [x] UI package does not import backend-only code.
- [x] App-specific product/user/runtime trigger logic stays in the host app.

## CLI

- [x] `@duke333/builder-cli` exists.
- [x] Binary alias exists: `builder init`.
- [x] `pnpm dlx @duke333/builder-cli init` works.
- [x] Supports `--backend-dir`, `--portal-dir`, `--dry-run`, and `--force`.
- [x] Detects backend, portal, Next App Router, Express, and Prisma paths.
- [x] Does not overwrite existing files unless `--force` is used.
- [x] Gives a clear error when Builder Prisma models already exist.

Generated files:

- [x] `backend/src/modules/builder/builder.config.ts`
- [x] `portal/src/features/builder/builder.config.tsx`
- [x] `/admin/dev/builder/**` route files
- [x] `backend/prisma/builder.schema.prisma`
- [x] `backend/prisma/migrations/00000000000000_builder_metadata/migration.sql`

## Backend Package

- [x] `createBuilderBackendIntegration()` added.
- [x] Returns:
  - `builderRouter`
  - `runBuilderMigrations`
  - `requireBuilderSchemaVersion`
  - admin/runtime use cases
- [x] `createBuilderPrismaRepositories()` added.
- [x] Creates:
  - metadata repository
  - datasource repository
  - generic runtime repository
  - schema migration repository
- [x] Exports Builder Prisma schema and SQL migration templates.
- [x] Backend setup validator checks required tables, migration version, auth middleware, audit writer, and runtime adapters.

## Frontend Package

- [x] `createBuilderPortalIntegration()` added.
- [x] Integration object exposes API client, hooks, route helpers, and optional admin pages.
- [x] Frontend setup validator checks route paths and API transport.
- [x] Host frontend still needs only one bind file.

## Prisma Setup

Required tables:

- [x] `builder_definitions`
- [x] `builder_views`
- [x] `builder_schema_migrations`

The generated migration SQL is compatible with the package migration service.

## Package Quality

- [x] Package metadata added:
  - `repository`
  - `bugs`
  - `homepage`
  - `keywords`
  - `sideEffects`
- [x] CI workflow added.
- [x] Manual release workflow added.
- [x] PR CI does not publish.
- [x] Release workflow publishes only when manually requested.
- [x] Tarball smoke keeps clean backend, UI, and CLI consumers.

## Docs

- [x] Root quickstart
- [x] Backend setup guide
- [x] Frontend setup guide
- [x] Prisma setup note
- [x] Runtime adapter example
- [x] Trigger example

## Validation

Passed in `/Users/dulguundulguun/Desktop/cosoline/winu-builder`:

```bash
pnpm typecheck
pnpm test:run
pnpm pack:dry-run
pnpm smoke:tarball
```

## Release Notes

- Publish order:
  1. `@duke333/builder-contracts`
  2. `@duke333/builder-backend`
  3. `@duke333/builder-ui`
  4. `@duke333/builder-cli`
- `builder-backend` depends on `builder-contracts`; tarball smoke verifies clean install.
- `builder-ui` currently stays contract-package-free by using generic host-provided contract types.

## Definition Of Done

- [x] New project can install packages and run `builder init`.
- [x] Host app does not need copied Builder source.
- [x] Backend bind file stays the main backend entry.
- [x] Frontend bind file stays the main frontend entry.
- [x] Generated route files are thin.
- [x] Prisma/schema setup is documented and scaffolded.
- [x] Clean consumer smoke passes.
- [x] Host app uses Builder as npm dependencies.
- [x] App-specific domain logic stays out of Builder packages.
