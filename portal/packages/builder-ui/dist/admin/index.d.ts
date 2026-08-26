import * as react from 'react';
import { ReactNode, ComponentType } from 'react';
import { UseFormReturn, UseFieldArrayReturn, Resolver } from 'react-hook-form';

declare const BUILDER_EDITOR_NONE_VALUE = "__none";
type BuilderEditorSelectOption = {
    label: string;
    value: string;
};
type BuilderEditorDbTable<TFieldType extends string = string> = {
    name: string;
    label?: string;
    lookupColumns?: Array<{
        name: string;
        label: string;
    }>;
    columns: Array<{
        name: string;
        label: string;
        fieldType: TFieldType;
        nullable: boolean;
        dataType: string;
        sortable: boolean;
    }>;
};
type BuilderEditorSource = {
    type: "dbTable";
    tableName: string;
} | {
    type: "apiEndpoint";
    basePath: string;
} | null;
type BuilderEditorTrigger<TEvent extends string> = {
    event: TEvent;
    action: string;
    enabled: boolean;
    blocking: boolean;
    config: Record<string, unknown>;
};
type BuilderEditorField<TFieldType extends string> = {
    key: string;
    label: string;
    type: TFieldType;
    required: boolean;
    hidden?: boolean;
    disabled?: boolean;
    placeholder?: string;
    description?: string;
    options?: BuilderEditorSelectOption[];
    optionsSource?: {
        type: "dbTable";
        tableName: string;
        valueField: string;
        labelField: string;
        searchFields?: string[];
        filterBy?: {
            field: string;
            valueFromField: string;
        };
    } | undefined;
    triggers?: BuilderEditorFieldTrigger[];
};
type BuilderEditorColumn = {
    key: string;
    label: string;
    sortable: boolean;
    align: "left" | "right";
};
type BuilderFormEditorEntity<TFieldType extends string = string, TTriggerEvent extends string = string> = {
    title: string;
    description: string | null;
    version: number;
    source: BuilderEditorSource;
    schema: {
        fields: BuilderEditorField<TFieldType>[];
    };
    triggers: BuilderEditorTrigger<TTriggerEvent>[];
};
type BuilderListEditorEntity<TTriggerEvent extends string = string> = {
    title: string;
    description: string | null;
    version: number;
    source: BuilderEditorSource;
    schema: {
        columns: BuilderEditorColumn[];
    };
    triggers: BuilderEditorTrigger<TTriggerEvent>[];
};
type BuilderFormEditorFieldValues<TFieldType extends string = string> = {
    key: string;
    label: string;
    type: TFieldType;
    required: boolean;
    hidden: boolean;
    disabled: boolean;
    placeholder?: string;
    optionsText?: string;
    optionsMode: "static" | "table";
    optionsTable: string;
    optionsValueField: string;
    optionsLabelField: string;
    optionsSearchFieldsText?: string;
    optionsDependsOn?: string;
    optionsFilterField?: string;
    triggers: BuilderEditorFieldTriggerValues[];
};
type BuilderEditorTriggerValues<TEvent extends string = string> = {
    event: TEvent;
    route: string;
    enabled: boolean;
    blocking: boolean;
};
type BuilderEditorFieldTrigger = {
    event: string;
    action: string;
    enabled: boolean;
    debounceMs: number;
    config: Record<string, unknown>;
};
type BuilderEditorFieldTriggerValues = {
    event: string;
    action: string;
    enabled: boolean;
    debounceMs: number;
};
type BuilderFormEditorValues<TFieldType extends string = string, TTriggerEvent extends string = string> = {
    title: string;
    description?: string;
    sourceType: "none" | "dbTable" | "apiEndpoint";
    sourceTable: string;
    apiBasePath?: string;
    fields: BuilderFormEditorFieldValues<TFieldType>[];
    triggers: BuilderEditorTriggerValues<TTriggerEvent>[];
    version: number;
};
type BuilderListEditorColumnValues = {
    key: string;
    label: string;
    sortable: boolean;
    align: "left" | "right";
};
type BuilderListEditorValues<TTriggerEvent extends string = string> = {
    title: string;
    description?: string;
    sourceType: "none" | "dbTable" | "apiEndpoint";
    sourceTable: string;
    apiBasePath?: string;
    columns: BuilderListEditorColumnValues[];
    triggers: BuilderEditorTriggerValues<TTriggerEvent>[];
    version: number;
};
type BuilderViewEditorEntity<TTrigger = unknown> = {
    title: string;
    description: string | null;
    formId: string | null;
    listId: string | null;
    permissionRead?: string | null;
    permissionWrite?: string | null;
    triggers: TTrigger[];
    version: number;
};
type BuilderViewEditorValues = {
    title: string;
    description?: string;
    formId: string;
    listId: string;
    permissionRead: string;
    permissionWrite: string;
    triggersText?: string;
    version: number;
};
declare function builderEditorOptionsToText(options?: BuilderEditorSelectOption[]): string;
declare function builderEditorTextToOptions(value?: string): BuilderEditorSelectOption[] | undefined;
declare function builderEditorSearchFieldsToText(fields?: string[]): string;
declare function builderEditorTextToSearchFields(value?: string): string[] | undefined;
declare function getBuilderEditorTriggerRoute(config: Record<string, unknown>): string;
declare function builderFormEditorValuesFromEntity<TFieldType extends string, TTriggerEvent extends string>(form: BuilderFormEditorEntity<TFieldType, TTriggerEvent> | null, emptyValues: BuilderFormEditorValues<TFieldType, TTriggerEvent>): BuilderFormEditorValues<TFieldType, TTriggerEvent>;
declare function builderListEditorValuesFromEntity<TTriggerEvent extends string>(list: BuilderListEditorEntity<TTriggerEvent> | null, emptyValues: BuilderListEditorValues<TTriggerEvent>): BuilderListEditorValues<TTriggerEvent>;
declare function builderViewEditorValuesFromEntity<TTrigger>(view: BuilderViewEditorEntity<TTrigger> | null, emptyValues: BuilderViewEditorValues, defaultPermission: string): BuilderViewEditorValues;
declare function builderFormEditorFieldsFromTable<TFieldType extends string>(table: BuilderEditorDbTable<TFieldType>): BuilderFormEditorFieldValues<TFieldType>[];
declare function builderListEditorColumnsFromTable<TFieldType extends string>(table: BuilderEditorDbTable<TFieldType>): BuilderListEditorColumnValues[];
declare function builderFormEditorInputFromValues<TFieldType extends string, TTriggerEvent extends string>(values: BuilderFormEditorValues<TFieldType, TTriggerEvent>): {
    title: string;
    description: string | null;
    source: {
        type: "dbTable";
        tableName: string;
        basePath?: undefined;
    } | {
        type: "apiEndpoint";
        basePath: string;
        tableName?: undefined;
    } | null;
    schema: {
        fields: {
            key: string;
            label: string;
            type: TFieldType;
            required: boolean;
            hidden: boolean;
            disabled: boolean;
            placeholder: string | undefined;
            options: BuilderEditorSelectOption[] | undefined;
            optionsSource: {
                type: "dbTable";
                tableName: string;
                valueField: string;
                labelField: string;
                searchFields: string[] | undefined;
                filterBy: {
                    field: string;
                    valueFromField: string;
                } | undefined;
            } | undefined;
            triggers: {
                event: string;
                action: string;
                enabled: boolean;
                debounceMs: number;
                config: {};
            }[];
        }[];
    };
    triggers: {
        event: TTriggerEvent;
        action: "callApi";
        enabled: boolean;
        blocking: boolean;
        config: {
            route: string;
        };
    }[];
    version: number;
};
declare function builderListEditorInputFromValues<TTriggerEvent extends string>(values: BuilderListEditorValues<TTriggerEvent>): {
    title: string;
    description: string | null;
    source: {
        type: "dbTable";
        tableName: string;
        basePath?: undefined;
    } | {
        type: "apiEndpoint";
        basePath: string;
        tableName?: undefined;
    } | null;
    schema: {
        columns: BuilderListEditorColumnValues[];
    };
    triggers: {
        event: TTriggerEvent;
        action: "callApi";
        enabled: boolean;
        blocking: boolean;
        config: {
            route: string;
        };
    }[];
    version: number;
};
declare function builderViewEditorInputFromValues<TTrigger>(values: BuilderViewEditorValues, parseTriggers: (value: string) => TTrigger[]): {
    title: string;
    description: string | null;
    formId: string | null;
    listId: string | null;
    permissionRead: string;
    permissionWrite: string;
    triggers: TTrigger[];
    version: number;
};

