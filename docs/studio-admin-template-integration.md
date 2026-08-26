# Studio Admin Template Integration

Энэ document нь `winu-starter`-ийн portal UI-г
`next-shadcn-admin-dashboard` / `Studio Admin` template-ийн өнгө төрх, layout
pattern-оор polish хийх implementation guide юм.

Template:

- Demo: https://next-shadcn-admin-dashboard.vercel.app
- Repo: https://github.com/arhamkhnz/next-shadcn-admin-dashboard
- License: MIT

## Зорилго

`Studio Admin`-ийг app руу бүтнээр нь хуулж оруулахгүй. Харин түүний visual
language, admin shell, table/form/page patterns-ийг `winu-starter`-ийн одоогийн
architecture дээр шингээнэ.

```text
Studio Admin = visual/design reference
Winu Starter = real app architecture
```

## Хадгалах Зарчмууд

Дараах зүйлс хэвээр үлдэнэ:

- `backend` нь API, auth, permission, DB logic-ийн эзэн
- `backend/packages/contracts` нь API contract-ийн ганц эх сурвалж
- `portal/src/api/generated/**` гараар засахгүй
- `portal/src/features/*` domain structure хэвээр
- `portal/src/app/*` route нимгэн хэвээр
- `portal/src/components/ui/**` shadcn primitive хэвээр
- `Can`, `can`, backend `requirePermission()` хэвээр
- TanStack Query + existing `apiClient` хэвээр
- Winu Builder dynamic views нь энэ design system-ээр render хийнэ

## Юу Авах Вэ

Template-ээс дараах visual/pattern хэсгүүдийг авна:

- app shell density
- sidebar/header polish
- command/search trigger look
- user menu treatment
- page header spacing
- dashboard card composition
- data table toolbar, filters, pagination feel
- badge/status color language
- form dialog/drawer spacing
- empty/loading/error states
- light/dark theme polish
- responsive sidebar behavior

## Юу Авахгүй Вэ

Template-ээс дараахыг авахгүй:

- auth implementation
- routing architecture
- backend/data fetching pattern
- Zustand state architecture
- demo business data/files
- бүх folder structure
- бүх components-ийг bulk copy хийх
- `components/ui` primitive-үүдийг replace хийх
- template-ийн RBAC/multi-tenant санааг app руу оруулах

## Target UX

ERP system-ийн UI нь marketing dashboard шиг хөнгөн биш, өдөр бүр дата дээр
ажиллах tool байх ёстой.

Тиймээс target feel:

```text
modern
dense
clear
fast
trustworthy
data-heavy
low-noise
polished
```

Avoid:

```text
oversized cards everywhere
landing-page style heroes
single-color purple/blue gradient look
too much decorative chrome
low-density SaaS marketing dashboard
```

## Integration Boundary

Template-ийг дараах layer-үүд дээр шингээнэ.

```text
portal/src/app
  route only, no template logic

portal/src/components/layout
  AppShell, Sidebar, Header, UserMenu, PageHeader

portal/src/components/data
  DataGrid, DataToolbar, DataTable, DataPagination, EmptyState

portal/src/components/form
  TextField, SelectField, CurrencyField, FileField, form layout wrappers

portal/src/features/*
  domain pages use the shared layout/data/form components

portal/src/features/winu-runtime
  DynamicForm/DynamicTable use the same shared components
```

Do not put copied template components directly into random feature folders unless
they are domain-specific.

## Proposed File Work

### Layout

Review/update:

```text
portal/src/components/layout/AppShell.tsx
portal/src/components/layout/AppSidebar.tsx
portal/src/components/layout/BottomNav.tsx
portal/src/components/layout/PageHeader.tsx
portal/src/components/layout/UserMenu.tsx
portal/src/config/nav.ts
portal/src/config/brand.ts
```

Expected outcome:

- sidebar feels closer to Studio Admin
- navigation groups are easier to scan
- active item, collapsed state, mobile behavior are polished
- top area has search/quick action/user menu treatment
- page content gets consistent max width and spacing

### Data Components

Review/update:

```text
portal/src/components/data/DataGrid.tsx
portal/src/components/data/DataList.tsx
portal/src/components/data/DataTable.tsx
portal/src/components/data/DataToolbar.tsx
portal/src/components/data/DataPagination.tsx
portal/src/components/data/useDataTable.ts
```

Expected outcome:

- tables look modern and dense
- toolbar search/filter/action layout matches the shell
- badges/status cells have consistent language
- pagination and column controls feel first-class
- mobile list keeps the same visual language

### Forms

Review/update:

