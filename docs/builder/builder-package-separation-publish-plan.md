# Builder Package Separation / Publish Plan

## Goal

Builder-ийг host app-аас publish хийх боломжтой хэмжээнд салгана.
Publish хийсний дараа host app дээр builder-ийн core source код байхгүй, зөвхөн package install
болон host config/adapters үлдэнэ.

Current execution order:

1. Finish the in-repo builder separation and package boundary.
2. Extract builder packages into a separate `winu-builder` repository.
3. Wire the host app to consume the extracted builder packages.
4. Only after that, decide and prepare public npm/open-source publishing.

Final target:

```text
@duke333/builder-contracts   shared builder schemas/types, browser + server safe
@duke333/builder-backend     server-only builder router/usecases/runtime/migrations
@duke333/builder-ui          browser-only builder UI/hooks/runtime/admin helpers
```

Host app-ийн үүрэг:

- package install хийх
- backend router mount хийх
- auth/permission/audit adapter өгөх
- metadata/runtime repository adapter өгөх
- domain datasource adapter өгөх
- app-specific trigger handler бүртгэх
- frontend design-system adapter өгөх

Builder package-ийн үүрэг:

- builder contract/schema/type
- metadata CRUD usecase
- runtime CRUD orchestration
- composite/subform orchestration
- field trigger dispatch/merge behavior
- lifecycle trigger runner
- frontend dynamic form/list/view logic
- admin editor state/helper logic
- publishable package exports

## Non-goals

- App domain table-үүдийг builder package руу нүүлгэхгүй.
- Product/User/Order зэрэг app-specific business logic builder package-д оруулахгүй.
- Host app-ийн auth/session/audit implementation-г builder package эзэмшихгүй.
- shadcn primitive файлуудыг builder package руу хуулж оруулахгүй.
- Нууц env, token, credential унших code builder-ui рүү оруулахгүй.

## Current Problems

1. `@duke333/builder-backend` нь `@winu/contracts`-оос `builder` contract import хийж байсан.
   `@winu/contracts` дотор app-specific `products`, `users`, `auth`, `organization` хамт байгаа.
   Publish хийхэд builder нь app-wide contract package-тай coupling-тэй үлдэнэ.

2. Portal талд runtime builder UI logic app feature дотор байна:

```text
portal/src/features/builder/components/RuntimeEntryDialog.tsx
portal/src/features/builder/components/RuntimeSubformField.tsx
```

Эдгээр нь зөвхөн host UI adapter биш, builder runtime behavior агуулж байгаа тул
`@duke333/builder-ui` руу шахах ёстой.

3. Host app wrapper-ууд заримдаа package component factory-г зөвхөн дуудах биш,
runtime orchestration давхар хийж байна.

4. Publish readiness бүрэн биш:

- packages `private: true`
- builder contracts тусдаа package биш
- publish dry-run / pack install smoke test байхгүй
- "delete local builder source, install package, config only" acceptance test байхгүй

## Target Boundary

### Backend

Allowed in `@duke333/builder-backend`:

- Express router factory
- request schema parsing
- metadata usecases
- runtime usecases
- generic runtime adapter factory
- migration service
- trigger runner contract
- datasource introspection usecase interfaces

Not allowed in `@duke333/builder-backend`:

- `@/` app imports
- Prisma generated client import
- product/user/order service import
- app permission list import from app-wide package
- env secret reads
- concrete auth/session implementation

Allowed in host backend:

- Prisma repository adapters
- product/user/order datasource adapters
- app trigger registry
- auth/permission/audit wiring
- route mount config

### Frontend

Allowed in `@duke333/builder-ui`:

- API client factory
- React Query hook factory
- DynamicForm/DynamicList/DynamicView core behavior
- RuntimeEntryDialog core behavior
- RuntimeSubformField/composite UI behavior
- field trigger client behavior
- admin editor state and page factories

Not allowed in `@duke333/builder-ui`:

- `@/` app imports
- Next.js route/navigation imports
- app-specific route constants
- app-specific product/user UI
- shadcn generated primitive ownership

