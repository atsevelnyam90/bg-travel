# Builder Subform Plan

## Зорилго

Builder form дээр parent record-той холбоотой child rows-ийг modal-аар удирдах generic
subform capability нэмнэ.

Энэ нь website/content-ийн custom feature биш. ERP project бүрт хэрэг болох builder core
боломж байна.

## Mental Model

```text
Parent View
  Form
    normal fields
    subforms linkage config

Subform Button
  -> child View modal нээнэ
  -> child entries нь parent value-аар filter хийнэ
  -> child create хийхэд child link field автоматаар бөглөгдөнө
```

Жишээ:

```text
Website Content form нээгдэнэ
  -> "Items нэмэх" button дарна
  -> Website Content Items modal нээгдэнэ
  -> item нэмэхэд child.parentId = parent.id
```

## Шийдвэр

Subform data-г JSON дотор хадгалахгүй. Child data нь table row байна.

Шалтгаан:

- list/grid дээр харах, filter/sort/search хийхэд table цэвэр
- audit/version/permission дээр builder-ийн одоогийн flow ашиглагдана
- public endpoint aggregate хийхэд child rows-ийг deterministic уншина
- дараа real relation болон reporting хийхэд JSON задлах шаардлагагүй

JSON нь зөвхөн config/payload-д тохирно. Repeatable child data table дээр байна.

## Contract Shape

`BuilderFormSchema` дээр `subforms` config нэмнэ. Subform нь data field type биш,
parent form дээрх холбоос/харагдах action байна.

```ts
{
  fields: [...],
  layout: {...},
  subforms: [
    {
      key: "items",
      label: "Items",
      viewId: "...",
      parentField: "id",
      childField: "parentId",
      buttonLabel: "Item нэмэх",
      icon: "plus"
    }
  ],
}
```

Тайлбар:

- `viewId`: modal дотор дуудах child Dynamic View.
- `parentField`: parent entry дээрээс авах field. Ихэнхдээ `id`, гэхдээ `slug`, `key` байж болно.
- `childField`: child form/table дээр parent value хадгалах field. Ихэнхдээ `parentId`.
- `label`: parent form дээр харагдах block title/button group label.
- `buttonLabel`: modal нээх button text.
- `icon`: icon key. MVP дээр optional, default icon ашиглана.

## Runtime Rules

Subform action нь create form дээр disabled/placeholder state байна.

```text
Parent entry байхгүй эсвэл parentField value байхгүй
  -> "Эхлээд parent record хадгална" state

Parent field value байгаа
  -> subform button идэвхтэй
  -> button дарахад modal нээгдэнэ
  -> modal list query filterField=childField, filterValue=parentValue явна
  -> modal create form childField=parentValue default-той явна
```

Эхний pass дээр subform нь `DynamicView` runtime дээр edit dialog дотор ажиллана.
Standalone `DynamicForm` дээр parent entry id байхгүй тул button disabled байна.

## Backend API

Одоогийн runtime entries endpoint дээр controlled filter нэмнэ:

```text
GET /api/v1/builder/runtime/views/:viewId/entries?filterField=parentId&filterValue=:value
POST /api/v1/builder/runtime/views/:viewId/entries
```

Create үед frontend `values[childField] = parentValue` дамжуулна. Backend талд:

- `filterField` child form/list schema-д байгаа эсэхийг шалгана
- filter column allowlist нь child list/form schema-ээс гарна
- raw client column шууд Prisma/SQL рүү оруулахгүй

MVP дээр dedicated subform endpoint хийхгүй. Existing runtime entries API-г controlled query
extension-оор ашиглана.

## Frontend UI

Runtime entry dialog нь form fields-ийн доор configured subforms render хийнэ:

```text
Subform label
[icon] buttonLabel
```

Button дарахад `RuntimeEntryDialog`-оос тусдаа `RuntimeSubformDialog` нээнэ:

```text
Dialog title: subform.label
Child list/grid
Add button
Child create/edit dialog
```

MVP дээр nested subform-ийг хаана. Child form дотор дахин subform байвал render хийхгүй эсвэл
disabled state харуулна. Энэ нь circular modal complexity-оос хамгаална.

## Editor UI

Form editor дээр ерөнхий `Subforms` хэсэг байна:

- child View select
- parent field select (`id` болон parent form fields)
- child field input
- button label
- icon key optional

Subform нь data column биш. Table-аас fields import хийхэд автоматаар үүсэхгүй.
Developer/Admin гараар нэмнэ.

## Validation

Contract:

- `subform.viewId`, `parentField`, `childField` required.
- `parentField` нь `id` эсвэл parent form field байж болно.

Runtime:

- child view олдохгүй бол friendly error.
- parent value байхгүй бол API дуудахгүй.
- child filter field child form/list schema-д байхгүй бол error.

## Security

- Parent view permission хэвээр.
- Child view-ийн read/write permission тусдаа шалгагдана.
- UI дээр нуух нь хамгаалалт биш. Backend runtime action бүр permission шалгана.
- Parent filter query нь allowlisted field дээр л ажиллана.

## Implementation Order

1. Contract schema-д form-level `subforms` config нэмэх.
2. `pnpm gen:contracts`.
3. Builder editor state-д subform values/input mapping нэмэх.
4. Form editor UI дээр subform config controls нэмэх.
5. Runtime entry list query-д controlled filter contract/backend support нэмэх.
6. Builder API client/hooks query type-ийг parent filter-тэй ажиллуулна.
7. Runtime entry dialog дээр subform renderer нэмэх.
8. `RuntimeSubformDialog` component нэмэх.
9. Integration/unit tests:
   - subform schema round-trip
   - entries parent filter
   - create child with parent id
   - no parent id state
10. Verification:
   - backend `pnpm gen:contracts`
   - backend `pnpm typecheck && pnpm lint && pnpm test:run`
   - portal `pnpm typecheck && pnpm lint`
   - builder-ui focused tests

## Out Of Scope For MVP

- Deep nested subforms.
- Drag/drop child ordering UI.
- Custom per-subform columns outside child List schema.
- Cascade delete.
- Client-side expression language.

## Decision

Subform нь builder-ийн generic feature. Content-specific JSON workaround биш.
Data table дээр child rows хадгалж, builder runtime дээр parent-filtered child view modal-аар
удирдана.
