# winu-starter

Шинэ клиентийн төслийг эхлүүлэх суурь. Төлөвлөгөө: `~/Desktop/docs/` (00–09).

`backend/` болон `portal/` нь **тус тусдаа бие даасан төсөл** — winu шиг folder-ыг нь
нээгээд шууд асаана. Дундын workspace, root package.json байхгүй.

```
winu-starter/
  backend/     Node + Express 5 + tsup        :4000
    packages/
      contracts/          zod — API-ийн ЭЗЭН
      mn-integrations/    e-Barimt, ДАН, банк, SMS, QR
  portal/      Next.js 16 + Tailwind 4 + shadcn/ui    :3000
  admin/       3 дахь app нэмбэл ижил хэлбэрээр
```

## Асаах

```bash
# 1-р терминал — backend
cd backend
cp .env.example .env
docker compose up -d     # Postgres :5433, Redis :6380
pnpm install
pnpm db:seed             # байгууллага + role + owner
pnpm dev                 # migration + generate хийгээд http://localhost:4000/api/v1/health

# 2-р терминал — portal
cd portal
cp .env.example .env.local
pnpm install
pnpm dev                 # http://localhost:3000
```

## Командууд (folder бүрд ижил)

```bash
pnpm dev
pnpm typecheck           # засвар бүрийн дараа ЗААВАЛ
pnpm lint  /  pnpm lint:fix
pnpm test:run
pnpm build
```

### Тест (backend)

Integration тест нь бодит Postgres шаардана — **тусдаа `starter_test` DB**,
dev өгөгдөл хөндөгдөхгүй:

```bash
cd backend
docker compose up -d
pnpm db:test:setup       # нэг удаа
pnpm test:run
```

`portal`-д нэмэлт: `pnpm build:mobile` — Capacitor (`output: export` → `out/`)

`backend`-д нэмэлт:

| Команд | Юу хийх |
|---|---|
| `pnpm gen:contracts` | contract → portal |
| `pnpm infra:up` / `infra:down` | Postgres, Redis, Mailpit, MinIO |
| `pnpm db:prepare` | migration deploy + Prisma generate |
| `pnpm db:deploy` / `db:migrate` | migration |
| `pnpm db:seed` | байгууллага + 4 role + owner |
| `pnpm db:studio` | Prisma Studio |

## Docker

`backend/docker-compose.yml`:

| Үйлчилгээ | Порт | Тайлбар |
|---|---|---|
| Postgres | **5433** | Үндсэн DB (+ `starter_test`) |
| Redis | **6380** | Ирээдүйн queue/cache (одоогоор ашиглагдаагүй) |
| Mailpit | 1025 / **8025** | Dev SMTP — и-мэйл гадагш явахгүй, UI дээр харагдана |
| MinIO | 9000 / **9001** | S3-тэй нийцтэй файл хадгалалт |

> Портууд default-аас өөр байгаа шалтгаан: хөгжүүлэгчийн машин дээр аль хэдийн
> Postgres (5432) ажиллаж байх нь элбэг. Түүнийг булаахгүйн тулд шилжүүлсэн.

```bash
docker compose up -d      # асаах
docker compose down       # зогсоох (өгөгдөл үлдэнэ)
docker compose down -v    # өгөгдлийг ч устгах
```

Seed-ийн үүсгэх owner: `owner@example.mn` / `ChangeMe123!`
(`SEED_OWNER_EMAIL`, `SEED_OWNER_PASSWORD`-оор солино).

## Contract

API-г backend тодорхойлно. `backend/packages/contracts` бол цорын ганц эх сурвалж.

```
backend/packages/contracts/src ──[ pnpm gen:contracts ]──▶ portal/src/api/generated
```

Contract өөрчилсний дараа **заавал** `pnpm gen:contracts` ажиллуулж commit хий.
CI дээр `contracts-in-sync` шалгана.

## Builder Packages

Starter дотор builder нь workspace package хэлбэрээр явна:

| Package | Хаана | Үүрэг |
|---|---|---|
| `@winu/contracts` | `backend/packages/contracts` | API contract, permission, builder schema |
| `@winu/builder-backend` | `backend/packages/builder-backend` | Builder API, runtime, trigger, metadata migration |
| `@winu/builder-ui` | `portal/packages/builder-ui` | Dynamic form/list/view renderer, admin UI factories |

Starter дээр тусдаа publish хийхгүйгээр ажиллана:

```bash
cd backend
pnpm install
pnpm builder:migrate      # builder metadata schema
pnpm dev

cd ../portal
pnpm install
pnpm dev
```

`backend` болон `portal`-ын `dev`, `build`, `typecheck` command-ууд package build-ийг
автоматаар түрүүлж ажиллуулна.

Өөр project-д builder-ийг тараах үед private registry ашиглана:

```bash
# backend project
pnpm add @winu/contracts @winu/builder-backend
pnpm builder:migrate

# portal project
pnpm add @winu/builder-ui
```

Update хийхэд package code update болон DB migration хоёр тусдаа алхам:

```bash
cd backend
pnpm update @winu/contracts @winu/builder-backend
pnpm builder:migrate

cd ../portal
pnpm update @winu/builder-ui
```

App code шууд package factory-уудыг эсвэл starter-ийн host wrapper-уудыг ашиглана:

```tsx
<DynamicForm formId="..." />
<DynamicList listId="..." />
<DynamicView viewId="..." />
```

Дэлгэрэнгүй:

- [Backend builder package](./backend/packages/builder-backend/README.md)
- [Frontend builder package](./portal/packages/builder-ui/README.md)
- [Builder architecture](./docs/builder/winu-builder.md)

## ⚠️ Сервер / клиент хил

`mn-integrations` дотор банкны нэвтрэх мэдээлэл уншдаг код байна. Энэ нь **backend-ийн
package** — `portal`-д dependency болгож ч, `portal/src`-ээс import хийж ч болохгүй.
CI (`guards`) шалгана.

Дэлгэрэнгүй дүрэм: [AGENTS.md](./AGENTS.md)
