# Rich text field

`richtext` нь Builder-ийн generic field type. Аяллын өдрийн хөтөлбөрт `content`
талбарт ашиглана.

- Утга нь TipTap JSON document-ийг string хэлбэрээр хадгална.
- Өмнө хадгалагдсан энгийн textarea string-ийг render хийхдээ paragraph болгон
  backward-compatible байдлаар харуулна.
- HTML хадгалах болон `dangerouslySetInnerHTML` ашиглахгүй. Public талын
  `RichTextContent` нь зөвшөөрсөн node/mark-уудыг React element болгож render хийнэ.
- Эхний toolbar: H2, bold, italic, bullet/numbered list, undo/redo.
- Зураг нь `images[]` file field дээр тусдаа хэвээр. Meal/hotel-ийн текст нь
  шаардлагатай бол `content` дотор бичигдэнэ; нэмэлт field/table үүсгэхгүй.

List/table preview-д rich text JSON-г `richTextToPlainText()`-аар plain text болгон
харуулна.