type BuilderEditorEntity = {
    id: string;
};
type BuilderEditorQuery<TEntity> = {
    data?: TEntity;
    isPending: boolean;
    isError: boolean;
};
type BuilderEditorListQuery<TItem> = {
    data?: TItem[];
};
type BuilderEditorSaveMutation<TInput, TEntity> = {
    mutateAsync(args: {
        id?: string;
        input: TInput;
    }): Promise<TEntity>;
    isPending: boolean;
};
type BuilderEditorNotifications = {
    success(message: string): void;
    error(error: unknown): void;
};
type BuilderEditorLabels = {
    created: string;
    saved: string;
};
type BuilderEditorStateLabels = {
    loading: string;
    error: string;
};
type BuilderFormEditorBodyProps<TFieldType extends string, TTriggerEvent extends string> = {
    formId?: string;
    form: UseFormReturn<BuilderFormEditorValues<TFieldType, TTriggerEvent>>;
    fieldArray: UseFieldArrayReturn<BuilderFormEditorValues<TFieldType, TTriggerEvent>, "fields">;
    triggerArray: UseFieldArrayReturn<BuilderFormEditorValues<TFieldType, TTriggerEvent>, "triggers">;
    fields: BuilderFormEditorFieldValues<TFieldType>[];
    sourceType: BuilderFormEditorValues<TFieldType, TTriggerEvent>["sourceType"];
    sourceTable: string;
    tables: BuilderEditorDbTable<TFieldType>[];
    emptyField: BuilderFormEditorFieldValues<TFieldType>;
    emptyTrigger: BuilderEditorTriggerValues<TTriggerEvent>;
    isSaving: boolean;
    importFieldsFromTable(): void;
};
type BuilderListEditorBodyProps<TTriggerEvent extends string> = {
    listId?: string;
    form: UseFormReturn<BuilderListEditorValues<TTriggerEvent>>;
    columnArray: UseFieldArrayReturn<BuilderListEditorValues<TTriggerEvent>, "columns">;
    triggerArray: UseFieldArrayReturn<BuilderListEditorValues<TTriggerEvent>, "triggers">;
    sourceType: BuilderListEditorValues<TTriggerEvent>["sourceType"];
    sourceTable: string;
    tables: BuilderEditorDbTable[];
    emptyColumn: BuilderListEditorColumnValues;
    emptyTrigger: BuilderEditorTriggerValues<TTriggerEvent>;
    isSaving: boolean;
    importColumnsFromTable(): void;
};
type BuilderFormEditorPageDependencies<TEntity extends BuilderEditorEntity & BuilderFormEditorEntity<TFieldType, TTriggerEvent>, TInput, TFieldType extends string, TTriggerEvent extends string> = {
    emptyValues: BuilderFormEditorValues<TFieldType, TTriggerEvent>;
    emptyField: BuilderFormEditorFieldValues<TFieldType>;
    emptyTrigger: BuilderEditorTriggerValues<TTriggerEvent>;
    resolver?: Resolver<BuilderFormEditorValues<TFieldType, TTriggerEvent>>;
    labels: BuilderEditorLabels;
    states: BuilderEditorStateLabels;
    hooks: {
        useEntity(id?: string): BuilderEditorQuery<TEntity>;
        useTables(): BuilderEditorListQuery<BuilderEditorDbTable<TFieldType>>;
        useSave(): BuilderEditorSaveMutation<TInput, TEntity>;
    };
    buildInput(values: BuilderFormEditorValues<TFieldType, TTriggerEvent>): TInput;
    navigateAfterCreate(entity: TEntity): void;
    notifications: BuilderEditorNotifications;
    Body(props: BuilderFormEditorBodyProps<TFieldType, TTriggerEvent>): ReactNode;
};
type BuilderListEditorPageDependencies<TEntity extends BuilderEditorEntity & BuilderListEditorEntity<TTriggerEvent>, TInput, TTriggerEvent extends string> = {
    emptyValues: BuilderListEditorValues<TTriggerEvent>;
    emptyColumn: BuilderListEditorColumnValues;
    emptyTrigger: BuilderEditorTriggerValues<TTriggerEvent>;
    resolver?: Resolver<BuilderListEditorValues<TTriggerEvent>>;
    labels: BuilderEditorLabels;
    states: BuilderEditorStateLabels;
    hooks: {
        useEntity(id?: string): BuilderEditorQuery<TEntity>;
        useTables(): BuilderEditorListQuery<BuilderEditorDbTable>;
        useSave(): BuilderEditorSaveMutation<TInput, TEntity>;
    };
    buildInput(values: BuilderListEditorValues<TTriggerEvent>): TInput;
    navigateAfterCreate(entity: TEntity): void;
    notifications: BuilderEditorNotifications;
    Body(props: BuilderListEditorBodyProps<TTriggerEvent>): ReactNode;
};
declare function createBuilderFormEditorPageComponent<TEntity extends BuilderEditorEntity & BuilderFormEditorEntity<TFieldType, TTriggerEvent>, TInput, TFieldType extends string, TTriggerEvent extends string>(deps: BuilderFormEditorPageDependencies<TEntity, TInput, TFieldType, TTriggerEvent>): ({ formId }: {
    formId?: string;
}) => react.JSX.Element;
declare function createBuilderListEditorPageComponent<TEntity extends BuilderEditorEntity & BuilderListEditorEntity<TTriggerEvent>, TInput, TTriggerEvent extends string>(deps: BuilderListEditorPageDependencies<TEntity, TInput, TTriggerEvent>): ({ listId }: {
    listId?: string;
}) => react.JSX.Element;