```text
portal/src/components/form/TextField.tsx
portal/src/components/form/SelectField.tsx
portal/src/components/form/TextareaField.tsx
portal/src/components/form/CurrencyField.tsx
portal/src/components/form/FileField.tsx
portal/src/components/form/CheckboxField.tsx
portal/src/components/form/useFieldError.ts
```

Expected outcome:

- create/edit dialogs feel polished
- label/error/helper spacing is consistent
- fields are compact enough for ERP use
- file/image fields match the same visual standard

### Views To Validate

After visual integration, verify these views manually:

```text
/dashboard
/users
/products
/settings
/market
/market/product?slug=...
/winu/builder/*     when implemented
/winu/view?id=...   when implemented
```

## Theme Strategy

Use Studio Admin as reference, but keep Winu tokens as the app source of truth.

Rules:

- prefer Tailwind/shadcn tokens over raw hex
- avoid one-note palette
- avoid app-wide purple/blue gradient dominance
- do not directly paste a full theme without reviewing contrast
- test light and dark mode
- cards stay restrained, radius 8px or less unless local UI requires otherwise

Possible token areas:

```text
background
foreground
card
popover
primary
secondary
muted
accent
destructive
border
input
ring
sidebar
chart colors
```

## Winu Builder Compatibility

Winu Builder runtime must reuse the same UI components.

```text
Builder schema = юу харуулах вэ
Winu design system = яаж харагдах вэ
```

Dynamic runtime should render using:

```text
DynamicView  -> PageHeader + DataGrid + FormDialog/Drawer
DynamicList  -> DataGrid/DataTable/DataToolbar/DataPagination
DynamicForm  -> components/form fields
DynamicField -> TextField/SelectField/CurrencyField/FileField/etc
```

Do not create a separate builder-only UI kit.

## Implementation Plan

### Phase 1: Template Audit

1. Clone/open the template in a temporary location outside `winu-starter`.
2. Review sidebar/header/page/table/form/dashboard examples.
3. Pick exact patterns to adopt.
4. Do not copy template architecture wholesale.

Output:

```text
short list of selected patterns
screenshots or notes
components to adapt
components to ignore
```

### Phase 2: Theme + Layout

1. Adjust Winu theme tokens carefully.
2. Polish `AppShell`.
3. Polish `AppSidebar`.
4. Polish `UserMenu`.
5. Polish `PageHeader`.
6. Verify desktop and mobile.

### Phase 3: Data Surface

1. Polish `DataToolbar`.
2. Polish `DataTable`.
3. Polish `DataPagination`.
4. Polish `DataList` mobile rendering.
5. Check `users` and `products`.

### Phase 4: Form Surface

1. Polish form field wrappers.
2. Polish `ProductFormDialog`.
3. Polish `InviteUserDialog`.
4. Polish settings forms.
5. Ensure error states are clear.

### Phase 5: Dashboard + States

1. Update dashboard card composition.
2. Add consistent empty states.
3. Add consistent loading/skeleton states.
4. Add consistent error states.

### Phase 6: QA

Run:

```bash
cd portal
pnpm typecheck
pnpm lint
pnpm build
pnpm build:mobile
```

Check manually:

```text
desktop 1440px
tablet around 768px
mobile around 390px
light mode
dark mode
long Mongolian labels
long table values
dialogs on mobile
```

## Copy Rules

Allowed:

- copy small visual component patterns and adapt them
- copy class composition ideas and rewrite to local components
- copy theme inspiration after contrast review
- copy layout interaction ideas

Not allowed:

- paste entire template folders into `portal/src`
- replace Winu API/auth/query/permission architecture
- add duplicate UI primitives when existing shadcn primitives work
- introduce conflicting global CSS
- bring demo data/routes as production code
- add dependencies without checking if Winu already has an equivalent

## License Note

The template repo is MIT licensed. If code is copied substantially, keep the
license notice as required by MIT. Prefer adapting patterns rather than copying
large source files verbatim.

## Acceptance Criteria

Visual integration is complete when:

- app still follows Winu folder/contract/permission architecture
- sidebar/header/page layout feels modern and consistent
- `users`, `products`, `settings`, `dashboard` share one visual language
- table/form components can be reused by Winu Builder runtime
- generated CRUD views use the shared `DataGrid` structure:
  card header, search toolbar, filter bar, selected-count row, desktop table,
  mobile list, pagination, and `...` row action menu
- status/user/product cells prefer rich composition over raw DB columns
- mobile layouts do not overlap or overflow
- long Mongolian labels fit cleanly
- light/dark mode both look intentional
- no copied template auth/routing/state architecture remains
- portal typecheck/lint/build/build:mobile pass

## Final Principle

```text
Template-ийг app болгохгүй.
Template-ийг Winu app-ийн design language болгоно.
```
