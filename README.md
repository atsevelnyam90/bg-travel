# BG Travel

BG Travel is a travel website and administration portal backed by a Node.js API. The public website, admin area, and API are deployed together on a Datacom VPS.

| Application | Technology | Local address |
| --- | --- | --- |
| `backend/` | Node.js 22, Express 5, Prisma 7, PostgreSQL 17 | `http://localhost:4000/api/v1` |
| `portal/` | Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn/ui | `http://localhost:3000` |

The repository has **no root package.json or shared pnpm workspace**. Run pnpm commands inside `backend/` or `portal/`. Both projects use pnpm 11.22.0. The admin area is part of `portal/`; there is no separate admin application.

## Get started locally

Prerequisites: Node.js 22, pnpm 11.22.0 (or Corepack), and Docker with Compose. PostgreSQL's `psql` client is useful when preparing a test database on an existing Docker volume.

In one terminal:

~~~bash
cd backend
cp .env.example .env
# Configure DATABASE_URL, SESSION_SECRET, and the other required values in .env.
pnpm install
docker compose up -d
pnpm db:prepare
pnpm db:seed       # Initial local setup; do not run on every start.
pnpm dev
~~~

In another terminal:

~~~bash
cd portal
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL should point to http://localhost:4000/api/v1.
pnpm install
pnpm dev
~~~

`pnpm dev` in the backend also runs pending Prisma migrations and regenerates the Prisma client. `pnpm db:prepare` makes that step explicit before the initial seed. Do not commit real `.env` files or secrets. The backend reads environment settings through `src/lib/env.ts`; the portal reads its public settings through `src/lib/env.ts`. Anything named `NEXT_PUBLIC_*` is visible to browser users.

### Local services and routes

The **development-only** `backend/docker-compose.yml` starts:

| Service | Host port | Purpose |
| --- | --- | --- |
| PostgreSQL | 5433 | Development and separate test databases |
| Redis | 6380 | Local queue/cache infrastructure |
| Mailpit | 1025, 8025 | Captures development email; UI at `http://localhost:8025` |
| MinIO | 9000, 9001 | S3-compatible object storage and console |

Useful routes:

| Route | Purpose |
| --- | --- |
| `/` | Public travel website |
| `/trip-detail?slug=...` | Public travel detail; the query parameter supports the mobile static build |
| `/auth/login` | Sign-in |
| `/admin/**` | Authenticated administration |
| `/api/v1/health` | API and database health |
| `/api/v1/public/**` | Public API, including travel data and the rate-limited order endpoint |

The old `(app)` routes redirect to `/admin/**` for compatibility. Add new protected screens under `portal/src/app/(admin)/admin/`. Do not use the development Compose file on the VPS; production uses `deploy/compose.yml`.

## Repository map

~~~text
backend/
  prisma/                    Schema, migrations, initial seed
  packages/contracts/        Source of truth for API schemas, permissions, money helpers
  packages/mn-integrations/  Backend-only bank, tax, SMS, and QR integrations
  src/lib/                   Environment, Prisma, soft delete, errors
  src/modules/               Domain services, routes, and integration tests
  src/routes/                Shared API route mounting
  scripts/gen-contracts.mjs  Copies contracts into the portal
portal/
  src/app/                   Thin Next.js routes and layouts
  src/features/              Domain hooks, API wrappers, and screens
  src/api/generated/         Generated contracts; never edit by hand
  src/components/            Shared UI, data, form, and layout components
  src/lib/api/apiClient.ts    Shared HTTP client
  src/platform/              Web/Capacitor adapter boundary
deploy/                      Production Compose, Nginx, backup, deploy scripts
.github/workflows/           CI and production deployment
~~~

## Daily development commands

Run these from the application directory:

