# Builder Composite Form + Trigger Plan

## Зорилго

Builder runtime дээр parent form болон түүнд холбогдсон child rows-ийг нэг form graph
гэж үзэж, нэг submit/transaction дотор хадгалдаг болно.

Одоогийн subform MVP нь saved parent row дээр child view-г embed хийж удирддаг:

```text
parent хадгална -> parent id гарна -> child list filter хийнэ -> child-г тусад нь хадгална
```

Composite form-ийн зорилго:

```text
main values + linked child rows -> main trigger -> child trigger(scope тусдаа) -> нэг transaction save
```

Энэ нь Workzone-ийн controller pattern-той адил. Жишээ нь `orderList`, `day_data`,
`items` гэх мэт child collection request payload-д table/source нэрээрээ ирж, main logic
тэр бүх data-г ашиглаад тооцоолол хийж, шаардлагатай талбарт утга оноож хадгалдаг.

## Нэршил

`subforms` гэдэг runtime payload key ашиглахгүй.

Payload дээр өгөгдөл нь datasource table/source нэрээрээ ирнэ. Хэрэв нэг table нэг parent
form дээр хоёр өөр зориулалтаар холбогдвол subform config-ийн `key` нь alias болж ашиглагдана.

Жишээ:

```ts
data = {
  website_pages: {
    type: "home",
    status: "draft",
    sortOrder: 1,
  },
  website_sections: [
    {
      type: "hero",
      title: "Hero",
      description: "Hero copy",
      sortOrder: 1,
    },
    {
      type: "about",
      title: "About",
      description: "About copy",
      sortOrder: 2,
    },
  ],
};
```

## Trigger Scope

Main form trigger болон child/subform trigger хоёр өөр scope-той байна.

### Main Form Trigger

Main form trigger нь тухайн submit дээр ирсэн бүх graph data-г харж, өөрчилж чадна.

```ts
data = {
  main_table: { ...mainValues },
  child_table_a: [{ ...row }],
  child_table_b: [{ ...row }],
};
```

Main trigger хийж болох зүйл:

- main field default/derived value оноох
- child rows дээр parent id, sort order, derived fields оноох
- child rows-оос total/count/status бодож main table дээр бичих
- child rows-ийг validate/filter/sort хийх
- бүх graph дээр cross-field/cross-table validation хийх

### Child Form Trigger

Child form trigger нь зөвхөн тухайн child form/table-ийн scope дээр ажиллана.

```ts
data = {
  website_sections: {
    type: "hero",
    title: "Hero",
    pageId: "...",
  },
};
```

Child trigger нь main form-ийн бүх graph data-г автоматаар удирдахгүй. Хэрэгтэй бол дараагийн
шатанд readonly parent context өгч болно, гэхдээ mutation scope нь child row/table хэвээр байна.

### Field Trigger

Field trigger нь одоогийн загвараа хадгална: тухайн form-ийн editable current values дээр
ажиллаж patch буцаана. Composite submit lifecycle trigger-ээс тусдаа.

## Contract Shape

Одоогийн entry input:

```ts
{
  values: Record<string, unknown>;
}
```

Composite entry input:

```ts
{
  data: Record<string, Record<string, unknown> | Array<Record<string, unknown>>>;
}
```

Compatibility:

- `values` input хуучин flow-д хэвээр үлдэнэ.
- Composite endpoint эсвэл composite mode нь `data` input хэрэглэнэ.
- Main table key нь view-ийн form/list datasource table name байна.
- Child table key нь child view-ийн datasource table name байна.
- Collision гарвал child config-ийн `key` alias ашиглана.

## Save Flow

Create үед:

```text
1. Parent view/form metadata уншина.
2. Parent form-ийн configured subform links уншина.
3. Client payload-ийг table/alias key-ээр validate хийнэ.
4. Main beforeCreate trigger graph data дээр ажиллана.
5. DB transaction эхэлнэ.
6. Main row үүсгэнэ.
7. Child rows бүр дээр configured childField = parentField value онооно.
8. Child rows дээр child form trigger scope-оор шаардлагатай lifecycle trigger ажиллуулна.
9. Child rows үүсгэнэ.
10. Main afterCreate trigger ажиллана.
11. Transaction commit хийнэ.
```

Update үед:

