import { describe, expect, it } from "vitest";
import {
  BUILDER_EDITOR_NONE_VALUE,
  builderEditorTextToOptions,
  builderFormEditorDefaultLayoutGroups,
  builderFormEditorFieldsFromTable,
  builderFormEditorInputFromValues,
  builderFormEditorValuesFromEntity,
  builderListEditorColumnsFromTable,
  builderListEditorInputFromValues,
  builderViewEditorInputFromValues,
  builderViewEditorValuesFromEntity,
} from "./editorState";

describe("builder editor state", () => {
  it("parses static select options", () => {
    expect(builderEditorTextToOptions("Active:active\nDraft")).toEqual([
      { label: "Active", value: "active" },
      { label: "Draft", value: "Draft" },
    ]);
  });

  it("imports form fields and list columns from db table metadata", () => {
    const table = {
      name: "items",
      columns: [
        {
          name: "name",
          label: "Name",
          fieldType: "text",
          nullable: false,
          dataType: "text",
          sortable: true,
        },
        {
          name: "priceMinor",
          label: "Price",
          fieldType: "money",
          nullable: true,
          dataType: "integer",
          sortable: true,
        },
      ],
    };

    expect(builderFormEditorFieldsFromTable(table)).toMatchObject([
      { key: "name", label: "Name", type: "text", required: true, placeholder: "Name" },
      {
        key: "priceMinor",
        label: "Price",
        type: "money",
        required: false,
        placeholder: "Price",
      },
    ]);
    expect(builderListEditorColumnsFromTable(table)).toEqual([
      { key: "name", label: "Name", sortable: true, align: "left" },
      { key: "priceMinor", label: "Price", sortable: true, align: "right" },
    ]);
    expect(builderFormEditorDefaultLayoutGroups(builderFormEditorFieldsFromTable(table))).toEqual([
      {
        id: "main",
        title: "Үндсэн",
        columns: 12,
        fields: [
          { key: "name", span: 6 },
          { key: "priceMinor", span: 6 },
        ],
      },
    ]);
  });

  it("uses the field label as the default placeholder", () => {
    expect(
      builderFormEditorInputFromValues({
        title: "Item",
        description: "",
        sourceType: "none",
        sourceTable: BUILDER_EDITOR_NONE_VALUE,
        apiBasePath: "",
        fields: [
          {
            key: "name",
            label: "Name",
            type: "text",
            required: true,
            hidden: false,
            disabled: false,
            placeholder: "",
            optionsMode: "static",
            optionsTable: BUILDER_EDITOR_NONE_VALUE,
            optionsValueField: BUILDER_EDITOR_NONE_VALUE,
            optionsLabelField: BUILDER_EDITOR_NONE_VALUE,
            triggers: [],
          },
        ],
        layoutGroups: [],
        triggers: [],
        version: 0,
      }).schema.fields[0].placeholder,
    ).toBe("Name");
  });

  it("round-trips form entity state into an update input", () => {
    const values = builderFormEditorValuesFromEntity(
      {
        title: "Item",
        description: null,
        version: 3,
        source: { type: "dbTable", tableName: "items" },
        schema: {
          fields: [
            {
              key: "categoryId",
              label: "Category",
              type: "select",
              required: true,
              optionsSource: {
                type: "dbTable",
                tableName: "categories",
                valueField: "id",
                labelField: "name",
                searchFields: ["name"],
                filterBy: { field: "parentId", valueFromField: "parentId" },
              },
            },
          ],
          layout: {
            groups: [
              {
                id: "main",
                title: "Main",
                columns: 12,
                fields: [{ key: "categoryId", span: 6 }],
              },
            ],
          },
        },
        triggers: [
          {
            event: "beforeCreate",
            action: "callApi",
            enabled: true,
            blocking: true,
            config: { path: "/api/v1/items/validate" },
          },
        ],
      },
      {
        title: "",
        description: "",
        sourceType: "none",
        sourceTable: BUILDER_EDITOR_NONE_VALUE,
        apiBasePath: "",
        fields: [],
        layoutGroups: [],
        triggers: [],
        version: 0,
      },
    );

    expect(values.triggers).toEqual([
      {
        event: "beforeCreate",
        route: "/api/v1/items/validate",
        enabled: true,
        blocking: true,
      },
    ]);
    expect(builderFormEditorInputFromValues(values)).toMatchObject({
      source: { type: "dbTable", tableName: "items" },
      schema: {
        fields: [
          {
            key: "categoryId",
            optionsSource: {
              type: "dbTable",
              tableName: "categories",
              valueField: "id",
              labelField: "name",
              searchFields: ["name"],
              filterBy: { field: "parentId", valueFromField: "parentId" },
            },
          },
        ],
        layout: {
          groups: [
            {
              id: "main",
              title: "Main",
              columns: 12,
              fields: [{ key: "categoryId", span: 6 }],
            },
          ],
        },
      },
      triggers: [
        {
          event: "beforeCreate",
          action: "callApi",
          enabled: true,
          blocking: true,
          config: { route: "/api/v1/items/validate" },
        },
      ],
      version: 3,
    });
  });

  it("builds list update inputs", () => {
    expect(
      builderListEditorInputFromValues({
        title: "Items",
        description: "",
        sourceType: "apiEndpoint",
        sourceTable: BUILDER_EDITOR_NONE_VALUE,
        apiBasePath: "/api/v1/items",
        columns: [{ key: "name", label: "Name", sortable: true, align: "left" }],
        triggers: [
          { event: "beforeRead", route: "/api/v1/items/filter", enabled: true, blocking: true },
        ],
        version: 2,
      }),
    ).toEqual({
      title: "Items",
      description: null,
      source: { type: "apiEndpoint", basePath: "/api/v1/items" },
      schema: { columns: [{ key: "name", label: "Name", sortable: true, align: "left" }] },
      triggers: [
        {
          event: "beforeRead",
          action: "callApi",
          enabled: true,
          blocking: true,
          config: { route: "/api/v1/items/filter" },
        },
      ],
      version: 2,
    });
  });

  it("builds view editor values and update inputs", () => {
    const values = builderViewEditorValuesFromEntity(
      {
        title: "Item View",
        description: null,
        formId: "form-1",
        listId: null,
        permissionRead: null,
        permissionWrite: "item:write",
        triggers: [{ event: "afterCreate" }],
        version: 5,
      },
      {
        title: "",
        description: "",
        formId: BUILDER_EDITOR_NONE_VALUE,
        listId: BUILDER_EDITOR_NONE_VALUE,
        permissionRead: "org:manage",
        permissionWrite: "org:manage",
        triggersText: "[]",
        version: 0,
      },
      "org:manage",
    );

    expect(values).toMatchObject({
      title: "Item View",
      formId: "form-1",
      listId: BUILDER_EDITOR_NONE_VALUE,
      permissionRead: "org:manage",
      permissionWrite: "item:write",
      version: 5,
    });
    expect(
      builderViewEditorInputFromValues(values, (text) => JSON.parse(text) as unknown[]),
    ).toEqual({
      title: "Item View",
      description: null,
      formId: "form-1",
      listId: null,
      permissionRead: "org:manage",
      permissionWrite: "item:write",
      triggers: [{ event: "afterCreate" }],
      version: 5,
    });
  });
});
