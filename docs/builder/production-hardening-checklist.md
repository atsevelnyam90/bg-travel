# Builder Production Hardening Checklist

Энэ checklist нь permission/auth асуудлыг тусад нь орхиод, Builder-ийг
“унахгүй ажиллах” production-ready түвшинд ойртуулах ажлын дараалал юм.

Одоогийн үнэлгээ:

- Internal controlled use: боломжийн
- Client-facing production builder: арай эрт
- Гол эрсдэл: subform/composite flow, data refresh, field conversion, error UX

## Progress

Done:

- Generic runtime checkbox conversion hardened: `"false"` string одоо `true` болохгүй.
- Generic runtime money conversion hardened: `money` нь integer minor unit шаардана.
- Generic runtime date conversion hardened: invalid date reject хийнэ.
- Generic runtime static select conversion hardened: static options-оос гадуурх value reject хийнэ.
- Runtime view entry mutation hooks нь view detail болон entries cache-г ил invalidate хийдэг болсон.
- Backend builder package regression tests нэмэгдсэн.
- Composite update stale parent version үед child mutation хийхгүй гэдгийг integration test-ээр баталгаажуулсан.
- Composite update stale child version үед parent update rollback хийгддэгийг integration test-ээр баталгаажуулсан.
- Generic runtime stale update нь `409 CONFLICT` буцаадаг болсон.

Remaining high-priority:

- Field-level backend errors-ийг UI form errors руу mapping хийх
- Subform draft/delete UX чангаруулах
- Subform/composite orchestration-ийг package руу бүрэн гаргах

## P0 — Унахгүй Болгох

### 1. Subform/composite flow hardening

Шалгах/засах урсгал:

- Parent + new child rows хамт create хийх
- Parent edit + existing child edit хийх
- Parent edit + new child add хийх
- Parent edit + existing child delete хийх
- Draft child row save хийхээс өмнө delete хийх
- Existing child дээр `version` missing үед ойлгомжтой алдаа өгөх
- Existing child дээр old `version` ирвэл optimistic locking алдаа өгөх
- Parent save fail бол child row үүсэхгүй байх
- Child save fail бол parent update rollback болох

Test нэмэх:

- Composite create success
- Composite update success
- Composite child delete success
- Composite transaction rollback
- Composite stale parent version
- Composite stale child version

### 2. Mutation дараах refresh засах

Одоогийн эрсдэл: save/delete дараа grid эсвэл subform list хуучин cache харуулах магадлалтай.

Засах зүйл:

- `create/update/delete entry` дараа `entries(viewId, query)` cache invalidate хийх
- Зөвхөн `runtimeView(viewId)` invalidate хийх нь хангалтгүй
- Composite save дараа main grid шууд шинэчлэгдэх
- Subform save/delete дараа dialog дотор child list refresh баталгаатай болох
- Form-only save дараа холбоотой list cache refresh болох

Test нэмэх:

- Hook invalidation unit test
- DynamicView save дараах entries refetch smoke test
- RuntimeSubformField save/delete дараах child rows refresh test

### 3. Field type conversion тодорхой болгох

Одоогийн generic runtime нь type conversion-ийг өргөн байдлаар хийж байна. Production дээр
энэ хэсэг хамгийн түрүүнд data quality эвдэнэ.

Засах зүйл:

- `money` зөвхөн integer minor unit авах
- `number` blank үед `null` болох уу, `0` болох уу гэдгийг нэг мөр болгох
- `date` field ISO/date-only string эсвэл DB date type-тэй яаж нийцэхийг тодорхойлох
- `checkbox` дээр `"false"` string ирвэл `true` болохоос хамгаалах
- `select` field option-д байхгүй value-г reject хийх эсэхээ шийдэх
- Unknown enum/status value-г санамсаргүй string болгож бичихээс хамгаалах

Test нэмэх:

- Money integer only
- Blank optional number
- Blank required number
- Checkbox boolean/string cases
- Date value cases
- Select invalid value

### 4. Required/hidden/disabled field behavior

Засах шийдвэрүүд:

- Hidden required field save дээр яах вэ?
- Disabled field client-ээс ирвэл бичих үү, ignore хийх үү?
- System fields form-д орсон ч write хийхгүй байх
- `id`, `version`, `createdAt`, `updatedAt`, `deletedAt` write skip гэдгийг test-ээр барих
- Hidden field list/detail response дээр гарах эсэхийг тодорхойлох

Test нэмэх:

- Disabled field ignored/rejected behavior
- Hidden required behavior
- System field write protection

## P1 — Data Correctness

### 5. View/form/list datasource mismatch test

Засах/шалгах зүйл:

- Form table болон List table зөрвөл ойлгомжтой config error
- Form-only runtime behavior
- List-only runtime behavior
- View-without-form/list behavior
- API endpoint datasource metadata хадгалагдсан үед dbTable runtime руу ороод унахгүй байх

Test нэмэх:

- Mismatched form/list datasource
- Missing form on create
- Missing list on list/delete
- Non-db datasource runtime call

### 6. Table/column compatibility validation

Одоогийн runtime column шалгадаг ч admin save үед эрт барих validation сул байна.

Засах зүйл:

- Form хадгалах үед field key datasource column мөн эсэхийг validate хийх option
- List хадгалах үед column key datasource column мөн эсэхийг validate хийх option
- Subform `parentField` болон `childField` column мөн эсэх
- Select optionsSource table/field/searchFields үнэхээр байгаа эсэх
- Column data type болон Builder field type нийцэх эсэх

