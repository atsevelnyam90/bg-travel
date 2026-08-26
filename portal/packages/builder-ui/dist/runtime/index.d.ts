type BuilderRuntimeFieldLike = {
    key: string;
    type: string;
};
type BuilderRuntimeFormSchemaLike = {
    fields: readonly BuilderRuntimeFieldLike[];
};
type BuilderRuntimeViewLike = {
    form?: {
        schema: BuilderRuntimeFormSchemaLike;
    } | null;
};
type BuilderRuntimeEntryLike = {
    id: string;
    values: Record<string, unknown>;
    version: number;
};
type BuilderRuntimeFormValues = {
    values: Record<string, unknown>;
};
type BuilderRuntimeEntryValues = BuilderRuntimeFormValues & {
    version: number;
};
declare function createBuilderFormDefaultValues(schema?: BuilderRuntimeFormSchemaLike): BuilderRuntimeFormValues;
declare function createBuilderEntryDefaultValues(view: BuilderRuntimeViewLike, editing: BuilderRuntimeEntryLike | null): BuilderRuntimeEntryValues;
declare function formatBuilderRuntimeValue(value: unknown, locale?: string): string;

export { type BuilderRuntimeEntryLike, type BuilderRuntimeEntryValues, type BuilderRuntimeFieldLike, type BuilderRuntimeFormSchemaLike, type BuilderRuntimeFormValues, type BuilderRuntimeViewLike, createBuilderEntryDefaultValues, createBuilderFormDefaultValues, formatBuilderRuntimeValue };
