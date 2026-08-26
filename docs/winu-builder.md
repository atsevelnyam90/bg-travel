# Winu Builder

Энэ document нь `winu-starter` доторх schema-driven builder/runtime layer-ийн
одоогийн зөв архитектур юм.

Зорилго нь Lambda Platform-ыг бүтнээр нь хуулбарлах биш. ERP төсөл бүрт
давтагддаг form, list, CRUD view-ийг хурдан босгодог жижиг, ойлгомжтой,
аюулгүй builder хийх.

## Гол Ойлголт

Builder нь domain feature мэдэхгүй бөгөөд өөрийн metadata-г 2 table дээр хадгална.

Өөрөөр хэлбэл Builder дотор `Product`, `User`, `Order` гэх мэт business entity
хатуу бичигдэхгүй. Builder зөвхөн дараах reusable definition-уудыг мэднэ:

- `Dynamic Form`: талбаруудын schema
- `Dynamic List`: багануудын schema
- `Dynamic View`: нэг Form + нэг List-ийг холбосон runtime CRUD view

```text
Developer/Admin
  -> Dynamic Form үүсгэнэ
  -> Dynamic List үүсгэнэ
  -> Dynamic View дээр Form + List сонгоно
  -> Backend DB-д schema хадгална
  -> Runtime дээр ганц id дамжуулж дуудна
  -> DynamicForm / DynamicList / DynamicView render хийнэ
```

## Нэршил

`screen` гэдэг нэршил ашиглахгүй. User-facing болон шинэ code дээр:

```text
Form  = data оруулах/edit хийх schema
List  = data жагсааж харах column schema
View  = Form + List нийлсэн runtime CRUD view
```

Хуучин `screen`/олон table загвар dev migration-аар цэвэрлэгдсэн.

## Routes

Builder тохиргооны хэсэг:

```text
/winu/builder
/winu/builder/forms
/winu/builder/lists
/winu/builder/views
```

Runtime дээр дуудах хэсэг:

```text
/winu/form?id=:formId
/winu/list?id=:listId
/winu/view?id=:viewId
```

React component-оор дангаар нь дуудах contract:

```tsx
<DynamicForm formId="..." />
<DynamicList listId="..." />
<DynamicView viewId="..." />
```

Runtime contract нь `id`-first. `key` нь зөвхөн legacy/display metadata бөгөөд
заавал бөглөхгүй.

## Datasource

Form/List definition үүсгэхдээ datasource сонгож болно:

```text
none        -> schema-only builder definition
dbTable     -> project DB-ийн public table сонгоно
apiEndpoint -> /api/v1/... base path metadata хадгална
```

`dbTable` сонгоход backend `information_schema.columns`-оос table/column metadata
татаж UI дээр dropdown харуулна. Table сонгоод `Columns татах` дарахад:

- Form fields auto үүснэ
- List columns auto үүснэ
- label/type/required/sortable suggestion автоматаар бөглөгдөнө

Runtime data нь builder metadata table дээр хадгалагдахгүй. `products` болон
`users` datasource-ууд одоогоор бодит table руугаа уншиж/бичиж ажиллана.
Дараагийн шатанд энэ mapping-ийг generic table/API datasource болгоно.

## Backend API

Builder CRUD:

```text
GET    /api/v1/builder/forms
GET    /api/v1/builder/forms/options
GET    /api/v1/builder/datasources/tables
POST   /api/v1/builder/forms
PATCH  /api/v1/builder/forms/:id
DELETE /api/v1/builder/forms/:id
POST   /api/v1/builder/forms/:id/replicate

GET    /api/v1/builder/lists
GET    /api/v1/builder/lists/options
POST   /api/v1/builder/lists
PATCH  /api/v1/builder/lists/:id
DELETE /api/v1/builder/lists/:id
POST   /api/v1/builder/lists/:id/replicate

GET    /api/v1/builder/views
GET    /api/v1/builder/views/:id
POST   /api/v1/builder/views
PATCH  /api/v1/builder/views/:id
DELETE /api/v1/builder/views/:id
POST   /api/v1/builder/views/:id/replicate
```

Runtime:

```text
GET    /api/v1/builder/runtime/forms/:id
GET    /api/v1/builder/runtime/lists/:id
GET    /api/v1/builder/runtime/views/:id
GET    /api/v1/builder/runtime/views/:viewId/entries
POST   /api/v1/builder/runtime/views/:viewId/entries
PATCH  /api/v1/builder/runtime/views/:viewId/entries/:id
DELETE /api/v1/builder/runtime/views/:viewId/entries/:id
```

