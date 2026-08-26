import { describe, expect, it } from "vitest";
import {
  type BuilderApiContracts,
  type BuilderApiQuery,
  type BuilderApiTransport,
  createBuilderApiClient,
} from "./createBuilderApiClient";

type TestContracts = BuilderApiContracts & {
  BuilderDbTable: { name: string };
  BuilderForm: { id: string };
  BuilderList: { id: string };
  BuilderView: { id: string };
  BuilderViewEntry: { id: string };
  ListBuilderFieldOptionsQuery: {
    search?: string;
    depends?: Record<string, string | undefined>;
  };
};

function createRecordingTransport() {
  const calls: Array<{ method: string; path: string; body?: unknown; query?: BuilderApiQuery }> =
    [];
  const transport: BuilderApiTransport = {
    async get(path, options) {
      calls.push({ method: "GET", path, query: options?.query });
      return {} as never;
    },
    async post(path, body, options) {
      calls.push({ method: "POST", path, body, query: options?.query });
      return {} as never;
    },
    async patch(path, body, options) {
      calls.push({ method: "PATCH", path, body, query: options?.query });
      return {} as never;
    },
    async delete(path, options) {
      calls.push({ method: "DELETE", path, query: options?.query });
      return undefined as never;
    },
  };
  return { calls, transport };
}

describe("createBuilderApiClient", () => {
  it("encodes runtime entry paths", async () => {
    const { calls, transport } = createRecordingTransport();
    const client = createBuilderApiClient<TestContracts>(transport);

    await client.updateBuilderViewEntry("view/id", "entry/id", { values: {} });

    expect(calls[0]).toEqual({
      method: "PATCH",
      path: "/builder/runtime/views/view%2Fid/entries/entry%2Fid",
      body: { values: {} },
      query: undefined,
    });
  });

  it("flattens dependent field option query params", async () => {
    const { calls, transport } = createRecordingTransport();
    const client = createBuilderApiClient<TestContracts>(transport);

    await client.listRuntimeBuilderFormFieldOptions("form", "roleId", {
      search: "owner",
      depends: { status: "ACTIVE" },
    });

    expect(calls[0]?.query).toEqual({
      search: "owner",
      "depends.status": "ACTIVE",
    });
  });

  it("encodes runtime field trigger paths", async () => {
    const { calls, transport } = createRecordingTransport();
    const client = createBuilderApiClient<TestContracts>(transport);

    await client.runRuntimeBuilderViewFieldTrigger("view/id", "name", "onChange", {
      value: "iPhone XR",
      values: { name: "iPhone XR" },
    });

    expect(calls[0]).toEqual({
      method: "POST",
      path: "/builder/runtime/views/view%2Fid/fields/name/triggers/onChange",
      body: { value: "iPhone XR", values: { name: "iPhone XR" } },
      query: undefined,
    });
  });
});