type BuilderEntityManagerEntity = {
    id: string;
    title: string;
};
type BuilderEntityManagerActions<TEntity extends BuilderEntityManagerEntity> = {
    onEdit(entity: TEntity): void;
    onReplicate(entity: TEntity): void | Promise<void>;
    onDelete(entity: TEntity): void;
    runtimeHref?: (entity: TEntity) => string;
};
type BuilderEntityManagerDataGridProps<TController, TEntity> = {
    title: string;
    description: string;
    controller: TController;
    isLoading?: boolean;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    onRowClick(entity: TEntity): void;
    toolbarExtra: ReactNode;
};
type BuilderEntityManagerAddButtonProps = {
    href: string;
    label: string;
};
type BuilderEntityManagerDialogAddButtonProps = {
    label: string;
    onAdd(): void;
};
type BuilderEntityManagerDeleteDialogProps<TEntity> = {
    entity: TEntity | null;
    title: string;
    description: string;
    isDeleting: boolean;
    onClose(): void;
    onConfirm(): Promise<void>;
};
type BuilderEntityManagerEditorDialogProps<TEntity> = {
    open: boolean;
    editing: TEntity | null;
    onClose(): void;
};
type BuilderEntityManagerHookResult<TEntity> = {
    data?: {
        items: TEntity[];
        total: number;
    };
    isPending: boolean;
};
type BuilderEntityManagerMutation<TInput> = {
    mutateAsync(input: TInput): Promise<unknown>;
    isPending: boolean;
};
type BuilderEntityManagerLabels = {
    title: string;
    description: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    addLabel: string;
    deleteTitle: string;
    deleteDescription(entity: BuilderEntityManagerEntity | null): string;
};
type BuilderEntityManagerDependencies<TEntity extends BuilderEntityManagerEntity, TColumn, TState extends {
    query: TQuery;
}, TQuery, TController> = {
    labels: BuilderEntityManagerLabels;
    createHref: string;
    runtimeHref(entity: TEntity): string;
    navigateToEdit(entity: TEntity): void;
    requestReplicateTitle(entity: TEntity): string | null | Promise<string | null>;
    hooks: {
        useEntities(query: TQuery): BuilderEntityManagerHookResult<TEntity>;
        useDelete(): BuilderEntityManagerMutation<string>;
        useReplicate(): BuilderEntityManagerMutation<{
            id: string;
            input: {
                title?: string;
            };
        }>;
    };
    buildColumns(actions: BuilderEntityManagerActions<TEntity>): TColumn[];
    useDataTableState(args?: {
        pageSize?: number;
    }): TState;
    useDataTable(args: {
        columns: TColumn[];
        data: TEntity[];
        rowCount: number;
        state: TState;
        getRowId(row: TEntity): string;
    }): TController;
    DataGrid: ComponentType<BuilderEntityManagerDataGridProps<TController, TEntity>>;
    AddButton: ComponentType<BuilderEntityManagerAddButtonProps>;
    DeleteDialog: ComponentType<BuilderEntityManagerDeleteDialogProps<TEntity>>;
};
type BuilderEntityDialogManagerDependencies<TEntity extends BuilderEntityManagerEntity, TColumn, TState extends {
    query: TQuery;
}, TQuery, TController> = {
    labels: BuilderEntityManagerLabels;
    runtimeHref(entity: TEntity): string;
    requestReplicateTitle(entity: TEntity): string | null | Promise<string | null>;
    hooks: {
        useEntities(query: TQuery): BuilderEntityManagerHookResult<TEntity>;
        useDelete(): BuilderEntityManagerMutation<string>;
        useReplicate(): BuilderEntityManagerMutation<{
            id: string;
            input: {
                title?: string;
            };
        }>;
    };
    buildColumns(actions: BuilderEntityManagerActions<TEntity>): TColumn[];
    useDataTableState(args?: {
        pageSize?: number;
    }): TState;
    useDataTable(args: {
        columns: TColumn[];
        data: TEntity[];
        rowCount: number;
        state: TState;
        getRowId(row: TEntity): string;
    }): TController;
    DataGrid: ComponentType<BuilderEntityManagerDataGridProps<TController, TEntity>>;
    AddButton: ComponentType<BuilderEntityManagerDialogAddButtonProps>;
    EditorDialog: ComponentType<BuilderEntityManagerEditorDialogProps<TEntity>>;
    DeleteDialog: ComponentType<BuilderEntityManagerDeleteDialogProps<TEntity>>;
};
declare function createBuilderEntityManagerComponent<TEntity extends BuilderEntityManagerEntity, TColumn, TState extends {
    query: TQuery;
}, TQuery, TController>(deps: BuilderEntityManagerDependencies<TEntity, TColumn, TState, TQuery, TController>): () => react.JSX.Element;
declare function createBuilderEntityDialogManagerComponent<TEntity extends BuilderEntityManagerEntity, TColumn, TState extends {
    query: TQuery;
}, TQuery, TController>(deps: BuilderEntityDialogManagerDependencies<TEntity, TColumn, TState, TQuery, TController>): () => react.JSX.Element;