## Backend Structure

Builder backend нь `winu-backend`-ийн controller/usecase чиглэлтэй ижил boundary
барина. Route нь зөвхөн URL + middleware wiring, controller нь request/response,
usecase нь business flow, datasource нь бодит table/API read/write хариуцна.

```text
backend/src/modules/builder/
  builder.routes.ts          -> URL + middleware wiring
  builderService.ts          -> compatibility facade, usecase export

  controllers/
    builderAdminController.ts
    builderRuntimeController.ts

  usecases/
    builderDefinitionUseCases.ts
    builderDatasourceUseCases.ts
    builderRuntimeUseCases.ts
    builderViewUseCases.ts

  datasources/
    runtimeEntryDatasources.ts

  triggers/
    runBuilderTriggers.ts
    runBuilderFieldTrigger.ts
    triggerTypes.ts
    handlers/
      validateTriggerHandler.ts
      auditTriggerHandler.ts
      callApiTriggerHandler.ts

  shared/
    builderMapper.ts
```

Trigger execution нь `usecases/builderRuntimeUseCases.ts` дотор lifecycle-ийн
зөв цэг дээр сууна. Trigger handler-ууд `triggers/` module дотор allowlist
хэлбэрээр ажиллана.

```text
Form triggers:
  beforeCreate / afterCreate
  beforeUpdate / afterUpdate

List triggers:
  beforeRead / afterRead
  beforeDelete / afterDelete
```

Field trigger нь энэ lifecycle trigger-ээс тусдаа. Field event (`onChange`, `onBlur`)
гарахад backend runtime endpoint дуудагдаж, host backend handler response-оор form state
update хийнэ. MVP дээр `onChange` UI wiring орсон, `onBlur` event schema/endpoint
бэлэн бөгөөд UI wiring дараагийн pass. Дэлгэрэнгүй: [Builder Field Triggers Plan](./builder-field-triggers-plan.md).

## Permission

Одоогийн MVP:

- Builder CRUD нь `org:manage` эрхээр хамгаалагдана.
- Runtime read/write/delete permission нь `Dynamic View` дээр хадгалагдана.
- Form/List дангаар preview хийхэд runtime form/list read endpoint хэрэглэнэ.

Builder CRUD дээр нарийн dev permission дараа нэмж болно. MVP-д заавал биш.
Гол permission нь хэрэглэгч data үүсгэх, харах, засах, устгах runtime action дээр
байх ёстой.

## DB Model

Builder metadata зөвхөн 2 table:

```text
builder_definitions
  type = "form" | "list"
  source = DB table/API metadata
  schema = form fields эсвэл list columns JSON
  triggers = form/list lifecycle trigger metadata

builder_views
  formId = builder_definitions.id
  listId = builder_definitions.id
  triggers = legacy placeholder, шинэ trigger config Form/List дээр хадгалагдана
```

Prisma model:

```prisma
model BuilderDefinition {
  id          String   @id @default(uuid())
  type        String
  title       String
  description String?
  source      Json?
  schema      Json
  triggers    Json?
  version     Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  formViews BuilderView[] @relation("BuilderViewForm")
  listViews BuilderView[] @relation("BuilderViewList")

  @@index([type, createdAt])
  @@map("builder_definitions")
}

model BuilderView {
  id              String   @id @default(uuid())
  title           String
  description     String?
  formId          String?
  listId          String?
  permissionRead  String?
  permissionWrite String?
  triggers        Json?
  version         Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  form BuilderDefinition? @relation("BuilderViewForm", fields: [formId], references: [id], onDelete: SetNull)
  list BuilderDefinition? @relation("BuilderViewList", fields: [listId], references: [id], onDelete: SetNull)

  @@map("builder_views")
}
```

## Frontend Structure

```text
portal/src/app/(app)/winu/
  builder/page.tsx
  builder/forms/page.tsx
  builder/lists/page.tsx
  builder/views/page.tsx
  form/page.tsx
  list/page.tsx
  view/page.tsx

portal/src/features/builder/
  api.ts
  hooks/useBuilder.ts
  components/
    BuilderFormDialog.tsx
    BuilderListDialog.tsx
    BuilderViewDialog.tsx
    BuilderFormsPage.tsx
    BuilderListsPage.tsx
    BuilderViewsPage.tsx
    DynamicForm.tsx
    DynamicList.tsx
    DynamicView.tsx
```

## UX Rules