Allowed in host portal:

- page files
- route wrappers
- DataForm/DataGrid/Button/Dialog/toast adapters
- navigation entries
- app-specific runtime ids
- package config

## Work Plan

### Phase 1 - Contract Split

- [x] Create `backend/packages/builder-contracts`.
- [x] Move/copy builder-only schemas from `backend/packages/contracts/src/builder.ts`.
- [x] Include only shared generic helpers needed by builder, such as pagination.
- [x] Avoid importing app-wide `PERMISSIONS`; model permission as `string` or host generic type.
- [x] Add package exports and tsup config.
- [x] Update `@duke333/builder-backend` to depend on `@duke333/builder-contracts`.
- [x] Keep `@duke333/builder-ui` independent from generated app contracts. It currently exposes a
  generic `BuilderApiContracts` interface, so a direct `@duke333/builder-contracts` dependency is
  not required until UI starts importing package-owned zod schemas directly.
- Keep `@winu/contracts` exporting builder temporarily for app compatibility, but re-export from builder contracts if possible.

Acceptance:

- [x] `@duke333/builder-backend` has no import from `@winu/contracts`.
- [x] `@duke333/builder-ui` does not require generated app contracts for core package types.
- [x] Backend compiles.
- [x] Portal compiles after frontend package boundary cleanup.

### Phase 2 - Frontend Runtime Logic Move

- [x] Move runtime entry dialog behavior from host portal into `@duke333/builder-ui`.
- [x] Move subform/composite runtime field behavior into `@duke333/builder-ui`.
- [x] Keep host UI primitives as adapters: shell, fields, actions, table, toast.
- [ ] Keep host page route wrappers thin.

Acceptance:

- [x] `portal/src/features/builder/components/RuntimeEntryDialog.tsx` is deleted or reduced to adapter config only.
- [x] `portal/src/features/builder/components/RuntimeSubformField.tsx` is deleted or reduced to adapter config only.
- [x] Dynamic view create/update/delete/composite behavior lives in package.
- Current product/form/list/view screens behave the same.

### Phase 3 - Backend Host Config Cleanup

- [x] Make host builder module only wiring/adapters.
- [x] Keep generic runtime algorithm in package.
- [x] Keep product/user adapters host-side.
- [x] Clarify trigger registry API:
  - builder package dispatches configured `action`
  - host registers app-specific handlers
  - generic built-in actions can be added later

Acceptance:

- [x] `backend/src/modules/builder/usecases/*` are thin package factory calls.
- [x] `backend/src/modules/builder/triggers/*` are thin registry adapters.
- [x] App-specific datasource code remains outside package.

### Phase 4 - Publish Readiness

- [x] Remove `private: true` from publishable builder packages.
- [x] Add package metadata:
  - `description`
  - `license`
  - `publishConfig`
  - stable `files`
- [x] Add `pnpm pack` dry-run checks.
- [x] Add dependency/peerDependency review:
  - backend peer: `express`
  - ui peer: `react`, `react-dom`, `react-hook-form`, `@tanstack/react-query`
  - contracts dependency: `zod`
- [x] Ensure package exports point only to `dist`.

Acceptance:

- [x] `pnpm --dir backend/packages/builder-contracts pack --dry-run`
- [x] `pnpm --dir backend/packages/builder-backend pack --dry-run`
- [x] `pnpm --dir portal/packages/builder-ui pack --dry-run`
- [x] `pnpm --dir backend/packages/builder-contracts publish --dry-run --no-git-checks`
- [x] `pnpm --dir backend/packages/builder-backend publish --dry-run --no-git-checks`
- [x] `pnpm --dir portal/packages/builder-ui publish --dry-run --no-git-checks`
- [x] Backend packed files contain no app source.
- [x] UI packed files contain no app source after frontend runtime cleanup.

Initial private publish policy:

- Package access: npm scoped restricted packages.
- License metadata: `UNLICENSED`.
- Registry: npm default unless host/project `.npmrc` overrides `@winu:registry`.
- Publish order:
  1. `@duke333/builder-contracts`
  2. `@duke333/builder-backend`
  3. `@duke333/builder-ui`

