import type {
  BuilderDatasourceColumnRow,
  BuilderDatasourceRepository,
  ListBuilderFieldOptionRowsArgs,
} from "@duke333/builder-backend/datasources";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function quoteIdentifier(value: string) {
  return Prisma.raw(`"${value.replaceAll('"', '""')}"`);
}

export const builderDatasourceRepository: BuilderDatasourceRepository = {
  async listDbColumns(): Promise<BuilderDatasourceColumnRow[]> {
    const rows = await prisma.$queryRaw<
      Array<{
        table_name: string;
        column_name: string;
        data_type: string;
        udt_name: string;
        is_nullable: "YES" | "NO";
        ordinal_position: number;
      }>
    >`
      SELECT
        table_name,
        column_name,
        data_type,
        udt_name,
        is_nullable,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name <> '_prisma_migrations'
        AND table_name NOT LIKE 'builder_%'
      ORDER BY table_name ASC, ordinal_position ASC
    `;

    return rows.map((row) => ({
      tableName: row.table_name,
      columnName: row.column_name,
      dataType: row.data_type,
      udtName: row.udt_name,
      nullable: row.is_nullable === "YES",
      ordinalPosition: row.ordinal_position,
    }));
  },

  async listFieldOptionRows(args: ListBuilderFieldOptionRowsArgs) {
    const whereParts: Prisma.Sql[] = [];
    if (args.filterDeletedAt) whereParts.push(Prisma.sql`${quoteIdentifier("deletedAt")} IS NULL`);
    if (args.search && args.searchColumns.length > 0) {
      const pattern = `%${args.search}%`;
      whereParts.push(
        Prisma.sql`(${Prisma.join(
          args.searchColumns.map(
            (column) => Prisma.sql`CAST(${quoteIdentifier(column)} AS TEXT) ILIKE ${pattern}`,
          ),
          " OR ",
        )})`,
      );
    }
    if (args.filterColumn && args.filterValue) {
      whereParts.push(
        Prisma.sql`CAST(${quoteIdentifier(args.filterColumn)} AS TEXT) = ${args.filterValue}`,
      );
    }

    return prisma.$queryRaw<Array<{ value: string; label: string }>>(Prisma.sql`
      SELECT
        CAST(${quoteIdentifier(args.valueColumn)} AS TEXT) AS value,
        CAST(${quoteIdentifier(args.labelColumn)} AS TEXT) AS label
      FROM ${quoteIdentifier(args.tableName)}
      ${whereParts.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereParts, " AND ")}` : Prisma.empty}
      ORDER BY ${quoteIdentifier(args.labelColumn)} ASC
      LIMIT 50
    `);
  },
};
