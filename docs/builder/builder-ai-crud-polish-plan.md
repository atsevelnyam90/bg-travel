# Builder AI CRUD Polish Plan

## Goal

Builder-ийг бүх product UI-ийн суурь болгохгүй. Харин олон давтагдах admin/internal
CRUD screen-ийг хурдан үүсгэх accelerator болгоно.

AI workflow-ийн зорилго:

```text
"customers table дээр admin CRUD гарга"
```

гэсэн хүсэлтэд AI frontend/backend screen-ийг шинээр ихээр бичихийн оронд:

1. table metadata уншина
2. builder form/list/view metadata үүсгэнэ
3. select relation mapping тохируулна
4. хэрэгтэй custom trigger/endpoint-ийг л scaffold хийнэ
5. smoke validation ажиллуулна

## Scope Boundary

Builder ашиглахад тохиромжтой:

- admin CRUD
- lookup/master data
- simple internal operations grid/form
- content/settings төрлийн table
- form/list layout байнга өөрчлөгдөх магадлалтай хэсэг

Code-р хийх нь дээр:

- customer-facing polished UX
- booking/payment/checkout flow
- dashboard/chart/report-heavy screen
- олон алхамтай workflow
- өндөр эрсдэлтэй domain action
- нарийн permission/action logic

## Polish Items

### 1. Table-Backed Select UI

Одоогийн байдал:

- `optionsSource` schema, runtime dropdown, backend option query support байгаа.
- Admin editor дээр зөвхөн `Static options` textarea харагдаж байна.
- Table-backed select metadata-г гараар үүсгэх боломжтой ч UI-аар тохируулах боломж дутуу.

Хийх зүйл:

- Select field дээр `Static` / `Table` mode сонголт нэмэх.
- Table mode дээр дараах controls харуулах:
  - options table
  - value field
  - label field
  - search fields
  - depends on field
  - filter field
- Static mode дээр одоогийн `Static options` textarea-г үлдээх.

Acceptance:

- Admin editor дээр select field-ийг table-backed dropdown болгож хадгалж чадна.
- Edit хийхэд saved `optionsSource` буцаад UI дээр зөв populate болно.
- Runtime form дээр dropdown table-оос option татна.

### 2. Table to Form/List/View Auto-Create

Хийх зүйл:

- "Create from table" flow эсвэл AI-д дуудах script/API нэмэх.
- Table сонгоод дараах metadata автоматаар үүсгэх:
  - Form fields
  - List columns
  - View pairing
  - default permissions
  - default layout
- System columns-ыг form/list-ээс зөв шүүх:
  - `id`
  - `createdAt`
  - `updatedAt`
  - `deletedAt`
  - `version`

Acceptance:

- Нэг table сонгоод working DynamicView үүснэ.
- Generated form/list/view runtime route дээр нээгдэнэ.
- Create/list/update хамгийн энгийн smoke flow ажиллана.

### 3. Metadata Seed/Export/Import

Хийх зүйл:

- Builder form/list/view metadata-г JSON export хийх command/script.
- JSON-оос seed/import хийх command/script.
- Project seed дээр заавал байх admin screens-ийг дахин үүсгэх боломжтой болгох.

Acceptance:

- Local DB reset хийсний дараа builder admin screens seed-ээр буцаад орно.
- Metadata diff/review хийхэд JSON уншигдахуйц байна.
- Deploy хийхэд builder metadata алга болохгүй.

### 4. Trigger Scaffold Pattern

Хийх зүйл:

- Trigger route template тодорхой болгох:
  - beforeCreate
  - beforeUpdate
  - beforeDelete
  - field onChange
  - field onBlur
- AI trigger нэмэхдээ ашиглах file layout, naming, validation, error format-ыг document хийх.
- Trigger input/output examples нэмэх.

Acceptance:

- AI "slug auto-generate trigger нэм" гэхэд predictable route/code үүсгэнэ.
- Trigger response нь builder contract schema-гаар parse хийгдэнэ.
- Trigger-д secret/full object audit meta оруулахгүй.

### 5. Validation and Guardrails

Хийх зүйл:

- Select `optionsSource` table/column байгаа эсэхийг validate хийх.
- `valueField`, `labelField`, `filterField` option query-д тохирох эсэхийг шалгах.
- Required builder field nullable DB column-той зөрж байгаа эсэхийг анхааруулах.
- Runtime CRUD-д protected/system columns орохгүй байх guardrail нэмэх.

Acceptance:

- Bad metadata save хийх үед ойлгомжтой алдаа өгнө.
- Missing table/column runtime дээр биш editor/save дээр баригдана.
- Soft delete/version/id fields санамсаргүй editable болохгүй.

### 6. Smoke Validation

Хийх зүйл:

- Builder view үүссэний дараах smoke checklist/script:
  - runtime view load
  - list entries load
  - create entry
  - update entry
  - table-backed select options load
- AI ажил дуусгахдаа энэ smoke-г ажиллуулдаг болгох.

Acceptance:

- "Metadata үүссэн" гэдэг нь "runtime ажиллаж байна" гэсэн баталгаатай ойр болно.
- Builder regression хурдан баригдана.

## Priority

1. Table-backed select UI
2. Table to Form/List/View auto-create
3. Metadata seed/export/import
4. Trigger scaffold pattern
5. Validation and guardrails
6. Smoke validation

## Implementation Location

Core builder package:

```text
/Users/dulguundulguun/Desktop/cosoline/winu-builder/packages/builder-ui
/Users/dulguundulguun/Desktop/cosoline/winu-builder/packages/builder-backend
/Users/dulguundulguun/Desktop/cosoline/winu-builder/packages/builder-contracts
```

Host project integration:

```text
backend/src/modules/builder
portal/src/features/builder
```

Principle:

- Generic capability-г `winu-builder` package дээр засна.
- App-specific datasource/trigger/domain behavior-г host project дээр үлдээнэ.
- Builder package нь app domain entity мэдэхгүй.

