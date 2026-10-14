# Current Builder App Overview

Энэ document нь одоогийн working tree дээр Builder app яг яаж ажиллаж байгааг
нэг дор тайлбарласан snapshot юм.

## 1. Гол Model

Builder-ийн үндсэн 3 entity:

- `Form`: field schema. Ямар талбаруудтай form render хийхийг хэлнэ.
- `List`: column schema. Ямар баганатай table/list render хийхийг хэлнэ.
- `View`: `Form` + `List`-ийг нийлүүлсэн runtime CRUD screen.

Builder metadata:

- `builder_definitions`: `Form` болон `List` хадгална.
- `builder_views`: `Form`/`List` pairing, permission, trigger config хадгална.
- `builder_schema_migrations`: builder package schema version хадгална.

Domain data-г Builder өөр дээрээ хадгалахгүй. Жишээ нь `products`,
`website_pages`, `website_sections` зэрэг host app-ийн table дээр runtime CRUD
хийдэг.

## 2. Package Layout

Backend package:

```text
../winu-builder/packages/builder-backend/src
  router/
  usecases/
  runtime/
  metadata/
  datasources/
  triggers/
  migrations/
```

Frontend package:

```text
../winu-builder/packages/builder-ui/src
  api/
  hooks/
  components/
  runtime/
  admin/
```

Contracts:

```text
../winu-builder/packages/builder-contracts/src
```

Host backend wrapper:

```text
backend/src/modules/builder/
```

Host portal wrapper:

```text
portal/src/features/builder/
```

## 3. Backend Flow

Admin endpoints:

```text
GET    /api/v1/builder/datasources/tables
GET    /api/v1/builder/forms
POST   /api/v1/builder/forms
GET    /api/v1/builder/forms/:id
PATCH  /api/v1/builder/forms/:id
DELETE /api/v1/builder/forms/:id

GET    /api/v1/builder/lists
POST   /api/v1/builder/lists
GET    /api/v1/builder/lists/:id
PATCH  /api/v1/builder/lists/:id
DELETE /api/v1/builder/lists/:id

GET    /api/v1/builder/views
POST   /api/v1/builder/views
GET    /api/v1/builder/views/:id
PATCH  /api/v1/builder/views/:id
DELETE /api/v1/builder/views/:id
```

Runtime endpoints:

```text
GET   /api/v1/builder/runtime/forms/:id
POST  /api/v1/builder/runtime/forms/:id/entries
GET   /api/v1/builder/runtime/lists/:id
GET   /api/v1/builder/runtime/lists/:id/entries

GET    /api/v1/builder/runtime/views/:viewId
GET    /api/v1/builder/runtime/views/:viewId/entries
POST   /api/v1/builder/runtime/views/:viewId/entries
PATCH  /api/v1/builder/runtime/views/:viewId/entries/:id
DELETE /api/v1/builder/runtime/views/:viewId/entries/:id

POST  /api/v1/builder/runtime/views/:viewId/composite-entries
PATCH /api/v1/builder/runtime/views/:viewId/composite-entries/:id
```

Request flow:

1. Express router request авна.
2. Admin route бол host `adminGuard` ажиллана.
3. Runtime route бол host `requireAuth` ажиллана.
4. `schemaGuard` builder migration version шалгана.
5. Controller request body/query-г contract schema-аар parse хийнэ.
6. Usecase metadata уншина.
7. Runtime adapter domain table дээр CRUD хийнэ.
8. Mutation бол audit бичнэ.
9. JSON response буцаана.

## 4. Generic Runtime

Generic runtime нь DB table metadata уншаад dynamic CRUD хийдэг.

Core package file:

```text
../winu-builder/packages/builder-backend/src/runtime/genericRuntimeAdapters.ts
```

Host repository:

```text
backend/src/modules/builder/repositories/genericRuntimeRepository.ts
```

List behavior:

- `information_schema.columns`-оос column list авна.
- Blocked table шалгана.
- Hidden columns нууж байна: `deletedAt`, `passwordHash`, `tokenHash`, `replacedBy`.
- Selected columns л query-д орно.
- `deletedAt IS NULL` автоматаар filter хийнэ.
- Search нь `CAST(column AS TEXT) ILIKE '%term%'`.
- Sort нь list schema дээр `sortable: true` байгаа column л зөвшөөрнө.
- Count query болон rows query зэрэг явна.

Create/update/delete behavior:

- System fields write хийхгүй: `id`, `version`, `createdAt`, `updatedAt`, `deletedAt`.
- `checkbox`, `money`, `number`, `date`, `select` conversion хийдэг.
- `money` нь integer minor unit шаардана.
- Static select field дээр options-оос гадуурх value reject хийнэ.
- `version` column байвал optimistic locking хийдэг.
- Stale update одоо `409 CONFLICT` буцаана.
- Soft delete table бол `deletedAt` set хийнэ.

## 5. Composite/Subform

Composite flow нь parent row болон child rows-ийг нэг transaction-д хадгална.

Example:

```text
Parent table: website_pages
Child table:  website_sections
Relation:     website_sections.pageId -> website_pages.id
```

Form schema дотор `subforms` config байна:

```text
subforms:
  key: sections
  viewId: child view id
  parentField: id
  childField: pageId
```

Create flow:

1. Parent row create хийнэ.
2. Parent id-г child row-ийн `pageId` руу force хийдэг.
3. Client явуулсан `pageId` override хийгдэнэ.
4. Child rows create хийнэ.
5. Бүгд transaction дотор явна.

Update flow:

1. Parent row update хийнэ.
2. Existing child row update хийж болно.
3. New child row add хийж болно.
4. Existing child row `_delete: true` бол delete/soft delete хийнэ.
5. Child stale version бол parent update rollback болно.
6. Parent stale version бол child mutation явахгүй.

