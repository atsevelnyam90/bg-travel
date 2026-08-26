# Builder Field Triggers Plan

Зорилго: builder form дээр field event болох үед backend дээр developer-defined trigger
ажиллуулж, response-оор form state-ийг update хийх.

Энэ document-ийн гол шийдвэр:

```text
Field trigger != Field condition
Field trigger != Formula/computed field
Field trigger = field event -> backend trigger endpoint -> response -> form state update
```

## Ялгаа

### Field Trigger

Field дээр event болох үед backend runtime endpoint дуудагдана.

Жишээ:

- `name` өөрчлөгдөхөд backend slug handler дуудагдаж `slug` буцаана.
- `barcode` blur хийхэд backend product lookup handler ажиллаж product info буцаана.
- `customerId` өөрчлөгдөхөд backend pricing/customer rule ажиллаж discount буцаана.
- `provinceId` өөрчлөгдөхөд backend district options буцаана.

### Field Condition

Form state-ээс UI төлөв бодно. Энэ бол тусдаа feature.

Жишээ:

- `customerType = company` бол `registerNumber` show.
- `hasDiscount = false` бол `discountAmount` disabled.
- `paymentType = cash` бол `bankAccount` hide.

Condition нь frontend дээр ажиллана. Trigger-тэй нэг schema/action system болгон хутгахгүй.

### Formula / Computed

Formula нь trigger-ийн нэг боломжит use case байж болно, гэхдээ эхний ажил биш.

Жишээ:

- `quantity * unitPrice -> total`
- `firstName + lastName -> fullName`
- `slugify(name) -> slug`

Formula/computed-ийг field trigger суурь тогтсоны дараа тусдаа phase-р хийнэ.

## MVP Scope

Эхний хувилбар нь backend endpoint field trigger байна.

MVP-д хийх зүйл:

- Field schema дээр `triggers` нэмнэ.
- Runtime form field event дээр trigger endpoint дуудагдана.
- Request debounce-тэй байна.
- Response-оос `schema: [{ field, value }]` хэрэглэж form values update хийнэ.
- Error/toast message гаргана.
- Endpoint allowlist/security boundary backend дээр байна.

MVP-д хийхгүй зүйл:

- field condition
- formula expression engine
- custom JavaScript expression
- arbitrary frontend function execution
- side-effect-heavy trigger баталгаажуулалт
- cross-form dependency
- circular dependency UI

## Events

MVP events:

```text
onChange
onBlur
```

Default recommendation:

- `onChange`: debounce заавал байна.
- `onBlur`: lookup/validation-д илүү тохиромжтой.

Submit lifecycle trigger тусдаа хэвээр:

```text
beforeCreate / afterCreate
beforeUpdate / afterUpdate
```

Field trigger submit дээр ажиллахгүй. Field event гарсан үед request явна.

## Contract Shape

`backend/packages/contracts/src/builder.ts` дээр:

```ts
export const builderFieldTriggerEventSchema = z.enum(["onChange", "onBlur"]);

export const builderFieldTriggerSchema = z.object({
  event: builderFieldTriggerEventSchema,
  action: z.string().min(1).max(240),
  enabled: z.boolean().default(true),
  debounceMs: z.number().int().min(0).max(5000).default(300),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const builderFieldSchema = z.object({
  // ...
  required: z.boolean().default(false),
  hidden: z.boolean().default(false),
  disabled: z.boolean().default(false),
  triggers: z.array(builderFieldTriggerSchema).max(10).default([]),
});
```

`required`, `hidden`, `disabled` нь static field state. Editor дээр нэг compact
`State` dropdown дотор checkbox-оор удирдана. Dynamic нөхцөлөөр field нуух/disable
хийх нь trigger биш, дараагийн `Field Condition` feature байна.

Runtime request:

```ts
export const runBuilderFieldTriggerSchema = z.object({
  value: z.unknown().optional(),
  values: z.record(z.string(), z.unknown()).default({}),
});
```

Runtime response:

```ts
export const builderFieldTriggerResponseSchema = z.object({
  schema: z.array(z.object({ field: z.string(), value: z.unknown() })).default([]),
  valuesPatch: z.record(z.string(), z.unknown()).default({}),
  fieldErrors: z.record(z.string(), z.string()).default({}),
  toast: z
    .object({
      type: z.enum(["success", "info", "warning", "error"]).default("info"),
      message: z.string().min(1),
    })
    .optional(),
});
```

Response intentionally generic байна. Trigger янз бүрийн юм хийх боломжтой тул эхний
UI feedback нь toast байна. `fieldErrors` дараа form field error дээр буух боломжтой.

Contract өөрчилсний дараа:

```bash
cd backend
pnpm gen:contracts
```

## Runtime Endpoint

Form-level endpoint:

```text
POST /api/v1/builder/runtime/forms/:formId/fields/:fieldKey/triggers/:event
```

View-level endpoint:

```text
POST /api/v1/builder/runtime/views/:viewId/fields/:fieldKey/triggers/:event
```

View endpoint нь product/user шиг runtime screen дээр хэрэгтэй. Backend view-ээс form-оо
олж, тухайн field trigger-ийг ажиллуулна.