This was superseded by the public npm prep below.

### Phase 5 - Separate Builder Repository

- [x] Create/extract a separate `winu-builder` repository.
- [x] Move builder-owned packages into that repository:
  - `packages/builder-contracts`
  - `packages/builder-backend`
  - `packages/builder-ui`
- [x] Add top-level builder repo workspace config and package scripts.
- [x] Add repo-level validation commands:
  - contracts build/typecheck/test
  - backend build/typecheck/test
  - UI build/typecheck/test
  - pack/install consumer smoke
- [x] Update this starter app to consume builder via package install, tarball, or git tag during
  the extraction transition.
- [x] Keep host app runtime source on adapters/config while consuming extracted packages.
- [x] Remove old in-app builder package source folders after the linked-package transition is
  accepted.

Acceptance:

- [x] Builder packages build and test in the separate repo without host app source.
- [x] Host app no longer needs local builder package source to typecheck.
- [x] Host backend still mounts builder via router/config/adapters.
- [x] Host portal still renders builder via wrapper components/adapters.

Current extraction status:

- Separate repo path: `/Users/dulguundulguun/Desktop/cosoline/winu-builder`.
- Host backend consumes:
  - `@duke333/builder-contracts` via `link:../../winu-builder/packages/builder-contracts`
  - `@duke333/builder-backend` via `link:../../winu-builder/packages/builder-backend`
- Host portal consumes:
  - `@duke333/builder-ui` via `link:../../winu-builder/packages/builder-ui`
- Host backend workspace now only includes app-owned backend packages.
- Host portal workspace excludes old local builder packages and `tsconfig.json` excludes
  `packages` so stale local package source cannot shadow the linked builder package.
- Old in-app builder package source folders have been removed from the host app repo:
  - `backend/packages/builder-contracts`
  - `backend/packages/builder-backend`
  - `portal/packages/builder-ui`
- `@duke333/builder-ui` keeps `react-hook-form` as a peer range (`>=7.85.0 <8`) and a fixed dev
  dependency (`7.85.0`) to avoid duplicate local type identities during linked development.

Validation completed after extraction:

- `cd /Users/dulguundulguun/Desktop/cosoline/winu-builder && pnpm typecheck`
- `cd /Users/dulguundulguun/Desktop/cosoline/winu-builder && pnpm test:run`
- `cd /Users/dulguundulguun/Desktop/cosoline/winu-builder && pnpm smoke:tarball`
- `cd backend && pnpm typecheck && pnpm lint`
- `cd portal && pnpm typecheck && pnpm lint`

### Phase 6 - Public npm / Open Source Prep

Do this only after Phase 5 is complete.

- [x] Decide final public package names.
- [x] Decide license: `MIT`.
- [x] Change `publishConfig.access` from `restricted` to `public`.
- [x] Replace `UNLICENSED` metadata with the chosen open-source license.
- [x] Add root `LICENSE`.
- [x] Add root/package LICENSE files as needed.
- [x] Run a final public leakage/security pass:
  - no secrets/env/token reads
  - no app-specific domain logic
  - no private URLs/company-only assumptions
  - no generated host app code packed
- [ ] Publish public npm packages in order:
  1. `@duke333/builder-contracts`
  2. `@duke333/builder-backend`
  3. `@duke333/builder-ui`

## Progress Log

### 2026-10-02