Integration tests:

```text
backend/src/modules/builder/builder.integration.spec.ts
```

## 6. Trigger

Builder хоёр төрлийн trigger-тэй.

Lifecycle trigger:

```text
beforeCreate
afterCreate
beforeUpdate
afterUpdate
beforeRead
afterRead
beforeDelete
afterDelete
```

Field trigger:

```text
onChange
onBlur
```

Field trigger нь зөвхөн product slug, discount хоёр дээр хязгаарлагдахгүй.
Эдгээр нь одоо starter дотор бүртгэгдсэн app-side handler-ийн жишээ.
Builder field бүрийн `triggers` config дээр `event` + `action` тавьж болно.
Builder core нь тухайн field-ийг олж, тохирох trigger-үүдийг ажиллуулаад
`action` string-ийг host app-ийн trigger registry рүү dispatch хийнэ.

Практик утга:

- хүссэн field дээр trigger тавьж болно;
- `action` нь host талын registry-д бүртгэлтэй handler байх ёстой;
- builder package өөрөө `Product`, `discount`, `slug` гэх domain logic мэдэхгүй;
- generic formula/copy/slugify action engine одоогоор package дотор built-in биш.

Core files:

```text
../winu-builder/packages/builder-backend/src/usecases/builderRuntimeUseCases.ts
../winu-builder/packages/builder-backend/src/triggers/runBuilderTriggers.ts
backend/src/modules/builder/triggers/runBuilderFieldTrigger.ts
backend/src/modules/appTriggers/fieldRegistry.ts
```

## 7. Frontend Flow

Portal дээр Builder дараах байдлаар угсрагдана:

1. `createBuilderApiClient` endpoint wrapper үүсгэнэ.
2. `createBuilderHooks` React Query hooks үүсгэнэ.
3. `DynamicForm`, `DynamicList`, `DynamicView` package factory-аас host UI adapter-тай угсарна.
4. `DataForm` actual field render хийдэг.
5. `RuntimeEntryDialog` row create/edit dialog харуулна.
6. `RuntimeSubformField` child rows удирдана.

Core package files:

```text
../winu-builder/packages/builder-ui/src/api/createBuilderApiClient.ts
../winu-builder/packages/builder-ui/src/hooks/createBuilderHooks.ts
../winu-builder/packages/builder-ui/src/components/DynamicForm.tsx
../winu-builder/packages/builder-ui/src/components/DynamicList.tsx
../winu-builder/packages/builder-ui/src/components/DynamicView.tsx
```

Host portal files:

```text
portal/src/components/data/DataForm.tsx
portal/src/features/builder/components/RuntimeEntryDialog.tsx
portal/src/features/builder/components/RuntimeSubformField.tsx
```

## 8. React Query / Cache

Builder UI package нь React Query ашиглана.

Key groups:

- `builder/forms`
- `builder/lists`
- `builder/views`
- `builder/runtime/form/:id`
- `builder/runtime/list/:id`
- `builder/runtime/view/:id`
- `builder/runtime/view/:id/entries`

Runtime view entry mutation дараа:

- runtime view detail invalidate хийнэ.
- runtime view entries invalidate хийнэ.

Энэ нь create/update/delete/composite mutation дараа grid хуучин cache харуулах
эрсдэлийг багасгасан.

## 9. Одоогийн Чадвар

Ажиллаж байгаа:

- Form/List/View admin CRUD
- DB table import
- Dynamic form/list/view render
- Generic table create/update/delete/list
- Composite parent-child create/update/delete
- Field trigger
- Lifecycle trigger basic flow
- Optimistic locking
- Soft delete
- Audit
- Package build/typecheck/test

## 10. Одоогийн Сул Тал

Performance:

- Generic search `CAST(column AS TEXT) ILIKE '%term%'` тул index ашиглахгүй.
- Generic filter `CAST(column AS TEXT) = value` тул index ашиглахгүй.
- Request бүр `information_schema.columns` уншина.
- Offset pagination ашиглаж байна.
- Count query бүр явна.
- Subform олон бол child view/entries query олон болно.

UX:

- Field-level backend error UI mapping дутуу.
- Subform draft/delete UX polish дутуу.
- Error message map бүрэн биш.

Package readiness:

- Subform/composite frontend orchestration host portal дээр үлдсэн.
- External package smoke/publish story бүрэн биш.

## 11. Reliability Snapshot

Одоогийн үнэлгээ:

- Internal production/admin use: боломжийн.
- High-volume runtime use: болгоомжтой.
- External client self-service builder: арай эрт.

Сүүлд баталгаажсан validation:

- Backend builder integration: 67 tests passed.
- Backend typecheck/lint passed.
- Builder backend package build/typecheck/test passed.
- Builder UI package build/typecheck/test passed.

Одоогийн ерөнхий readiness:

```text
Reliability: 78-82%
Performance: 6.5/10
```

## 12. Дараагийн Чухал Ажил

Performance hardening:

1. Table column metadata cache.
2. Search strategy: explicit searchable columns + trigram/index requirement.
3. Filter дээр cast арилгаж typed compare хийх.
4. Optional lightweight pagination without `COUNT(*)`.
5. Subform metadata/entries batching эсвэл prefetch.
6. Field trigger cancellation/stale response ignore.

UX/package hardening:

1. Backend field errors -> React Hook Form field errors.
2. Subform draft/delete UX сайжруулах.
3. RuntimeSubformField package-owned factory болгох.
4. Composite orchestration package руу бүрэн гаргах.
5. External package smoke test нэмэх.
