import { builder } from "@duke333/builder-contracts";

export const TRAVEL_BUILDER_IDS = {
  travelForm: "66666666-6666-4666-8666-666666666661",
  travelList: "66666666-6666-4666-8666-666666666662",
  travelView: "66666666-6666-4666-8666-666666666663",
  departureForm: "66666666-6666-4666-8666-666666666671",
  departureList: "66666666-6666-4666-8666-666666666672",
  departureView: "66666666-6666-4666-8666-666666666673",
  detailForm: "66666666-6666-4666-8666-666666666681",
  detailList: "66666666-6666-4666-8666-666666666682",
  detailView: "66666666-6666-4666-8666-666666666683",
} as const;

export const travelFormSchema = builder.builderFormSchema.parse({
  presentation: "drawer",
  fields: [
    { key: "name", label: "Аяллын нэр", type: "text", required: true },
    { key: "slug", label: "Тогтмол холбоос", type: "text", required: true },
    {
      key: "category",
      label: "Ангилал",
      type: "select",
      required: true,
      options: [
        { label: "Дотоод аялал", value: "DOMESTIC" },
        { label: "Гадаад аялал", value: "INTERNATIONAL" },
        { label: "Хуримын аялал", value: "WEDDING" },
      ],
    },
    {
      key: "status",
      label: "Нийтлэх төлөв",
      type: "select",
      required: true,
      defaultValue: "PUBLISHED",
      options: [
        { label: "Ноорог", value: "DRAFT" },
        { label: "Нийтэлсэн", value: "PUBLISHED" },
        { label: "Архив", value: "ARCHIVED" },
      ],
    },
    { key: "coverImage", label: "Cover зураг", type: "text" },
    { key: "durationDays", label: "Хоног", type: "number", required: true },
    { key: "description", label: "Тайлбар", type: "textarea" },
  ],
  layout: {
    groups: [
      {
        id: "general",
        title: "Үндсэн мэдээлэл",
        columns: 12,
        fields: [
          { key: "name", span: 12 },
          { key: "slug", span: 6 },
          { key: "durationDays", span: 6 },
          { key: "category", span: 6 },
          { key: "status", span: 6 },
          { key: "coverImage", span: 12 },
          { key: "description", span: 12 },
        ],
      },
    ],
  },
  subforms: [
    {
      key: "departures",
      label: "Аяллын гаралтууд",
      viewId: TRAVEL_BUILDER_IDS.departureView,
      parentField: "id",
      childField: "travelId",
      buttonLabel: "Гаралт нэмэх",
      icon: "plus",
      presentation: "dialog",
    },
    {
      key: "details",
      label: "Өдрийн хөтөлбөр",
      viewId: TRAVEL_BUILDER_IDS.detailView,
      parentField: "id",
      childField: "travelId",
      buttonLabel: "Өдөр нэмэх",
      icon: "plus",
      presentation: "dialog",
    },
  ],
});

export const departureFormSchema = builder.builderFormSchema.parse({
  presentation: "drawer",
  fields: [
    { key: "travelId", label: "Аялал", type: "text", required: true, hidden: true },
    { key: "departureDate", label: "Гарах огноо", type: "date", required: true },
    { key: "returnDate", label: "Буцах огноо", type: "date", required: true },
    {
      key: "transportType",
      label: "Тээврийн төрөл",
      type: "select",
      required: true,
      options: [
        { label: "Газар", value: "GROUND" },
        { label: "Шууд нислэг", value: "DIRECT_FLIGHT" },
      ],
    },
    { key: "unitPriceMinor", label: "Нэг хүний үнэ", type: "money", required: true },
    { key: "capacity", label: "Нийт суудал", type: "number", required: true },
    { key: "isBookingOpen", label: "Захиалга авах", type: "checkbox" },
  ],
  layout: {
    groups: [
      {
        id: "departure",
        title: "Гаралтын мэдээлэл",
        columns: 12,
        fields: [
          { key: "departureDate", span: 6 },
          { key: "returnDate", span: 6 },
          { key: "transportType", span: 6 },
          { key: "unitPriceMinor", span: 6 },
          { key: "capacity", span: 6 },
          { key: "isBookingOpen", span: 6 },
        ],
      },
    ],
  },
});

export const travelListSchema = builder.builderListSchema.parse({
  columns: [
    { key: "name", label: "Аялал", sortable: true },
    { key: "category", label: "Ангилал", sortable: true },
    { key: "status", label: "Төлөв", sortable: true },
    { key: "durationDays", label: "Хоног", sortable: true, align: "right" },
  ],
});

export const departureListSchema = builder.builderListSchema.parse({
  columns: [
    { key: "departureDate", label: "Гарах огноо", sortable: true },
    { key: "returnDate", label: "Буцах огноо", sortable: true },
    { key: "transportType", label: "Тээвэр", sortable: true },
    { key: "unitPriceMinor", label: "Нэг хүний үнэ", sortable: true, align: "right" },
    { key: "capacity", label: "Нийт суудал", sortable: true, align: "right" },
    { key: "isBookingOpen", label: "Захиалга авах", sortable: true },
  ],
});

export const detailFormSchema = builder.builderFormSchema.parse({
  presentation: "drawer",
  fields: [
    { key: "travelId", label: "Аялал", type: "text", required: true, hidden: true },
    { key: "dayNumber", label: "Өдөр", type: "number", required: true },
    { key: "title", label: "Гарчиг", type: "text", required: true },
    {
      key: "content",
      label: "Тайлбар",
      type: "richtext",
      placeholder: "Өдрийн хөтөлбөрөө bullet list, тод текст ашиглан бичнэ үү",
    },
    {
      key: "images",
      label: "Зургууд",
      type: "file",
      storage: "server",
      contentKind: "image",
      multiple: true,
    },
  ],
  layout: {
    groups: [
      {
        id: "detail",
        title: "Өдрийн хөтөлбөр",
        columns: 12,
        fields: [
          { key: "dayNumber", span: 3 },
          { key: "title", span: 9 },
          { key: "content", span: 12 },
          { key: "images", span: 12 },
        ],
      },
    ],
  },
});

export const detailListSchema = builder.builderListSchema.parse({
  columns: [
    { key: "dayNumber", label: "Өдөр", sortable: true, align: "right" },
    { key: "title", label: "Гарчиг", sortable: true },
    { key: "images", label: "Зураг", sortable: false },
  ],
  orderBy: [{ field: "dayNumber", direction: "asc" }],
});