```text
1. Main beforeUpdate trigger graph data дээр ажиллана.
2. Main row optimistic locking-аар update хийнэ.
3. Child rows-ийг id/version-аар diff хийнэ.
4. id байхгүй rows -> create.
5. id байгаа rows -> update.
6. delete marker-тэй rows -> delete/soft delete.
7. Main afterUpdate trigger ажиллана.
8. Transaction commit хийнэ.
```

Child diff contract эхний pass:

```ts
{
  id?: string;
  version?: number;
  _delete?: boolean;
  ...values
}
```

## Frontend Runtime

Parent entry dialog хоёр mode-той болно.

### Linked CRUD Mode

Одоогийн MVP:

- parent saved байх шаардлагатай
- child list backend-с parent filter-ээр уншина
- child row тусдаа save/delete хийнэ

### Composite Draft Mode

Шинэ mode:

- parent unsaved байсан ч child rows нэмнэ
- child rows client-side draft state-д байна
- parent save дээр main + child data хамт submit хийнэ
- save амжилттай бол backend response-оор canonical rows шинэчилнэ

Эхний implementation дээр composite draft mode-г runtime entry dialog дотор enabled болгож,
хуучин linked CRUD mode-г fallback болгож үлдээнэ.

## Backend Runtime

Шинэ usecase хэрэгтэй:

```text
saveCompositeBuilderViewEntry(viewId, input, permissions)
```

Энэ usecase:

- parent view permission шалгана
- child view permission шалгана
- parent/child datasource table mismatch, missing field, missing column-ийг шалгана
- transaction boundary барина
- trigger context-д `data` graph өгнө

## Trigger Handler Contract

Lifecycle trigger handler нь одоогоор `void` буцаадаг. Composite mode дээр handler graph data
өөрчилж буцаах чадвартай болно.

Proposed response:

```ts
type BuilderTriggerResult = {
  data?: BuilderCompositeData;
  valuesPatch?: Record<string, unknown>;
  tablePatches?: Record<string, Array<Record<string, unknown>>>;
};
```

MVP дээр:

- `validate` trigger одоогийнх шиг алдаа throw хийж болно.
- app trigger handler data буцаавал next context data болгон merge/replace хийнэ.
- arbitrary JS expression engine хийхгүй.

## Security / Integrity

- Client-ээс raw table/column дур мэдэн авахгүй. Parent form schema болон configured subform links
  дээрээс allowed table/field гаргана.
- Child table key payload-д байсан ч тухайн parent form дээр configured биш бол reject.
- Child `childField`-ийг backend override хийнэ. Client өгсөн утгад итгэхгүй.
- Permission: parent write + child write аль аль нь шаардлагатай.
- Audit: main mutation болон child mutation бүр audit-тэй байна.
- Optimistic locking: version байгаа table дээр main/child update-д version хэрэглэнэ.

## Implementation Order

1. Contract дээр composite input/response schema нэмэх.
2. Builder trigger context-д optional `data` graph нэмэх.
3. Trigger runner handler result буцааж, context data patch хийх capability нэмэх.
4. Generic runtime adapter-т transaction-capable composite create/update helper нэмэх.
5. Backend runtime composite save usecase нэмэх.
6. Runtime route нэмэх эсвэл existing save endpoint дээр composite body branch хийх.
7. Portal runtime entry dialog дээр child draft state нэмэх.
8. Subform UI-г composite draft mode-д parent unsaved үед enable болгох.
9. Main submit дээр table/alias keyed `data` payload build хийх.
10. Tests:
    - parent create + two child rows one transaction
    - backend overrides child link field
    - main trigger patches child rows
    - child trigger scope child row only
    - update child create/update/delete diff
    - permission denied on child write
11. Verification:
    - backend `pnpm gen:contracts`
    - backend `pnpm typecheck && pnpm lint && pnpm test:run`
    - portal `pnpm typecheck && pnpm lint`

## Out Of Scope For First Pass

- Deep nested composite submit.
- Arbitrary frontend JavaScript formulas.
- Multi-parent relation graph.
- Cross-deployment/org multi-tenancy.
- Bulk import UI.

## Decision

Composite form нь builder-ийн дараагийн core capability. Subform data table row хэвээр байна,
гэхдээ runtime submit/trigger үед parent form-ийн нэг graph болж орж ирнэ. Main trigger бүх graph
data-г удирдана. Child trigger зөвхөн өөрийн child table/row scope дээр ажиллана.
