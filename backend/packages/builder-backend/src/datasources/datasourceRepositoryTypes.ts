export type BuilderDatasourceColumnRow = {
  tableName: string;
  columnName: string;
  dataType: string;
  udtName: string;
  nullable: boolean;
  ordinalPosition: number;
};

export type ListBuilderFieldOptionRowsArgs = {
  tableName: string;
  valueColumn: string;
  labelColumn: string;
  searchColumns: readonly string[];
  search?: string;
  filterColumn?: string;
  filterValue?: string;
  filterDeletedAt?: boolean;
};

export type BuilderFieldOptionRow = {
  value: string;
  label: string;
};

export type BuilderDatasourceRepository = {
  listDbColumns(): Promise<BuilderDatasourceColumnRow[]>;
  listFieldOptionRows(args: ListBuilderFieldOptionRowsArgs): Promise<BuilderFieldOptionRow[]>;
};
