# @winu/builder-ui

Frontend талын builder package. Энэ package нь dynamic form/list/view runtime logic,
builder admin factory components, API client factory, React Query hook factory-уудыг
эзэмшинэ.

## Starter Дотор

`winu-starter/portal` package-г workspace dependency-ээр ашиглаж байгаа:

```json
{
  "dependencies": {
    "@winu/builder-ui": "workspace:*"
  }
}
```

Ажиллуулах:

```bash
cd portal
pnpm install
pnpm dev
```

`pnpm dev`, `pnpm build`, `pnpm build:mobile`, `pnpm typecheck` нь
`packages/*` build-ийг автоматаар түрүүлж ажиллуулна.

## Хэрэглэх

Starter дээр package factory-уудыг host wrapper component болгон угсарсан:

```text
portal/src/features/builder/api.ts
portal/src/features/builder/hooks/useBuilder.ts
portal/src/features/builder/components/DynamicForm.tsx
portal/src/features/builder/components/DynamicList.tsx
portal/src/features/builder/components/DynamicView.tsx
```

App page дээр wrapper-уудыг ашиглана:

```tsx
import { DynamicView } from "@/features/builder/components/DynamicView";

export default function ProductsPage() {
  return <DynamicView viewId="..." />;
}
```

Дангаар нь дуудах contract:

```tsx
<DynamicForm formId="..." />
<DynamicList listId="..." />
<DynamicView viewId="..." />
```

`DynamicView` нь form + list нийлсэн CRUD screen. Харин зөвхөн form эсвэл зөвхөн
grid/list хэрэгтэй бол `DynamicForm`, `DynamicList`-ийг шууд ашиглана.

## Host UI Adapter

Package нь shadcn/ui-г шууд эзэмшихгүй. Host app өөрийн Button, Dialog, DataGrid,
form renderer зэрэг design-system component-уудаа adapter-аар өгнө. Ингэснээр portal
энгийн shadcn app хэвээр, builder нь нэмэлт reusable layer хэвээр үлдэнэ.

## Publish / Update

Private registry нээгдсэний дараа external portal project дээр:

```bash
pnpm add @winu/builder-ui
```

Update:

```bash
pnpm update @winu/builder-ui
```

Package нь `dist` output publish хийнэ. `prepack` нь publish/pack хийхээс өмнө
`pnpm build` ажиллуулна.