- Builder UI нь internal admin tool шиг энгийн, хурдан, ойлгомжтой байна.
- Runtime view нь ERP-ийн ердийн page шиг харагдана.
- Form editor нь `DataForm` pattern ашиглана.
- List/View renderer нь shared `DataGrid` pattern ашиглана.
- Builder дээр Product/User гэх мэт domain-specific hardcode оруулахгүй.
- Domain module өөрөө хүсвэл зөвхөн runtime component-д id дамжуулж ашиглана.
- Runtime data нь builder metadata table дээр хадгалагдахгүй. Data нь тухайн
  datasource table/API дээрээ үлдэнэ.

## Example

Product CRUD view хийх:

1. `/winu/builder/forms` дээр form үүсгэнэ.
2. Datasource = `DB table`, table = `products`.
3. `Columns татах` дараад fields auto үүсгэнэ.
4. Хэрэгтэй label/type/required тохируулна.
5. `/winu/builder/lists` дээр list үүсгэнэ.
6. Datasource = `DB table`, table = `products`.
7. `Columns татах` дараад columns auto үүсгэнэ.
8. `/winu/builder/views` дээр view үүсгээд form/list хоёроо холбоно.
9. Runtime route:

```text
/winu/view?id=<view-id>
```

эсвэл component:

```tsx
<DynamicView viewId="..." />
```

Seed-ээр орж ирэх default view id:

```text
Product View = 11111111-1111-4111-8111-111111111113
User View    = 22222222-2222-4222-8222-222222222223
```

Manual fields жишээ:

```text
   - `name`
   - `slug`
   - `price`
   - `status`
```

## Implementation Status

Одоогийн code-д байгаа:

- Backend Prisma models + migration
- Contract schemas
- Builder Definition/View CRUD service
- Runtime Form/List/View endpoints
- DB table introspection endpoint
- Form/List datasource metadata
- Form/List table columns auto-import UI
- Form/List trigger metadata
- Runtime trigger runner skeleton
- Runtime field trigger schema/endpoint + `DataForm` onChange runner
- Validate trigger handler
- Backend router/controller factory in `@winu/builder-backend`
- Builder metadata schema version table + `pnpm builder:migrate`
- Product/User starter example DB table runtime read/write
- Product/User default Form/List/View seed
- Builder API client factory in `@winu/builder-ui`
- Builder React Query hooks factory in `@winu/builder-ui`
- Builder runtime utility helpers in `@winu/builder-ui`
- DynamicForm component factory in `@winu/builder-ui`
- DynamicList component factory in `@winu/builder-ui`
- DynamicView component factory in `@winu/builder-ui`
- RuntimeEntryDialog component factory in `@winu/builder-ui`
- Builder admin Form/List/View manager factories in `@winu/builder-ui`
- Builder form/list editor state helpers in `@winu/builder-ui`
- Builder form/list editor page orchestration factories in `@winu/builder-ui`
- Builder view dialog orchestration factory in `@winu/builder-ui`
- Builder package tarballs exclude test/spec files
- `@winu/contracts`, `@winu/builder-backend`, and `@winu/builder-ui` build/publish `dist`
- Portal API/hook wrappers
- Builder Form/List/View list pages as package adapters
- Form/List/View create/edit dialogs
- Runtime `DynamicForm`, `DynamicList`, `DynamicView`

Шинэ DB migration ажиллуулах:

```bash
corepack pnpm --dir backend db:migrate
corepack pnpm --dir backend builder:migrate
```

Дараа нь contract/client refresh хэрэгтэй бол:

```bash
corepack pnpm --dir backend db:generate
corepack pnpm --dir backend gen:contracts
```

Builder package update хийхдээ `@winu/contracts`-ийг хамт version/update хийнэ:

```bash
pnpm update @winu/contracts @winu/builder-backend @winu/builder-ui
pnpm builder:migrate
```

Workspace дээр `pnpm dev`, `pnpm typecheck`, `pnpm build`, `pnpm build:mobile` нь package
dist-ийг эхэлж build хийнэ.

## Дараагийн Сайжруулалт

- View дээр menu metadata нэмэх
- Builder CRUD-д тусдаа developer permission нэмэх
- Field validation rules өргөжүүлэх
- Generic DB table/API runtime datasource нэмэх
- Relation/select datasource нэмэх
- Import/export schema нэмэх
- Replicate UI-г prompt-оос dialog болгох
- Form/List editor body JSX болон View dialog shell/body-г UI primitive strategy шийдсэний дараа `@winu/builder-ui/admin` руу бүрэн гаргах
