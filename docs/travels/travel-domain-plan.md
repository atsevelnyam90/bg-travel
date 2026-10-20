# Travel Domain Plan

## Зорилго

Static аяллын content-ийг Travel domain data болгож, Builder admin-аар удирдана.
Нэг Travel нь үндсэн мэдээлэл, олон departure, мөн itinerary/detail rows-той байна.

```text
Travel
  ├── TravelDeparture[]  (огноо, үнэ, багтаамж)
  └── TravelDetail[]     (өдөр, title, content, image/video)
```

`TravelDetail` бол нэг л child table. Өдөр, гарчиг, тайлбар, зураг/бичлэгийн төлөө
олон table үүсгэхгүй.

## Хэрэгжсэн төлөв — 2026-10-20

- Travel metadata, `TravelDetail`, safe migration/backfill, Builder definition, public contract/API,
  published-only order guard, болон public journey rendering холбогдсон.
- Public site-ийн journey cards/detail нь `PUBLISHED` Travel API-гаас нэр, cover, үнэ,
  хоног, itinerary-г уншина; trip-specific mock content canonical source биш болсон.
- Departure-ийн auto `returnDate` trigger нь Builder package-ийн `parentValues` release/update
  шаардлагатай тул тусад нь үлдсэн. Харин энэ app trigger-ийг ашиглах domain contract нь
  энэ document-д доор тодорхойлогдсон хэвээр байна.

## Dependency

`departureDate`-аас `returnDate` автоматаар бөглөх нь
[Builder Subform Parent Context Plan](../builder/subform-parent-context-plan.md)-ийн
`parentValues` capability-оос хамаарна. Тэр generic ажил бэлэн болмогц энэ document-ийн
trigger хэсгийг хэрэгжүүлнэ.

Үлдсэн Travel schema, detail table, Builder definition, public API ажлууд уг capability-
аас хамаарахгүйгээр тусад нь хийгдэж болно.

## Travel Schema

`Travel` model дээр дараах үндсэн талбарууд нэмнэ:

```prisma
enum TravelCategory {
  DOMESTIC
  INTERNATIONAL
  WEDDING
}

enum TravelStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Travel {
  // existing id, publicId, name, description, version, timestamps, deletedAt

  slug         String         @unique
  category     TravelCategory @default(DOMESTIC)
  status       TravelStatus   @default(DRAFT)
  coverImage   String?
  durationDays Int            @default(1)

  departures   TravelDeparture[]
  details      TravelDetail[]
}
```

`durationDays` гэдэг нэр хэрэглэнэ. Энэ нь эхлэх өдрийг оролцуулсан нийт календарийн
хоног байна. Тухайлбал 5 өдөр аялал 2026-10-20-нд эхэлбэл 2026-10-24-нд дуусна.

```text
returnDate = departureDate + (durationDays - 1) calendar days
```

`coverImage` нь user-supplied file name биш, upload flow-оор server үүсгэсэн asset key
эсвэл public asset URL байна.

### Migration Notes

Existing Travel rows байгаа тул `slug`-ийг required + unique шууд нэмэхгүй. Migration:

1. `slug`-ийг эхлээд nullable байдлаар нэмэх.
2. Existing row бүрт deterministic unique slug backfill хийх.
3. `slug`-ийг required, unique болгох.
4. `category`, `status`, `durationDays` нь safe default-тойгоор existing rows-д орох.

`durationDays` save үед эерэг бүхэл тоо (`>= 1`) байхыг domain validation шалгана.

## Travel Detail Table

```prisma
enum TravelMediaType {
  IMAGE
  VIDEO
}

model TravelDetail {
  id        String          @id @default(uuid())
  travelId  String
  dayNumber Int
  title     String
  content   String?
  mediaUrl  String?
  mediaType TravelMediaType?
  version   Int             @default(0)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  deletedAt DateTime?

  travel Travel @relation(fields: [travelId], references: [id], onDelete: Restrict)

  @@index([travelId, dayNumber])
  @@map("travel_details")
}
```

`mediaUrl`-ийн утга байвал `mediaType` заавал, `mediaType` байвал `mediaUrl` заавал байна.
`dayNumber` нь 1-ээс `durationDays` хүртэлх эерэг бүхэл байна. Backend validation энэ
хоёр дүрмийг батална. Active row-уудын `(travelId, dayNumber)` unique index нь soft-deleted
row-г дахин үүсгэхийг зөвшөөрнө. Soft delete model тул `SOFT_DELETE_MODELS`-д бүртгэнэ.

## Builder Definitions

### Travel Form

Builder form-д дараах field-үүд байна:

- `name` — шаардлагатай.
- `slug` — unique, `name`-ээс trigger-ээр санал болгоно; хэрэглэгч засаж болно.
- `category` — DOMESTIC / INTERNATIONAL / WEDDING select.
- `status` — DRAFT / PUBLISHED / ARCHIVED select.
- `coverImage` — approved file-upload flow ашиглана.
- `durationDays` — required positive number.
- `description` — optional.

