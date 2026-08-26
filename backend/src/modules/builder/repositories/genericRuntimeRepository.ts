import type {
  BuilderGenericRuntimeColumn,
  BuilderGenericRuntimeRepository,
  CreateGenericRuntimeRowArgs,
  ListGenericRuntimeRowsArgs,
} from "@winu/builder-backend/runtime";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function quoteIdentifier(value: string) {
  return Prisma.raw(`"${value.replaceAll('"', '""')}"`);
}

export const genericRuntimeRepository: BuilderGenericRuntimeRepository = {
  async listColumns(tableName: string): Promise<BuilderGenericRuntimeColumn[]> {
    const rows = await prisma.$queryRaw<
      Array<{
        column_name: string;
        data_type: string;
        udt_name: string;
        is_nullable: "YES" | "NO";
        ordinal_position: number;
      }>
    >`
      SELECT column_name, data_type, udt_name, is_nullable, ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
      ORDER BY ordinal_position ASC
    `;

    return rows.map((row) => ({
      name: row.column_name,
      dataType: row.data_type,
      udtName: row.udt_name,
      nullable: row.is_nullable === "YES",
      ordinalPosition: row.ordinal_position,
    }));
  },

  async listRows(args: ListGenericRuntimeRowsArgs) {
    const whereParts: Prisma.Sql[] = [];
    if (args.filterDeletedAt) whereParts.push(Prisma.sql`${quoteIdentifier("deletedAt")} IS NULL`);
    if (args.search && args.searchableColumns.length > 0) {
      const pattern = `%${args.search}%`;
      whereParts.push(
        Prisma.sql`(${Prisma.join(
          args.searchableColumns.map(
            (column) => Prisma.sql`CAST(${quoteIdentifier(column)} AS TEXT) ILIKE ${pattern}`,
          ),
          " OR ",
        )})`,
      );
    }

    const whereSql =
      whereParts.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereParts, " AND ")}` : Prisma.empty;
    const orderDirection = args.orderDirection === "desc" ? Prisma.raw("DESC") : Prisma.raw("ASC");
    const [countRows, rows] = await Promise.all([
      prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS total
        FROM ${quoteIdentifier(args.tableName)}
        ${whereSql}
      `),
      prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
        SELECT ${Prisma.join(args.selectedColumns.map((column) => quoteIdentifier(column)))}
        FROM ${quoteIdentifier(args.tableName)}
        ${whereSql}
        ORDER BY ${quoteIdentifier(args.orderByColumn)} ${orderDirection}
        LIMIT ${args.pageSize}
        OFFSET ${(args.page - 1) * args.pageSize}
      `),
    ]);

    return {
      total: Number(countRows[0]?.total ?? 0),
      rows,
    };
  },

  async createRow(args: CreateGenericRuntimeRowArgs) {
    const [row] = await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      INSERT INTO ${quoteIdentifier(args.tableName)}
        (${Prisma.join(args.insertColumns.map((column) => quoteIdentifier(column)))})
      VALUES
        (${Prisma.join(args.insertValues as Prisma.Sql[])})
      RETURNING ${Prisma.join(args.returningColumns.map((column) => quoteIdentifier(column)))}
    `);

    return row ?? null;
  },
};