## Backend Runtime Flow

```text
1. Request ирнэ.
2. form/view permission шалгана.
3. fieldKey form schema-д байгаа эсэхийг шалгана.
4. field.triggers дотроос event таарах enabled trigger-үүдийг авна.
5. action.path allowlist шалгана.
6. backend endpoint/handler руу payload дамжуулна.
7. response schema validate хийнэ.
8. response-ийг frontend рүү буцаана.
```

Trigger handler payload:

```ts
{
  formId: string;
  viewId?: string;
  fieldKey: string;
  event: "onChange" | "onBlur";
  value: unknown;
  values: Record<string, unknown>;
}
```

Trigger handler response:

```ts
{
  schema?: Array<{ field: string; value: unknown }>;
  valuesPatch?: Record<string, unknown>; // alternate/compat shape
  fieldErrors?: Record<string, string>;
  toast?: { type: "success" | "info" | "warning" | "error"; message: string };
}
```

## Frontend Runtime Flow

`DataForm` / builder runtime form adapter:

```text
1. Field render хийхдээ field.triggers уншина.
2. Event handler attach хийнэ.
3. onChange бол debounce хэрэглэнэ.
4. Previous request cancel/latest-only guard хийнэ.
5. Backend response авна.
6. `schema` item бүрийг form.setValue() хийнэ.
7. toast байвал toast харуулна.
8. fieldErrors байвал эхний шатанд toast-р харуулна.
```

MVP дээр error display:

```text
toast only
```

Учир нь trigger ямар ч field-ийг update/validate хийж болох тул field-level error mapping-ийг
дараагийн phase-д нарийвчилна.

## Security

Field trigger нь user input-оор backend endpoint дуудна. Тиймээс:

- arbitrary URL дуудахгүй.
- path нь `/api/v1/` дотор байх ёстой.
- allowlist эсвэл registered handler registry ашиглана.
- auth/session permission заавал явна.
- timeout тавина.
- response schema validate хийнэ.
- non-2xx response toast error болно.
- side effect-тэй trigger-ийг `onChange` дээр ашиглахгүй гэж document-д сануулна.

## Builder Admin UI

Form editor дээр field мөр бүрт trigger тохиргоо нэмнэ.

MVP UI:

- `Triggers` section эсвэл field row expand panel
- `Event`: `onChange` / `onBlur`
- `Endpoint path`
- `Debounce ms`
- `Enabled`

Field trigger editor нь lifecycle form/list trigger editor-оос тусдаа байна.

## Example: Product Slug

Field config:

```ts
{
  key: "name",
  label: "Нэр",
  type: "text",
  triggers: [
    {
      event: "onChange",
      action: "/api/v1/builder-triggers/product-slug",
      enabled: true,
      debounceMs: 300
    }
  ]
}
```

Handler response:

```ts
{
  schema: [{ field: "slug", value: "iphone-xr" }]
}
```

Frontend response авмагц `slug` field update хийнэ.

## Work Plan

1. Done: Contract дээр `BuilderFieldTrigger` schema нэмсэн.
2. Done: Runtime request/response schema нэмсэн.
3. Done: `pnpm gen:contracts` ажиллуулсан.
4. Done: `@winu/builder-ui/api` дээр run field trigger endpoint client нэмсэн.
5. Done: `@winu/builder-ui/hooks` дээр mutation/helper нэмсэн.
6. Done: Backend builder runtime route/controller/usecase нэмсэн.
7. Done: Host backend дээр trigger handler registry нэмсэн.
8. Done: `DataForm` дээр `onChange` debounce + request + response apply logic нэмсэн.
9. Done: Product `name.onChange -> slug` жишээ trigger seed/default дээр тохируулсан.
10. Done: Builder form editor дээр field trigger UI нэмсэн.
11. Next: `onBlur` runtime UI firing нэмэх.
12. Tests:
    - contract schema
    - API client path
    - backend route/usecase
    - runtime helper debounce/latest-only where practical
13. `pnpm typecheck && pnpm lint && pnpm test:run` ажиллуулах.

## Acceptance Criteria

- Product form дээр `name = "iPhone XR"` бичихэд field trigger request явна.
- Backend handler `schema: [{ field: "slug", value: "iphone-xr" }]` буцаана.
- Frontend slug field update хийнэ.
- Trigger алдаа гарвал toast message харагдана.
- Triggerгүй field өмнөх шигээ ажиллана.
- `onChange` request debounce-тэй байна.
- Runtime endpoint нь full form `values` payload дамжуулна.
- `/users` view дээр create blocked rule хэвээр, edit/list/delete эвдэхгүй.
- Generated contract sync зөрөхгүй.

## Later Phases

### Field Conditions

Тусдаа feature:

- hide/show
- enable/disable
- require/optional

### Formula / Computed

Field trigger суурь тогтсоны дараа:

- `slugify(name)`
- `quantity * unitPrice`
- `firstName + lastName`

Formula нь frontend-only байж болох ч sensitive total/pricing logic backend дээр дахин validate
хийх ёстой.