List дээр at least `name`, `category`, `status`, `durationDays`, `updatedAt` байна.

### Departure Subform

Одоогийн `travelId` parent link хэвээр байна. `departureDate` дээр app trigger тохируулна:

```ts
{
  event: "onChange",
  action: "/api/v1/builder-triggers/travel-return-date",
  debounceMs: 0,
}
```

Handler нь `context.values.departureDate` болон
`context.parentValues?.durationDays`-ийг ашиглан `returnDate` patch буцаана.

```ts
{
  schema: [{ field: "returnDate", value: "2026-10-24" }]
}
```

Дүрэм:

- Date math нь date-only / UTC calendar arithmetic ашиглана; timezone-аас болж нэг хоног
  алдахгүй.
- `durationDays` алга, хүчингүй бол `returnDate`-г таамаглан бөглөхгүй; field error өгнө.
- Хэрэглэгч `returnDate`-г дараа нь гараар өөрчилж болно.
- `departureDate` дахин өөрчлөгдвөл return date-г дахин санал болгоно.
- Save үед `returnDate >= departureDate` validation заавал байна. Exact duration-г
  хатуу шаардах эсэх нь бизнес дүрэм болж дараа нь шийдэгдэнэ; эхний хувилбарт custom
  return date зөвшөөрнө.

### Detail Subform

Travel parent form дээр `details` subform нэмнэ:

```text
parentField: id
childField:  travelId
```

Detail dialog field-үүд нь `dayNumber`, `title`, `content`, `mediaType`, `mediaUrl` байна.
List нь `dayNumber`, `title`, `mediaType`-ээр эрэмбэлэгдэнэ.

## App Trigger

Travel return-date handler нь host app (`backend/src/modules/appTriggers`) дээр бүртгэгдэнэ.
Builder package нь `Travel`, `durationDays`, эсвэл date business rule мэдэхгүй.

Handler нь async DB lookup хийх шаардлагагүй: parent form-ийн current `durationDays`-г
`parentValues`-аас уншина. Энэ нь unsaved parent + draft departure дээр ч ажиллана.

## Public API and Portal

- Public travel list зөвхөн `status = PUBLISHED` Travel-уудыг уншина.
- `ARCHIVED`, `DRAFT` аялал, мөн хаалттай departure нь public response-д орохгүй.
- Public contract-д хэрэгтэй, safe field-үүд: `slug`, `name`, `description`,
  `category`, `coverImage`, `durationDays`, open departure slots, details.
- Internal database id, audit/version, admin-only status metadata-г public response-д
  гаргахгүй.
- Static journey catalog/content-г public API-гийн Travel + TravelDetail data-р аажмаар
  солих; шинэ static domain data бүү нэм.
- URL нь slug-д суурилсан stable link байна. Existing Capacitor static-export constraint-
  ын улмаас public detail screen query parameter ашиглах эсэхийг portal route architecture-
  тай хамт шийднэ.

## Validation, Audit, and Tests

- Travel, TravelDeparture, TravelDetail mutation бүр audit trail-тэй байна.
- `Travel` болон `TravelDetail` update optimistic locking ашиглана.
- Slug uniqueness болон category/status enum validation байна.
- `durationDays >= 1`, `dayNumber >= 1`, `dayNumber <= durationDays` validation байна.
- Detail media pair validation байна.
- Departure save дээр date range validation байна.
- Public integration tests: DRAFT/ARCHIVED travel нуух, PUBLISHED + open departure
  харуулах, public contract дотоод field задруулахгүй байх.
- Builder integration tests: Travel/departure/detail composite create, parent relation
  backend override, detail day uniqueness, return-date trigger patch.

## Implementation Order

1. Builder parent context capability-г эхлээд хэрэгжүүлэх.
2. Prisma enum/model, safe migration/backfill, soft-delete registry хийх.
3. Backend/portal contracts шинэчилж `pnpm gen:contracts` ажиллуулах.
4. Travel Builder form/list/subform definitions болон metadata seed/update хийх.
5. Travel slug болон return-date app trigger handler нэмэх.
6. Domain validation, audit, optimistic locking, integration tests нэмэх.
7. Public service/contract/portal API-г PUBLISHED data болон detail content-той болгох.
8. Static journey usage-г dynamic Travel data-р солих.

## Verification

```bash
cd backend
pnpm db:migrate
pnpm gen:contracts
pnpm typecheck
pnpm lint
pnpm test:run

cd ../portal
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build:mobile
```

## Done When

- Admin нь Travel-ийн үндсэн field, departures, itinerary detail rows-ийг Builder-ээр
  удирддаг.
- Departure date сонгоход parent-ийн live `durationDays`-аар return date автоматаар
  санал болгодог.
- Public website зөвхөн published Travel data-г slug-аар тогтвортой харуулдаг.
- Static trip-specific data нь энэ canonical Travel domain data-тай зөрдөггүй.
