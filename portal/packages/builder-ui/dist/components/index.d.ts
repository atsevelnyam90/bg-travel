import * as react from 'react';
import { ComponentType, ReactNode } from 'react';
import { BuilderApiContracts } from '../api/index.js';
import { BuilderHooks } from '../hooks/index.js';
import { BuilderRuntimeFormSchemaLike, BuilderRuntimeFormValues, BuilderRuntimeEntryLike, BuilderRuntimeViewLike, BuilderRuntimeEntryValues } from '../runtime/index.js';
import '@tanstack/react-query';

type DynamicFormContracts = BuilderApiContracts & {
    BuilderForm: {
        id: string;
        title: string;
        schema: BuilderRuntimeFormSchemaLike;
    };
    CreateBuilderViewEntryInput: BuilderRuntimeFormValues;
};
type DynamicFormProps = {
    formId: string;
};
type DynamicFormShellProps = {
    title: string;
    children: ReactNode;
};
type DynamicFormFieldsProps<TSchema> = {
    formId: string;
    schema: TSchema;
    namePrefix: "values";
};
type DynamicFormSubmitProps = {
    isSaving: boolean;
};
type DynamicFormErrorStateProps = {
    title: string;
    description: string;
};
type DynamicFormNotifications = {
    success(message: string): void;
    error(message: string): void;
    errorMessage(error: unknown, fallback: string): string;
};
type DynamicFormDependencies<C extends DynamicFormContracts> = {
    hooks: Pick<BuilderHooks<C>, "useRuntimeBuilderForm" | "useSaveRuntimeBuilderFormEntry">;
    FormShell: ComponentType<DynamicFormShellProps>;
    FormFields: ComponentType<DynamicFormFieldsProps<C["BuilderForm"]["schema"]>>;
    SubmitButton: ComponentType<DynamicFormSubmitProps>;
    ErrorState: ComponentType<DynamicFormErrorStateProps>;
    notifications: DynamicFormNotifications;
};
declare function createDynamicFormComponent<C extends DynamicFormContracts>(deps: DynamicFormDependencies<C>): ({ formId }: DynamicFormProps) => react.JSX.Element | null;

type DynamicListContracts = BuilderApiContracts & {
    BuilderList: {
        id: string;
        title: string;
        description?: string | null;
    };
    BuilderViewEntry: {
        id: string;
    };
    ListBuilderViewEntriesResponse: {
        items: Array<BuilderApiContracts["BuilderViewEntry"]>;
        total: number;
    };
};
type DynamicListProps = {
    listId: string;
};
type DynamicListDataGridProps<TController> = {
    title?: string;
    description?: string;
    controller: TController;
    isLoading?: boolean;
    searchPlaceholder?: string;
    emptyTitle?: string;
    emptyDescription?: string;
};
type DynamicListErrorStateProps = {
    title: string;
    description: string;
};
type DynamicListDependencies<C extends DynamicListContracts, TColumn, TState extends {
    query: C["ListBuilderViewEntriesQuery"];
}, TController> = {
    hooks: Pick<BuilderHooks<C>, "useRuntimeBuilderList" | "useRuntimeBuilderListEntries">;
    buildColumns(list: C["BuilderList"]): TColumn[];
    useDataTableState(args?: {
        pageSize?: number;
    }): TState;
    useDataTable(args: {
        columns: TColumn[];
        data: C["BuilderViewEntry"][];
        rowCount: number;
        state: TState;
        getRowId(row: C["BuilderViewEntry"]): string;
    }): TController;
    DataGrid: ComponentType<DynamicListDataGridProps<TController>>;
    ErrorState: ComponentType<DynamicListErrorStateProps>;
};
declare function createDynamicListComponent<C extends DynamicListContracts, TColumn, TState extends {
    query: C["ListBuilderViewEntriesQuery"];
}, TController>(deps: DynamicListDependencies<C, TColumn, TState, TController>): ({ listId }: DynamicListProps) => react.JSX.Element;