Энэ validation нь эхэндээ warning mode байж болно. Production дээр strict mode хэрэгтэй.

### 7. Optimistic locking баталгаажуулах

Засах/шалгах зүйл:

- Single update old version → clear conflict error
- Composite parent old version → child mutation явахгүй
- Composite child old version → whole transaction rollback
- Delete дээр version шаардах эсэхээ шийдэх
- Version байхгүй table дээр runtime update хийхийг зөвшөөрөх эсэхээ шийдэх

Test нэмэх:

- Single update stale version
- Composite parent stale version
- Composite child stale version rollback
- Delete stale/missing version behavior

### 8. Audit чангаруулах

Засах зүйл:

- Generic runtime audit дээр changed fields нэмэх
- Create/update/delete бүр `tableName`, `viewId`, `entryId`-тэй байх
- Full object audit meta-д орохгүй байх
- Secret-like field нэрүүд audit meta-д орохгүй байх
- Composite mutation дээр parent/child audit action дараалал тодорхой байх

Test нэмэх:

- Generic create audit
- Generic update changed fields audit
- Composite child delete audit
- Sensitive field redaction

## P2 — UX Чангаруулах

### 9. Error message map

Production хэрэглэгчид raw DB/config алдааг ойлгохгүй.

Засах mapping:

- Unique constraint → “давхардсан байна”
- Not-null constraint → “заавал бөглөнө”
- Foreign key constraint → “холбоотой өгөгдөл олдсонгүй”
- Stale version → “өөр хүн зассан байна, refresh хийнэ үү”
- Missing datasource → “datasource тохируулаагүй байна”
- Missing table/column → “builder schema datasource-той зөрсөн байна”

### 10. Loading/empty/error state

Засах зүйл:

- DynamicForm loading үед `null` биш loader/skeleton харуулах
- DynamicView entries fail үед grid дотор error state харуулах
- RuntimeSubformField view load fail үед button disabled + тайлбар харуулах
- Save pending үед close/duplicate submit-ээс хамгаалах
- Empty state нь config error болон truly empty data хоёрыг ялгах

### 11. Form validation feedback

Засах зүйл:

- Backend field error-ийг React Hook Form field error болгож харуулах
- Field trigger-ийн `fieldErrors` UI дээр шууд харагдах
- Save дарахад эхний алдаатай field рүү focus хийх
- Required/invalid field алдааг toast-only биш field-level болгох

### 12. Subform UX

Засах зүйл:

- Draft rows unsaved гэдгийг ялгаж харуулах
- Deleted existing rows save хүртэл pending delete байдлаар харагдах
- New draft row delete хийвэл шууд арилгах
- Existing row delete хийвэл `_delete` marker-тэй үлдээх
- Parent unsaved үед child add боломжтой бол draft mode тодорхой байх

## P3 — Package Чанар

### 13. Subform logic package руу оруулах

Одоогийн эрсдэл: subform/composite orchestration host portal wrapper дээр байна.
Reusable package-ийн core capability байхын тулд package руу орох ёстой.

Зөөх зүйл:

- Composite submit orchestration
- Draft subform row state
- RuntimeSubformField factory
- Child row payload builder
- Parent/child table key resolution helper

Host дээр үлдэх зүйл:

- Dialog/Button/DataForm/DataTable adapter
- Toast/error message adapter
- App-specific styling shell

### 14. Migration story бодит болгох

Засах зүйл:

- `builder_schema_migrations` table үүсгэх real baseline script
- `builder_definitions`, `builder_views` metadata migration package-owned эсэхийг шийдэх
- Empty baseline migration-ийг production install path гэж үзэхгүй байх
- Package update хийхэд `builder:migrate` яг юу хийхийг README дээр тодорхой болгох
- DB schema newer/older алдааны operational guide нэмэх

### 15. Package smoke test

Засах/шалгах зүйл:

- `pnpm pack` tarball зөвхөн `dist` агуулж байгаа эсэх
- `exports` entrypoint бүр import болж байгаа эсэх
- External mini app дээр install/import smoke test
- `@winu/contracts`, `@winu/builder-backend`, `@winu/builder-ui` version sync strategy
- `private: true` хэвээр байх эсэхээ шийдэх

## P4 — Test Matrix

### 16. Backend integration tests

Нэмэх test matrix:

- Generic runtime create/update/delete
- Composite create/update rollback
- Field conversion cases
- Datasource mismatch
- Trigger beforeCreate blocks save
- Trigger afterCreate blocking/non-blocking ялгаа
- List search/sort/filter edge cases
- Soft delete list excludes deleted rows
- Update deleted row blocked

### 17. Frontend package tests

Нэмэх test matrix:

- Hook invalidation behavior
- Runtime default values by field type
- Editor input conversion: subforms/layout/triggers/optionsSource
- API client composite endpoints
- RuntimeEntryDialog payload builder
- Subform draft add/edit/delete payload builder

### 18. Portal component smoke tests

Нэмэх smoke:

- DynamicView render + add dialog open
- RuntimeEntryDialog submit payload
- RuntimeSubformField draft add/delete/edit payload
- Builder form editor import table fields
- Builder layout editor add/move/remove fields

## Recommended Order

Хамгийн хурдан чангаруулах дараалал:

1. Subform/composite flow hardening
2. Mutation дараах refresh засах
3. Field type conversion тодорхой болгох
4. Optimistic locking баталгаажуулах
5. Error message map
6. Subform logic package руу оруулах

Энэ 6-г хийсний дараа Builder “ажиллана даа” түвшнээс “нэлээд найдаж болно”
түвшин рүү орно.
