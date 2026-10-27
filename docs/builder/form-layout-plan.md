# Builder Form Layout Plan

## Зорилго

Dynamic Form нь table column order-оор шууд доошоо цуврахгүй, ERP form-д хэрэгтэй
group/grid layout-аар харагддаг болно.

Энэ нь pixel canvas биш. Layout нь responsive grid metadata байна.

## Mental Model

```text
Form
  fields    = data/input definition
  layout    = харагдах бүтэц

Layout
  groups
    title
    columns
    fields
      key
      span
```

Жишээ:

```ts
layout: {
  groups: [
    {
      id: "main",
      title: "Үндсэн мэдээлэл",
      columns: 12,
      fields: [
        { key: "name", span: 6 },
        { key: "slug", span: 6 },
        { key: "description", span: 12 },
      ],
    },
    {
      id: "pricing",
      title: "Үнэ",
      columns: 12,
      fields: [
        { key: "priceMinor", span: 4 },
        { key: "discountMinor", span: 4 },
        { key: "status", span: 4 },
      ],
    },
  ],
}
```

Desktop:

```text
name 6/12         slug 6/12
description 12/12

price 4/12        discount 4/12    status 4/12
```

Mobile:

```text
name
slug
description
price
discount
status
```

## Schema

Contract дээр `BuilderFormSchema` дараах optional layout-тай болно:

```ts
layout?: {
  presentation?: "stacked" | "tabs";
  groups: Array<{
    id: string;
    title?: string;
    columns: 6 | 8 | 12;
    fields: Array<{
      key: string;
      span: number;
    }>;
  }>;
};
```

Validation:

- `groups` optional.
- `presentation` байхгүй бол backward-compatible `stacked` утгатай.
- `tabs` үед group бүр runtime form-ийн нэг tab болно.
- `columns` MVP дээр `6`, `8`, `12`.
- `span` нь `1..columns`.
- `field.key` нь form schema-ийн field key-тэй таарч байх ёстой. Эхний pass дээр runtime/editor helper шалгана.
- Layout-д ороогүй field байвал fallback group-д full width-ээр render хийнэ.

## Editor UI

Form editor дээр `Fields` хэсгийн дээр tab нэмнэ:

```text
Үндсэн | Харагдац
```

### Үндсэн

Одоогийн editor хэвээр:

- Field key/label/type
- Required/hidden/disabled
- Placeholder
- Select options
- Field triggers
- Form triggers

### Харагдац

MVP controls:

- `+ Group нэмэх`
- Group title input
- Group columns dropdown: `6 / 8 / 12`
- Field assign dropdown
- Field span dropdown: `1..columns`
- Up/down buttons for field order
- Delete field from group
- Delete group

Drag/drop MVP-д хийхгүй. Дараа нэмэхэд schema солихгүй.

## Runtime Rendering

`DataForm`:

- `schema.layout.groups` байвал grouped grid render хийнэ.
- `layout.presentation = "stacked"` бол group-үүд дараалан харагдана.
- `layout.presentation = "tabs"` бол group title-ууд tab trigger болно. Идэвхгүй tab-ийн
  field-үүд form state болон validation-аа хадгалахын тулд mounted хэвээр байна.
- `layout` байхгүй бол одоогийн vertical render хэвээр.
- Desktop дээр `grid-template-columns: repeat(columns, minmax(0, 1fr))`.
- Field дээр `grid-column: span <span> / span <span>`.
- Mobile дээр бүх field full width.
- Hidden field render хийхгүй.
- Disabled/required/trigger behavior одоогийнхоо дагуу үлдэнэ.

## Default Layout

Table-аас fields import хийх үед:

- Default нэг group үүсгэнэ.
- Title: `Үндсэн`
- Columns: `12`
- Field бүр default span:
  - textarea: `12`
  - money/number/date/select/text: `6`
  - checkbox: `12`
- Хэрэв field count цөөн бол энэ default хангалттай.

Seed дээр Product/User form-д explicit layout тавьж болно.

## Migration / Compatibility

- `layout` optional тул хуучин form schema эвдрэхгүй.
- Backend DB migration хэрэггүй, builder schema JSON дотор нэмэгдэнэ.
- Contract өөрчлөгдөх тул:

```bash
cd backend
pnpm gen:contracts
```

- Portal generated contract refresh заавал commit-д орно.

## Implementation Order

1. Contract schema-д `layout` нэмэх.
2. `builder-ui` editor state-д layout values/input mapping нэмэх.
3. Form editor дээр tabs нэмэх.
4. `Харагдац` layout editor MVP хийх.
5. `DataForm` grouped grid render хийх.
6. Table import default layout үүсгэх.
7. Seed Product/User layout нэмэх.
8. Tests:
   - layout round-trip
   - default layout from table
   - runtime fallback without layout
9. Verification:
   - backend `pnpm gen:contracts`
   - backend `pnpm typecheck && pnpm lint`
   - portal `pnpm typecheck && pnpm lint`
   - builder-ui `pnpm test:run`

## Out Of Scope For MVP

- Pixel drag/drop canvas.
- Nested groups.
- Conditional layout rules.
- Per-breakpoint custom ordering.
- Visual drag/drop. Up/down + dropdown хангалттай.

## Decision

Энэ feature нь builder-ийн core generic capability. App-specific биш тул
`@winu/builder-ui`, contracts, runtime `DataForm` дээр хийх нь зөв.
