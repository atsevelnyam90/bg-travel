import { builder } from "@duke333/builder-contracts";

export const TRAVEL_BUILDER_IDS = {
  travelForm: "66666666-6666-4666-8666-666666666661",
  travelList: "66666666-6666-4666-8666-666666666662",
  travelView: "66666666-6666-4666-8666-666666666663",
  departureForm: "66666666-6666-4666-8666-666666666671",
  departureList: "66666666-6666-4666-8666-666666666672",
  departureView: "66666666-6666-4666-8666-666666666673",
} as const;

export const travelFormSchema = builder.builderFormSchema.parse({
  fields: [
    { key: "name", label: "Аяллын нэр", type: "text", required: true },
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
    },
  ],
});

export const departureFormSchema = builder.builderFormSchema.parse({
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
  columns: [{ key: "name", label: "Аялал", sortable: true }],
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
