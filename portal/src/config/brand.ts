// Клиент бүрийн brand — өнгийг globals.css-ийн CSS variable-аар солино,
// component-ыг fork хийхгүй.
export const brand = {
  name: "Starter",
  shortName: "ST",
  supportEmail: "support@example.mn",
  locale: "mn" as const,
} as const;