| Backend | Portal | Purpose |
| --- | --- | --- |
| `pnpm dev` | `pnpm dev` | Development server |
| `pnpm typecheck` | `pnpm typecheck` | TypeScript and package checks |
| `pnpm lint` | `pnpm lint` | Biome checks |
| `pnpm lint:fix` | `pnpm lint:fix` | Apply Biome's safe fixes |
| `pnpm test:run` | `pnpm test:run` | Unit and integration tests |
| `pnpm build` | `pnpm build` | Production build |

Additional commands:

~~~bash
cd backend
pnpm db:migrate          # Create/apply a Prisma migration in development.
pnpm db:deploy           # Apply committed migrations; used in production.
pnpm db:generate         # Regenerate the Prisma client after schema changes.
pnpm db:seed             # Initial organization, roles, owner, and demo travel.
pnpm db:studio           # Inspect the local database with Prisma Studio.
pnpm gen:contracts       # Regenerate portal/src/api/generated/contracts.
pnpm db:test:setup       # Prepare the separate local test database.
pnpm infra:up            # Start local Docker services.
pnpm infra:down          # Stop them without removing data volumes.

cd ../portal
pnpm build:mobile        # Capacitor static export to out/.
~~~

The backend's development Compose database is named `uizeniveelt` and its test database is `uizeniveelt_test`. CI instead creates an isolated `starter_test` database. Integration tests clear their **test** database between cases, so never point `TEST_DATABASE_URL` at development or production data. For a local integration-test run, start the backend Compose services, run `pnpm db:test:setup` once, then `pnpm test:run` from `backend/`. `docker compose down` preserves local volumes; `docker compose down -v` deletes them.

## Rules that prevent common mistakes

- API contracts and permissions belong to `backend/packages/contracts/src/`. After changing them, run `cd backend && pnpm gen:contracts` and commit the generated portal copy. Never hand-edit `portal/src/api/generated/`.
- Keep `@winu/mn-integrations` and all secrets on the backend. The portal must not depend on backend packages.
- Put new domain code in `src/modules/<domain>/` on the backend and `src/features/<domain>/` in the portal. Keep route files thin; protected API endpoints need `requirePermission()` and integration coverage. Keep public API endpoints under `/api/v1/public/**` and expose only intended public fields.
- Use TanStack Query and `apiClient.ts` for portal server state. Put screen state/actions in `use<X>Screen()` hooks. Use `useIsMobile()` for responsive logic.
- Build UI from existing shadcn primitives. Do not edit `portal/src/components/ui/` or `portal/src/app/globals.css` directly. Avoid `"use server"` because the Capacitor export cannot use it.
- TanStack Table is version 9. Use this repository's `useDataTableState()` and `useDataTable()` helpers; version 8 examples do not apply.
- One deployment represents one organization; do not add an `orgId` scope to domain tables. Money is stored as integer minor units (`...Minor`) and calculated with the contracts money helpers. Editable models use a `version` field for optimistic locking; mutations must write audit records. Soft-deleted models are filtered by the Prisma extension in `backend/src/lib/softDelete.ts`; register new soft-deleted models there.
- File uploads use a backend-issued presigned URL, followed by a direct client upload to object storage. Do not proxy file bodies through the API.
- Before changing Next.js code, read the relevant guide in `portal/node_modules/next/dist/docs/`. For mobile builds, avoid dynamic `[slug]` pages for changing data; use a query parameter and a Suspense boundary around `useSearchParams()`.

Read [AGENTS.md](./AGENTS.md) and [RULES.md](./RULES.md) before implementation; they contain the full repository rules.

## Database changes, seeds, and existing data

Prisma schema changes need a committed migration in `backend/prisma/migrations/`. `pnpm db:deploy` applies pending migrations exactly once; it does **not** infer a migration from `schema.prisma` or run `db:seed`. CI applies migrations to PostgreSQL and checks migration/schema drift.

The full seed is for initial setup. Re-running it on production can change role permissions and the owner's role. A change to `seedTravelDemo()` alone does not update a travel that is already in production. **Do not add the full seed to every deploy.**

For a one-time change to existing production rows:

