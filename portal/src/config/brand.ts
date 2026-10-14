// Клиент бүрийн brand — өнгийг globals.css-ийн CSS variable-аар солино,
// component-ыг fork хийхгүй.
export const brand = {
  name: "BG Travel",
  shortName: "BG",
  supportEmail: "support@example.mn",
  locale: "mn" as const,
} as const;
