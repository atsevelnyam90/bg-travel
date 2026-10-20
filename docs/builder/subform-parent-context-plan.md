# Builder Subform Parent Context Plan

## Зорилго

Subform-ийн field trigger нь parent form-ийн одоогийн, хадгалагдаагүй утгуудыг
readonly context хэлбэрээр ашиглаж чаддаг болно.

Энэ нь composite submit-ээс өөр capability юм:

```text
Child rows -> parent composite submit     одоо бий
Parent live values -> child field trigger шинээр нэмнэ
```

Жишээ нь parent `Travel.durationDays = 5` байх үед `TravelDeparture.departureDate`
өөрчлөгдөхөд child trigger буцах огноог автоматаар бодно.

## Одоогийн хязгаар

`RuntimeSubformField` нь saved parent record-ийн `parentEntry`-г мэддэг боловч child
dialog form руу зөвхөн холбоосын утгыг дамжуулдаг:

```text
parentField: id -> childField: travelId
```

Field trigger request нь child form-ийн `value`, `values` хоёрыг л авдаг. Иймээс:

- saved parent дээр `travelId`-гаар DB-с parent уншиж болно;
- шинээр parent үүсгэж байх үед id байхгүй тул ингэж болохгүй;
- parent form дээр хэрэглэгчийн дөнгөж зассан утга DB дээрх хуучин утгаас өөр байж болно.

`travelId`-гаар DB query хийх нь туслах fallback байж болох ч generic шийдэл биш.

## Шийдвэр

Field trigger input дээр child form-ийн утгаас тусдаа `parentValues` нэмнэ.

```ts
type RunBuilderFieldTriggerInput = {
  value?: unknown;
  values: Record<string, unknown>;
  parentValues?: Record<string, unknown>;
};

type BuilderFieldTriggerContext = {
  event: "onChange" | "onBlur";
  trigger: BuilderFieldTrigger;
  form: BuilderForm;
  field: BuilderField;
  view?: BuilderView;
  value: unknown;
  values: Record<string, unknown>;
  parentValues?: Record<string, unknown>;
};
```

`values` нь үргэлж trigger ажиллаж буй form-ийн утга байна. `parentValues` нь зөвхөн
subform-н доторх trigger-д optional readonly context байна. Хоёр object-ийг merge
хийхгүй; ингэснээр `name`, `status` зэрэг давхцсан field key буруу уншигдахгүй.

Parent metadata (`id`, `version`, `createdAt`, audit field) дамжуулахгүй. Зөвхөн parent
form-ийн `values` дамжина.

## Runtime Flow

```text
Parent React Hook Form-ийн live values
  -> RuntimeSubformField
  -> RuntimeSubformEntryDialog
  -> child DataForm
  -> run field trigger request { value, values, parentValues }
  -> backend BuilderFieldTriggerContext
  -> host app trigger handler
  -> response field patches
  -> child React Hook Form.setValue()
```

Энэ flow нь дараах хоёр тохиолдолд ижил ажиллана:

1. Шинэ parent + draft child rows: parent id байхгүй байсан ч `parentValues` байна.
2. Засаж буй saved parent: form дээр зассан хамгийн сүүлийн parent value явна.

## Package Work

### Contracts

- `RunBuilderFieldTriggerInput` schema дээр optional `parentValues` нэмэх.
- `BuilderFieldTriggerContext` болон frontend API client type-д ижил талбар нэмэх.
- Contract өөрчилсний дараа generated portal contracts-ийг ердийн `pnpm gen:contracts`
  flow-оор шинэчлэх.

### Builder UI

- Parent `FormProvider`-оос `values`-ийг `useWatch` эсвэл equivalent subscription-оор
  live унших.
- `RuntimeSubformField` -> `RuntimeSubformEntryDialog` -> host `DialogFields` chain-д
  `parentValues` prop дамжуулах.
- Host `DataForm`-ийн trigger runner-д `parentValues` дамжуулах optional prop/context
  нэмэх.
- Parent form дахин render болоход stale snapshot бүү ашигла; trigger request хийх үеийн
  live values ашиглана.
- Parent form-оос гадуур standalone child view нээгдсэн үед `parentValues` байхгүй
  хэвээр ажиллах ёстой.

### Builder Backend

- Runtime form/view trigger request parse хийхдээ `parentValues`-ийг context руу дамжуулах.
- Existing trigger handler-уудыг эвдэхгүй: `parentValues` optional байна.
- Response patch зөвхөн child form-ийн editable fields дээр хэрэгжинэ. Parent form-ийг
  child trigger-ээс patch хийхгүй.

## Security and Integrity

- `parentValues` нь client-side form snapshot тул authorization source биш.
- Trigger response нь UI convenience; create/update save үед domain validation заавал
  үлдэнэ.
- Generic Builder package нь parent data-д domain-specific query эсвэл mutation хийхгүй.
- Parent field-ийг child trigger-ээс өөрчлөх хэрэгцээ гарвал тусдаа, explicit feature
  хэлбэрээр шийднэ; энэ ажилд орохгүй.

## Tests

- Unsaved parent дээр child field trigger `parentValues`-ийг хүлээж авдаг.
- Saved parent дээр зассан боловч save хийгээгүй parent value trigger-д явдаг.
- Parent/child дээр ижил нэртэй field байхад child `values` болон `parentValues` тусдаа
  хэвээр байна.
- Standalone child form trigger `parentValues`-гүй ажилладаг.
- Existing product trigger-үүд өөрчлөлтгүй ажилладаг.
- Trigger response child field patch хийдэг ч parent form value-г өөрчилдөггүй.

## Verification

```bash
cd backend
pnpm gen:contracts
pnpm typecheck
pnpm lint
pnpm test:run

cd ../portal
pnpm typecheck
pnpm lint
pnpm test:run
```

## Out of Scope

- Parent form field trigger-ээс child бүх rows-ийг mass patch хийх.
- Nested subform parent context chain.
- Arbitrary frontend JavaScript expressions.
- Parent values-г DB truth гэж үзэн authorization эсвэл persistence validation хийх.

## Done When

Child subform-ийн `onChange`/`onBlur` field trigger нь parent record хадгалагдаагүй
байсан ч parent form-ийн live field values-ийг `parentValues`-аар найдвартай авч,
өөрийн child form field-үүдийг patch хийдэг болсон байна.