- Created `docs/builder/builder-package-separation-publish-plan.md`.
- Added `@duke333/builder-contracts` under `backend/packages/builder-contracts`.
- Copied builder-only schemas/types and shared pagination helper into builder contracts.
- Removed app permission enum dependency from builder contracts; builder permission is now generic string.
- Updated `@duke333/builder-backend` to depend on `@duke333/builder-contracts`.
- Removed all `@winu/contracts` imports from `@duke333/builder-backend`.
- Updated backend builder README install/update examples.
- Moved runtime entry dialog composite orchestration into `@duke333/builder-ui`.
- Added `createRuntimeSubformFieldComponent` to `@duke333/builder-ui`.
- Reduced portal `RuntimeEntryDialog` and `RuntimeSubformField` to host adapter config.
- Added backend builder config for host permissions.
- Switched backend builder-related host type imports to `@duke333/builder-contracts`.
- Kept app-specific product contract imports in host datasource adapters.
- Verified:
  - `pnpm --dir backend/packages/builder-contracts build`
  - `pnpm --dir backend/packages/builder-contracts typecheck`
  - `pnpm --dir backend/packages/builder-backend build`
  - `pnpm --dir backend/packages/builder-backend typecheck`
  - `pnpm --dir backend/packages/builder-backend test:run`
  - `pnpm --dir backend typecheck`
  - `pnpm --dir backend lint`
  - `pnpm --dir backend/packages/builder-contracts pack --dry-run`
  - `pnpm --dir backend/packages/builder-backend pack --dry-run`
  - `pnpm --dir portal/packages/builder-ui typecheck`
  - `pnpm --dir portal/packages/builder-ui test:run`
  - `pnpm --dir portal typecheck`
  - `pnpm --dir portal lint`
  - `pnpm --dir portal/packages/builder-ui pack --dry-run`
  - `pnpm --dir backend test:run -- src/modules/builder/builder.integration.spec.ts`

### 2026-10-02 Publish Metadata

- Removed `private: true` from:
  - `@duke333/builder-contracts`
  - `@duke333/builder-backend`
  - `@duke333/builder-ui`
- Added `description`, `license: UNLICENSED`, and `publishConfig.access: restricted`.
- Verified all three packages with `pack --dry-run`.
- Verified all three packages with `publish --dry-run --no-git-checks`.
- Real publish is now blocked only by account/registry access and release ordering, not by
  package metadata.

### 2026-10-02 Public npm Prep

- Changed package metadata in `/Users/dulguundulguun/Desktop/cosoline/winu-builder`:
  - `license: MIT`
  - `publishConfig.access: public`
  - root `LICENSE`
- Added `publish:public` script in the separate builder repo.
- Re-ran publish dry-run and tarball smoke after public metadata changes.
- Verified package names currently return npm 404:
  - `@duke333/builder-contracts`
  - `@duke333/builder-backend`
  - `@duke333/builder-ui`
- Actual publish is blocked until this machine is logged in to npm and the logged-in account
  can publish under the `@winu` scope.

### 2026-10-02 Tarball Consumer Smoke

- Created real tarballs for:
  - `@duke333/builder-contracts`
  - `@duke333/builder-backend`
  - `@duke333/builder-ui`
- Verified UI clean consumer install and `tsc --noEmit` from `@duke333/builder-ui` tarball.
- Verified backend clean consumer install and `tsc --noEmit` from `@duke333/builder-backend`
  tarball when `@duke333/builder-contracts` is available through a local tarball override.
- Confirmed direct backend tarball install fails before `@duke333/builder-contracts` is available
  in the target registry. This is expected and proves the publish order requirement.

### 2026-10-02 Separate Repo Extraction

- Created sibling repository at `/Users/dulguundulguun/Desktop/cosoline/winu-builder`.
- Initialized it as a git repository.
- Extracted builder-owned packages:
  - `packages/builder-contracts`
  - `packages/builder-backend`
  - `packages/builder-ui`
- Added root workspace files:
  - `package.json`
  - `pnpm-workspace.yaml`
  - `.gitignore`
  - `README.md`
  - `scripts/tarball-smoke.mjs`
- Verified in the separate repo:
  - `pnpm install`
  - `pnpm build`
  - `pnpm typecheck`
  - `pnpm test:run`
  - `pnpm smoke:tarball`
- Ran source/docs boundary scan for host app aliases and secret/env patterns; no matches.
  - `pnpm --dir backend check:boundaries`
  - `pnpm --dir portal check:boundaries`
- Packed real tarballs into `/tmp/winu-builder-smoke.wLhbQR`.
- Verified `@duke333/builder-ui` tarball install/typecheck in a clean temp consumer.
- Verified packed `@duke333/builder-backend` depends on `@duke333/builder-contracts: 0.1.0`,
  not `workspace:*`.