type BuilderOptionEntity = {
    id: string;
    title: string;
};
type BuilderViewDialogSaveMutation<TInput> = (args: {
    id?: string;
    input: TInput;
}) => Promise<unknown>;
type BuilderViewDialogNotifications = {
    success(message: string): void;
    error(error: unknown): void;
};
type BuilderViewDialogLabels = {
    created: string;
    saved: string;
};
type BuilderViewDialogProps<TView, TForm, TList, TInput> = {
    open: boolean;
    editing: TView | null;
    forms: TForm[];
    lists: TList[];
    onClose(): void;
    onSave: BuilderViewDialogSaveMutation<TInput>;
    isSaving: boolean;
};
type BuilderViewDialogShellProps<TView> = {
    open: boolean;
    editing: TView | null;
    onClose(): void;
    children: ReactNode;
};
type BuilderViewDialogBodyProps<TForm, TList> = {
    form: UseFormReturn<BuilderViewEditorValues>;
    editing: BuilderViewEditorEntity | null;
    forms: TForm[];
    lists: TList[];
    permissionOptions: Array<{
        value: string;
        label: string;
    }>;
    noneValue: string;
    isSaving: boolean;
    onClose(): void;
};
type BuilderViewDialogDependencies<TView extends BuilderViewEditorEntity & {
    id: string;
}, TForm extends BuilderOptionEntity, TList extends BuilderOptionEntity, TInput> = {
    emptyValues: BuilderViewEditorValues;
    defaultPermission: string;
    permissionOptions: Array<{
        value: string;
        label: string;
    }>;
    noneValue: string;
    resolver?: Resolver<BuilderViewEditorValues>;
    labels: BuilderViewDialogLabels;
    buildInput(values: BuilderViewEditorValues): TInput;
    notifications: BuilderViewDialogNotifications;
    Shell(props: BuilderViewDialogShellProps<TView>): ReactNode;
    Body(props: BuilderViewDialogBodyProps<TForm, TList>): ReactNode;
};
declare function createBuilderViewDialogComponent<TView extends BuilderViewEditorEntity & {
    id: string;
}, TForm extends BuilderOptionEntity, TList extends BuilderOptionEntity, TInput>(deps: BuilderViewDialogDependencies<TView, TForm, TList, TInput>): ({ open, editing, forms, lists, onClose, onSave, isSaving, }: BuilderViewDialogProps<TView, TForm, TList, TInput>) => react.JSX.Element;

