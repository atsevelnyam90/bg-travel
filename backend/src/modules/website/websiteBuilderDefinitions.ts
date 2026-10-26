import { builder } from "@duke333/builder-contracts";

export const WEBSITE_BUILDER_IDS = {
  pageForm: "44444444-4444-4444-8444-444444444441",
  pageList: "44444444-4444-4444-8444-444444444442",
  pageView: "44444444-4444-4444-8444-444444444443",
  sectionForm: "44444444-4444-4444-8444-444444444451",
  sectionList: "44444444-4444-4444-8444-444444444452",
  sectionView: "44444444-4444-4444-8444-444444444453",
} as const;

export const websitePageFormSchema = builder.builderFormSchema.parse({
  fields: [
    { key: "type", label: "Page type", type: "text", required: true },
    { key: "status", label: "Status", type: "text", required: true, defaultValue: "draft" },
    { key: "sortOrder", label: "Sort order", type: "number" },
  ],
  subforms: [
    {
      key: "sections",
      label: "Sections",
      viewId: WEBSITE_BUILDER_IDS.sectionView,
      parentField: "id",
      childField: "pageId",
      buttonLabel: "Add section",
      icon: "plus",
    },
  ],
});

export const websitePageListSchema = builder.builderListSchema.parse({
  columns: [
    { key: "type", label: "Page type", sortable: true, align: "left" },
    { key: "status", label: "Status", sortable: true, align: "left" },
    { key: "sortOrder", label: "Sort order", sortable: true, align: "right" },
  ],
});

export const websiteSectionFormSchema = builder.builderFormSchema.parse({
  fields: [
    { key: "pageId", label: "Page ID", type: "text", required: true, hidden: true },
    { key: "type", label: "Section type", type: "text", required: true },
    { key: "title", label: "Title", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "sortOrder", label: "Sort order", type: "number" },
    { key: "isActive", label: "Active", type: "checkbox" },
  ],
});

export const websiteSectionListSchema = builder.builderListSchema.parse({
  columns: [
    { key: "type", label: "Section type", sortable: true, align: "left" },
    { key: "title", label: "Title", sortable: true, align: "left" },
    { key: "sortOrder", label: "Sort order", sortable: true, align: "right" },
    { key: "isActive", label: "Active", sortable: true, align: "left" },
  ],
});
