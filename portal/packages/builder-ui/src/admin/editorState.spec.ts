import { describe, expect, it } from "vitest";
import {
  BUILDER_EDITOR_NONE_VALUE,
  builderEditorTextToOptions,
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
      name: "products",
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
      { key: "name", label: "Name", type: "text", required: true },
      { key: "priceMinor", label: "Price", type: "money", required: false },
    ]);
    expect(builderListEditorColumnsFromTable(table)).toEqual([
      { key: "name", label: "Name", sortable: true, align: "left" },
      { key: "priceMinor", label: "Price", sortable: true, align: "right" },
    ]);
  });

  it("round-trips form entity state into an update input", () => {
    const values = builderFormEditorValuesFromEntity(
      {
        title: "Product",
        description: null,
        version: 3,
        source: { type: "dbTable", tableName: "products" },
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
        },
        triggers: [
          {
            event: "beforeCreate",
            action: "callApi",
            enabled: true,
            blocking: true,
            config: { path: "/api/v1/products/validate" },
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
        triggers: [],
        version: 0,
      },
    );

    expect(values.triggers).toEqual([
      {
        event: "beforeCreate",
        route: "/api/v1/products/validate",
        enabled: true,
        blocking: true,
      },
    ]);
    expect(builderFormEditorInputFromValues(values)).toMatchObject({
      source: { type: "dbTable", tableName: "products" },
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
      },
      triggers: [
        {
          event: "beforeCreate",
          action: "callApi",
          enabled: true,
          blocking: true,
          config: { route: "/api/v1/products/validate" },
        },
      ],
      version: 3,
    });
  });

  it("builds list update inputs", () => {
    expect(
      builderListEditorInputFromValues({
        title: "Products",
        description: "",
        sourceType: "apiEndpoint",
        sourceTable: BUILDER_EDITOR_NONE_VALUE,
        apiBasePath: "/api/v1/products",
        columns: [{ key: "name", label: "Name", sortable: true, align: "left" }],
        triggers: [
          { event: "beforeRead", route: "/api/v1/products/filter", enabled: true, blocking: true },
        ],
        version: 2,
      }),
    ).toEqual({
      title: "Products",
      description: null,
      source: { type: "apiEndpoint", basePath: "/api/v1/products" },
      schema: { columns: [{ key: "name", label: "Name", sortable: true, align: "left" }] },
      triggers: [
        {
          event: "beforeRead",
          action: "callApi",
          enabled: true,
          blocking: true,
          config: { route: "/api/v1/products/filter" },
        },
      ],
      version: 2,
    });
  });

  it("builds view editor values and update inputs", () => {
    const values = builderViewEditorValuesFromEntity(
      {
        title: "Product View",
        description: null,
        formId: "form-1",
        listId: null,
        permissionRead: null,
        permissionWrite: "product:write",
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
      title: "Product View",
      formId: "form-1",
      listId: BUILDER_EDITOR_NONE_VALUE,
      permissionRead: "org:manage",
      permissionWrite: "product:write",
      version: 5,
    });
    expect(
      builderViewEditorInputFromValues(values, (text) => JSON.parse(text) as unknown[]),
    ).toEqual({
      title: "Product View",
      description: null,
      formId: "form-1",
      listId: null,
      permissionRead: "org:manage",
      permissionWrite: "product:write",
      triggers: [{ event: "afterCreate" }],
      version: 5,
    });
  });
});