export { BUILDER_EDITOR_NONE_VALUE, type BuilderEditorDbTable, type BuilderEditorSelectOption, type BuilderEditorTriggerValues, type BuilderEntityDialogManagerDependencies, type BuilderEntityManagerActions, type BuilderEntityManagerAddButtonProps, type BuilderEntityManagerDataGridProps, type BuilderEntityManagerDeleteDialogProps, type BuilderEntityManagerDependencies, type BuilderEntityManagerDialogAddButtonProps, type BuilderEntityManagerEditorDialogProps, type BuilderEntityManagerEntity, type BuilderEntityManagerHookResult, type BuilderEntityManagerLabels, type BuilderEntityManagerMutation, type BuilderFormEditorBodyProps, type BuilderFormEditorEntity, type BuilderFormEditorFieldValues, type BuilderFormEditorPageDependencies, type BuilderFormEditorValues, type BuilderListEditorBodyProps, type BuilderListEditorColumnValues, type BuilderListEditorEntity, type BuilderListEditorPageDependencies, type BuilderListEditorValues, type BuilderViewDialogBodyProps, type BuilderViewDialogDependencies, type BuilderViewDialogProps, type BuilderViewDialogShellProps, type BuilderViewEditorEntity, type BuilderViewEditorValues, builderEditorOptionsToText, builderEditorSearchFieldsToText, builderEditorTextToOptions, builderEditorTextToSearchFields, builderFormEditorFieldsFromTable, builderFormEditorInputFromValues, builderFormEditorValuesFromEntity, builderListEditorColumnsFromTable, builderListEditorInputFromValues, builderListEditorValuesFromEntity, builderViewEditorInputFromValues, builderViewEditorValuesFromEntity, createBuilderEntityDialogManagerComponent, createBuilderEntityManagerComponent, createBuilderFormEditorPageComponent, createBuilderListEditorPageComponent, createBuilderViewDialogComponent, getBuilderEditorTriggerRoute };