type DynamicViewContracts = BuilderApiContracts & {
    BuilderView: {
        id: string;
        title: string;
        description?: string | null;
        form?: unknown | null;
    };
    BuilderViewEntry: BuilderRuntimeEntryLike;
    ListBuilderViewEntriesResponse: {
        items: Array<BuilderApiContracts["BuilderViewEntry"]>;
        total: number;
    };
};
type DynamicViewProps = {
    viewId: string;
};
type DynamicViewColumnActions<TEntry> = {
    onEdit(entry: TEntry): void;
    onDelete(entry: TEntry): void;
};
type DynamicViewDataGridProps<TController> = {
    title?: string;
    description?: string;
    controller: TController;
    isLoading?: boolean;
    searchPlaceholder?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    onRowClick?: (row: unknown) => void;
    toolbarExtra?: ReactNode;
};
type DynamicViewAddButtonProps = {
    disabled: boolean;
    onAdd(): void;
};
type DynamicViewEntryDialogProps<TView, TEntry, TInput> = {
    open: boolean;
    view: TView;
    editing: TEntry | null;
    onClose(): void;
    onSave(args: {
        id?: string;
        input: TInput;
    }): Promise<unknown>;
    isSaving: boolean;
};
type DynamicViewDeleteDialogProps<TEntry> = {
    entry: TEntry | null;
    isDeleting: boolean;
    onClose(): void;
    onConfirm(): Promise<void>;
};
type DynamicViewErrorStateProps = {
    title: string;
    description: string;
};
type DynamicViewDependencies<C extends DynamicViewContracts, TColumn, TState extends {
    query: C["ListBuilderViewEntriesQuery"];
}, TController> = {
    hooks: Pick<BuilderHooks<C>, "useBuilderViewEntries" | "useDeleteBuilderViewEntry" | "useRuntimeBuilderView" | "useSaveBuilderViewEntry">;
    buildColumns(view: C["BuilderView"], actions: DynamicViewColumnActions<C["BuilderViewEntry"]>): TColumn[];
    useDataTableState(args?: {
        pageSize?: number;
    }): TState;
    useDataTable(args: {
        columns: TColumn[];
        data: C["BuilderViewEntry"][];
        rowCount: number;
        state: TState;
        getRowId(row: C["BuilderViewEntry"]): string;
    }): TController;
    DataGrid: ComponentType<DynamicViewDataGridProps<TController>>;
    AddButton: ComponentType<DynamicViewAddButtonProps>;
    EntryDialog: ComponentType<DynamicViewEntryDialogProps<C["BuilderView"], C["BuilderViewEntry"], C["UpdateBuilderViewEntryInput"]>>;
    DeleteDialog: ComponentType<DynamicViewDeleteDialogProps<C["BuilderViewEntry"]>>;
    ErrorState: ComponentType<DynamicViewErrorStateProps>;
};
declare function createDynamicViewComponent<C extends DynamicViewContracts, TColumn, TState extends {
    query: C["ListBuilderViewEntriesQuery"];
}, TController>(deps: DynamicViewDependencies<C, TColumn, TState, TController>): ({ viewId }: DynamicViewProps) => react.JSX.Element;

type RuntimeEntryDialogViewLike = BuilderRuntimeViewLike & {
    id: string;
    title: string;
    form?: {
        id: string;
        schema: BuilderRuntimeFormSchemaLike;
    } | null;
};
type RuntimeEntryDialogSaveArgs<TInput> = {
    id?: string;
    input: TInput;
};
type RuntimeEntryDialogProps<TView, TEntry, TInput> = {
    open: boolean;
    view: TView;
    editing: TEntry | null;
    onClose: () => void;
    onSave: (args: RuntimeEntryDialogSaveArgs<TInput>) => Promise<unknown>;
    isSaving: boolean;
};
type RuntimeEntryDialogShellProps = {
    open: boolean;
    title: string;
    description: string;
    onClose: () => void;
    children: ReactNode;
};
type RuntimeEntryDialogFieldsProps<TSchema> = {
    formId: string;
    viewId: string;
    schema: TSchema;
    namePrefix: "values";
};
type RuntimeEntryDialogActionsProps = {
    isSaving: boolean;
    onClose: () => void;
};
type RuntimeEntryDialogNotifications = {
    success(message: string): void;
    error(message: string): void;
    errorMessage(error: unknown, fallback: string): string;
};
type RuntimeEntryDialogDependencies<TView extends RuntimeEntryDialogViewLike> = {
    DialogShell: ComponentType<RuntimeEntryDialogShellProps>;
    FormFields: ComponentType<RuntimeEntryDialogFieldsProps<NonNullable<TView["form"]>["schema"]>>;
    Actions: ComponentType<RuntimeEntryDialogActionsProps>;
    notifications: RuntimeEntryDialogNotifications;
};
declare function createRuntimeEntryDialogComponent<TView extends RuntimeEntryDialogViewLike, TEntry extends BuilderRuntimeEntryLike, TInput extends BuilderRuntimeEntryValues>(deps: RuntimeEntryDialogDependencies<TView>): ({ open, view, editing, onClose, onSave, isSaving, }: RuntimeEntryDialogProps<TView, TEntry, TInput>) => react.JSX.Element;

export { type DynamicFormContracts, type DynamicFormDependencies, type DynamicFormErrorStateProps, type DynamicFormFieldsProps, type DynamicFormNotifications, type DynamicFormProps, type DynamicFormShellProps, type DynamicFormSubmitProps, type DynamicListContracts, type DynamicListDataGridProps, type DynamicListDependencies, type DynamicListErrorStateProps, type DynamicListProps, type DynamicViewAddButtonProps, type DynamicViewColumnActions, type DynamicViewContracts, type DynamicViewDataGridProps, type DynamicViewDeleteDialogProps, type DynamicViewDependencies, type DynamicViewEntryDialogProps, type DynamicViewErrorStateProps, type DynamicViewProps, type RuntimeEntryDialogActionsProps, type RuntimeEntryDialogDependencies, type RuntimeEntryDialogFieldsProps, type RuntimeEntryDialogNotifications, type RuntimeEntryDialogProps, type RuntimeEntryDialogSaveArgs, type RuntimeEntryDialogShellProps, type RuntimeEntryDialogViewLike, createDynamicFormComponent, createDynamicListComponent, createDynamicViewComponent, createRuntimeEntryDialogComponent };
