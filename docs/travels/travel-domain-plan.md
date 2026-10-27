# Travel Domain Plan

## Зорилго

Static аяллын content-ийг Travel domain data болгож, native admin screen-ээр удирдана.
Нэг Travel нь үндсэн мэдээлэл, олон departure, мөн itinerary/detail rows-той байна.

```text
Travel
  ├── TravelDeparture[]  (огноо, үнэ, багтаамж)
  └── TravelDetail[]     (өдөр, title, content, image/video)
```

`TravelDetail` бол нэг л child table. Өдөр, гарчиг, тайлбар, зураг/бичлэгийн төлөө
олон table үүсгэхгүй.

## Хэрэгжсэн төлөв — 2026-10-20

- Travel metadata, `TravelDetail`, safe migration/backfill, native admin contract/API,
  published-only order guard, болон public journey rendering холбогдсон.
- Public site-ийн journey cards/detail нь `PUBLISHED` Travel API-гаас нэр, cover, үнэ,
  хоног, itinerary-г уншина; trip-specific mock content canonical source биш болсон.
- Admin нь Travel, departure, itinerary section, detail-ийг нэг composite form-оор засна.
- New travel images direct-to-S3 presigned upload ашиглана; хуучин local image URL-ууд
  compatibility endpoint-оор хэвээр уншигдана.

`returnDate`-г хэрэглэгч composite form дотроос сонгоно. Backend нь
`returnDate >= departureDate` дүрмийг батална.

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

## Admin Editor

### Travel Form

Native admin form-д дараах field-үүд байна:

- `name` — шаардлагатай.
- `slug` — unique, `name`-ээс trigger-ээр санал болгоно; хэрэглэгч засаж болно.
- `category` — DOMESTIC / INTERNATIONAL / WEDDING select.
- `status` — DRAFT / PUBLISHED / ARCHIVED select.
- `coverImage` — approved file-upload flow ашиглана.
- `durationDays` — required positive number.
- `description` — optional.

List дээр at least `name`, `category`, `status`, `durationDays`, `updatedAt` байна.

### Departure Fields

Дүрэм:

- Date math нь date-only / UTC calendar arithmetic ашиглана; timezone-аас болж нэг хоног
  алдахгүй.
- Хэрэглэгч `returnDate`-г дараа нь гараар өөрчилж болно.
- Save үед `returnDate >= departureDate` validation заавал байна. Exact duration-г
  хатуу шаардах эсэх нь бизнес дүрэм болж дараа нь шийдэгдэнэ; эхний хувилбарт custom
  return date зөвшөөрнө.

### Detail Fields

Travel parent form дээр `details` subform нэмнэ:

```text
parentField: id
childField:  travelId
```

Detail field-үүд нь `dayNumber`, locale бүрийн `title`, rich-text `content`, болон
`images` байна. Section нь locale бүрийн гарчиг/тайлбар, map image, gallery images-тай.

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
- Admin integration tests: permission boundary, Travel/departure/section/detail composite
  create/update, optimistic locking, date validation, soft delete.

## Implementation Order

1. Prisma enum/model, safe migration/backfill, soft-delete registry хийх.
2. Backend/portal contracts шинэчилж `pnpm gen:contracts` ажиллуулах.
3. Native admin list + composite editor нэмэх.
4. Domain validation, audit, optimistic locking, integration tests нэмэх.
5. Public service/contract/portal API-г PUBLISHED data болон detail content-той болгох.
6. Static journey usage-г dynamic Travel data-р солих.

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

- Admin нь Travel-ийн үндсэн field, departures, itinerary section/detail rows-ийг native form-оор
  удирддаг.
- Departure date сонгоход parent-ийн live `durationDays`-аар return date автоматаар
  санал болгодог.
- Public website зөвхөн published Travel data-г slug-аар тогтвортой харуулдаг.
- Static trip-specific data нь энэ canonical Travel domain data-тай зөрдөггүй.