- Found backend tarball clean-consumer install requires `@duke333/builder-contracts` to be
  published first.

### 2026-10-02 Host App Linked-Package Cleanup

- Updated host backend dependencies to consume:
  - `@duke333/builder-contracts` from `link:../../winu-builder/packages/builder-contracts`
  - `@duke333/builder-backend` from `link:../../winu-builder/packages/builder-backend`
- Updated host portal dependency to consume:
  - `@duke333/builder-ui` from `link:../../winu-builder/packages/builder-ui`
- Removed old in-app builder package source folders from the host app repo:
  - `backend/packages/builder-contracts`
  - `backend/packages/builder-backend`
  - `portal/packages/builder-ui`
- Kept host app builder code limited to route/page/config/repository/UI adapters.
- Legacy package folder backup was moved to `/tmp/winu-app-legacy-builder-packages-20261002171901`
  during cleanup.

### Phase 5 - Delete/Reinstall Smoke Test

After publish or local tarball pack:

- Replace workspace dependency with package version/tarball.
- Remove local package source from host dependency path for smoke test.
- Keep only host config/adapters.
- Run backend checks.
- Run portal checks.
- Smoke product builder runtime:
  - list
  - create
  - update
  - delete
  - field trigger
  - composite/subform save

Acceptance:

- Host app works like current behavior after install.
- No import points to deleted local package source.
- Builder-related app code is only config/adapters/routes/pages.

Current smoke result:

- [x] `@duke333/builder-ui` tarball installs in a clean temp consumer and TypeScript resolves
  package exports.
- [x] `@duke333/builder-backend` tarball metadata correctly rewrites
  `@duke333/builder-contracts` from `workspace:*` to `0.1.0`.
- [x] Backend tarball clean-consumer install/typecheck passes when `@duke333/builder-contracts`
  is supplied as the same-version dependency. In the real registry this means publish
  `@duke333/builder-contracts` first.
- [x] 2026-10-02 validation passed after switching package scope from `@winu` to `@duke333`:
  `winu-builder` typecheck, tests, pack dry-run, publish dry-run, tarball smoke; host backend
  typecheck/lint; host portal typecheck/lint.
- [x] 2026-10-02 npm publish verified for `@duke333/builder-contracts`,
  `@duke333/builder-backend`, and `@duke333/builder-ui`; clean temp install from npm passed.
- [x] Host backend and portal now consume published `^0.1.0` packages instead of
  `link:../../winu-builder/...`; backend and portal typecheck/lint passed after the switch.

Publish order requirement:

```text
1. @duke333/builder-contracts
2. @duke333/builder-backend
3. @duke333/builder-ui
```

Do not publish `@duke333/builder-backend` before `@duke333/builder-contracts` is available in the
same registry.

Interactive npm publish command:

```bash
cd /Users/dulguundulguun/Desktop/cosoline/winu-builder
pnpm --dir packages/builder-contracts publish --access public --no-git-checks
pnpm --dir packages/builder-backend publish --access public --no-git-checks
pnpm --dir packages/builder-ui publish --access public --no-git-checks
```

The account uses WebAuthn/security-key 2FA, so run these from an interactive terminal and complete
the browser/security-key prompt when npm asks.

## Validation Commands

Backend:

```bash
cd backend
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm test:run -- src/modules/builder/builder.integration.spec.ts
```

Portal:

```bash
cd portal
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm test:run
```

Package focused:

```bash
cd ../winu-builder
pnpm build
pnpm typecheck
pnpm test:run
pnpm smoke:tarball
```

## Definition of Done

- Builder contracts are in their own publishable package.
- Backend builder package has no app-wide contract dependency.
- Frontend runtime builder behavior is package-owned.
- Host backend contains only adapters/config/wiring for builder.
- Host portal contains only pages/adapters/config/wiring for builder.
- Packages can be packed/published independently.
- Deleting local builder package source and installing package build preserves behavior.