1. Add a versioned SQL data migration, even if `schema.prisma` does not change. See `backend/prisma/migrations/20261026190000_backfill_existing_demo_travel_sections/`.
2. Target only the intended rows. Preserve non-null editor-managed values and soft deletions, increment model versions when updating, write an audit entry without sensitive data, and use a transaction.
3. Add an integration test that starts with the *old* data shape. Verify the new values, preservation of user edits, and safe repeated execution.
4. Run backend typecheck, lint, tests, and build. Review destructive SQL such as `DROP`, `TRUNCATE`, and broad `UPDATE` statements before pushing.
5. Push to `main` only after review. CI must pass before the deployment workflow applies the migration. The deploy script takes a database snapshot before migrations.

Permission-list changes are a separate case: `AGENTS.md` requires `pnpm db:seed` to update stored roles after adding permissions. Review any customized roles first; do not make this an unconditional deploy step.

## Production deployment and VPS verification

A successful push to `main` runs CI, builds commit-tagged API and portal images, then deploys that exact commit to the VPS when `DEPLOY_ENABLED=true`. The workflow copies `deploy/` to `/opt/bgtravel/` and runs `deploy.sh`. The script pulls application images, creates and validates a **pre-migration PostgreSQL dump**, retains only the newest automatic dump, applies Prisma migrations, starts the containers, and runs HTTP smoke checks. If the backup fails, migrations do not run. Application-image rollback does **not** roll back database migrations, so migrations must remain compatible with the previous application version.

After the deployment workflow completes, connect to the VPS and verify:

~~~bash
cd /opt/bgtravel
cat .deployed-tag                    # Compare with the intended full commit SHA.
export IMAGE_TAG="$(cat .deployed-tag)"
docker compose --env-file stack.env -f compose.yml ps
find backups -maxdepth 1 -type f -name 'pre-migration-*.dump' -printf '%f %s bytes\n'
docker compose --env-file stack.env -f compose.yml exec -T postgres \
  psql -U bgtravel -d bgtravel -c \
  'SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;'
curl -fsS https://www.bgtravel.mn/api/v1/health
~~~

There should be one automatic dump in `/opt/bgtravel/backups/`. Verify the actual changed records through a read-only SQL query or the relevant public API; an HTTP 200 alone does not prove the data migration worked. If a deploy fails, inspect its logs and the database state before retrying. Never use `db:seed`, `prisma migrate reset`, `db push`, or `docker compose down -v` as a production recovery shortcut. After fixing the cause of a failed deploy, the full deploy script can be rerun with a published, CI-approved commit:

~~~bash
cd /opt/bgtravel
release_sha=PASTE_FULL_40_CHARACTER_COMMIT_SHA_HERE
bash ./deploy.sh "$release_sha"
~~~

The single retained dump is from **before** its deployment. It contains PostgreSQL user data, but not MinIO objects or the legacy travel-image volume. It is stored on the same VPS, so it cannot protect against losing that server or data already damaged before the snapshot. Keep an offsite copy and test restoration in an isolated database before any high-risk migration. A replacement dump temporarily needs disk space alongside the current one; the old dump is removed only after the new archive passes validation.

Routine app deploys do not refresh the PostgreSQL, MinIO, or Nginx images. Provision or upgrade those infrastructure images separately. See the [VPS operations guide](./docs/deployment/datacom-vps.md) for credentials, DNS/TLS, volumes, and deployment setup.

## Mobile builds and further documentation

The web build uses Next.js standalone output; `pnpm build:mobile` creates the static export used by Capacitor. The portal also has `build:cap:android:*` and `build:cap:ios:*` scripts for remote-webview and packaged builds. Platform-specific code belongs under `portal/src/platform/`. See [Capacitor build notes](./docs/mobile/capacitor-build.md) and [the platform adapter guide](./portal/src/platform/README.md).

- [Travel domain plan](./docs/travels/travel-domain-plan.md)
- [Deployment and VPS operations](./docs/deployment/datacom-vps.md)
