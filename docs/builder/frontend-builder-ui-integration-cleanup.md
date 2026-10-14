# Frontend Builder UI Integration Cleanup

## Problem

`@duke333/builder-ui` is published and the local package source has been removed from the host
portal, but the portal still wires the package through many files:

- API factory wiring
- hooks factory wiring
- admin entity managers
- form/list/view editor wrappers
- runtime dynamic components
- route pages

This works, but it is not the desired install-and-use developer experience. A consuming app should
not need to understand every builder UI factory just to mount the admin builder.

## Target Shape

The host portal should have one builder integration entrypoint:

```text
portal/src/features/builder/builder.config.tsx
```

Route pages should consume that entrypoint:

```tsx
import { AdminFormsPage } from "@/features/builder/builder.config";

export default function Page() {
  return <AdminFormsPage />;
}
```

Long term, the entrypoint should be thin and most generic admin UI should live in
`@duke333/builder-ui`.

## Work Items

### 1. Centralize portal integration

- [x] Add a single portal-side builder integration module.
- [x] Route admin builder pages through that module instead of importing many components directly.
- [x] Keep current behavior unchanged.

### 2. Move generic admin UI into `@duke333/builder-ui`

- [x] Move default generic form editor sections into the package.
- [x] Move default generic list editor sections into the package.
- [x] Move default generic view editor structure into the package.
- [ ] Keep only app UI adapter/config in portal.

### 3. Reduce public frontend API surface

- [x] Add a package-level integration API such as `createBuilderIntegration`.
- [x] Make common admin manager/home pages available as ready-made package exports.
- [ ] Keep app-specific overrides optional.

Current package API added in `@duke333/builder-ui` source:

```ts
import { createBuilderIntegration } from "@duke333/builder-ui/integration";

export const builder = createBuilderIntegration({
  transport: api,
  adminBasePath: "/admin/dev/builder",
});
```

It returns:

- `builder.api`
- `builder.hooks`
- `builder.routes`

This does not yet remove the portal's generic admin editor wrappers. It is the first package-side
step toward one-file frontend setup.

## Boundary

Package should own:

- admin builder page composition
- generic form/list/view editor structure
- runtime dynamic form/list/view composition
- editor state transforms and defaults

Portal should own:

- app API client binding
- generated contract type binding
- route paths
- app design system adapter while package is not fully design-system independent
- app-specific runtime IDs

## Current Status

The backend and package publish split is complete. This cleanup focuses only on making frontend
builder usage simpler and less scattered.

2026-10-02 progress:

- Added portal builder config so admin route pages consume one local integration object.
- Added package `createBuilderIntegration()` and `@duke333/builder-ui/integration` entrypoint.
- Bumped `@duke333/builder-ui` source to `0.1.1` for the integration entrypoint.
- Moved generic form layout editor state/drag-drop helpers into `@duke333/builder-ui/admin` as
  `useBuilderFormLayoutEditor` and related pure helpers.
- Added a dependency-free default admin entity manager in `@duke333/builder-ui/admin` as
  `createBuilderDefaultEntityManagerComponent`. This is the package-side replacement path for the
  portal's form/list/view manager pages that currently depend on app `DataGrid` and shadcn wrappers.
- Added package `createBuilderAdminPages()` in `@duke333/builder-ui/admin`. It can produce
  dependency-free `AdminHomePage`, manager pages, and new/edit pages for forms/lists/views from
  builder hooks + route config. This is the cleaner one-file path for admin pages after
  `builder-ui@0.1.1` is published and installed.
- Added package default form/list editor bodies and a default view editor page so the host app no
  longer needs to carry builder admin editor UI just to mount builder admin.
- Made `winu-builder` tarball smoke derive tarball names from package versions instead of hardcoding
  `0.1.0`.
- Verified focused `builder-ui` typecheck, tests, and build after adding the layout state helpers.
- Verified full `winu-builder` typecheck, tests, pack dry-run, publish dry-run, and tarball smoke
  after adding the integration/admin page entrypoints.

Host portal switch completed:

- `@duke333/builder-ui` is installed at `0.1.1`.
- Portal `builder.config.tsx` now creates admin pages through package `createBuilderAdminPages()`.
- Portal admin routes call package-provided admin pages.
- Old portal admin wrapper files were removed.
- Portal builder package binding was consolidated into one config file:
  `portal/src/features/builder/builder.config.tsx`.

Remaining host-owned builder frontend code is runtime usage/adapters, not admin builder UI:

- dynamic runtime form/list/view wrappers
- runtime entry/subform UI that uses the host data/form components
- API transport and generated contract binding
