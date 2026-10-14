import type {
  BuilderGenericRuntimeColumn,
  BuilderGenericRuntimeRepository,
  CreateGenericRuntimeRowArgs,
  DeleteGenericRuntimeRowArgs,
  ListGenericRuntimeRowsArgs,
  UpdateGenericRuntimeRowArgs,
} from "@duke333/builder-backend/runtime";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type RuntimePrismaClient = Pick<typeof prisma, "$queryRaw">;

function quoteIdentifier(value: string) {
  return Prisma.raw(`"${value.replaceAll('"', '""')}"`);
}

function createGenericRuntimeRepository(
  client: RuntimePrismaClient,
  transaction: BuilderGenericRuntimeRepository["transaction"],
): BuilderGenericRuntimeRepository {
  return {
    async listColumns(tableName: string): Promise<BuilderGenericRuntimeColumn[]> {
      const rows = await client.$queryRaw<
        Array<{
          column_name: string;
          data_type: string;
          udt_name: string;
          is_nullable: "YES" | "NO";
          column_default: string | null;
          ordinal_position: number;
        }>
      >`
      SELECT column_name, data_type, udt_name, is_nullable, column_default, ordinal_position
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
        hasDefault: row.column_default !== null,
        ordinalPosition: row.ordinal_position,
      }));
    },

    async listRows(args: ListGenericRuntimeRowsArgs) {
      const whereParts: Prisma.Sql[] = [];
      if (args.filterDeletedAt)
        whereParts.push(Prisma.sql`${quoteIdentifier("deletedAt")} IS NULL`);
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
      if (args.filterColumn && args.filterValue !== undefined) {
        whereParts.push(
          Prisma.sql`CAST(${quoteIdentifier(args.filterColumn)} AS TEXT) = ${args.filterValue}`,
        );
      }

      const whereSql =
        whereParts.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereParts, " AND ")}`
          : Prisma.empty;
      const orderDirection =
        args.orderDirection === "desc" ? Prisma.raw("DESC") : Prisma.raw("ASC");
      const [countRows, rows] = await Promise.all([
        client.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS total
        FROM ${quoteIdentifier(args.tableName)}
        ${whereSql}
      `),
        client.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
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
      const [row] = await client.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      INSERT INTO ${quoteIdentifier(args.tableName)}
        (${Prisma.join(args.insertColumns.map((column) => quoteIdentifier(column)))})
      VALUES
        (${Prisma.join(args.insertValues as Prisma.Sql[])})
      RETURNING ${Prisma.join(args.returningColumns.map((column) => quoteIdentifier(column)))}
    `);

      return row ?? null;
    },

    async updateRow(args: UpdateGenericRuntimeRowArgs) {
      const assignments = args.updateColumns.map(
        (column, index) => Prisma.sql`${quoteIdentifier(column)} = ${args.updateValues[index]}`,
      );
      if (args.incrementVersion) {
        assignments.push(
          Prisma.sql`${quoteIdentifier("version")} = ${quoteIdentifier("version")} + 1`,
        );
      }

      const whereParts = [Prisma.sql`${quoteIdentifier("id")} = ${args.id}`];
      if (args.version !== undefined && args.incrementVersion) {
        whereParts.push(Prisma.sql`${quoteIdentifier("version")} = ${args.version}`);
      }
      if (args.filterDeletedAt) {
        whereParts.push(Prisma.sql`${quoteIdentifier("deletedAt")} IS NULL`);
      }

      const [row] = await client.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      UPDATE ${quoteIdentifier(args.tableName)}
      SET ${Prisma.join(assignments, ", ")}
      WHERE ${Prisma.join(whereParts, " AND ")}
      RETURNING ${Prisma.join(args.returningColumns.map((column) => quoteIdentifier(column)))}
    `);

      return row ?? null;
    },

    async deleteRow(args: DeleteGenericRuntimeRowArgs) {
      if (args.softDelete) {
        const assignments = [Prisma.sql`${quoteIdentifier("deletedAt")} = ${new Date()}`];
        if (args.incrementVersion) {
          assignments.push(
            Prisma.sql`${quoteIdentifier("version")} = ${quoteIdentifier("version")} + 1`,
          );
        }
        const rows = await client.$queryRaw<Array<{ id: string }>>(Prisma.sql`
          UPDATE ${quoteIdentifier(args.tableName)}
          SET ${Prisma.join(assignments, ", ")}
          WHERE ${quoteIdentifier("id")} = ${args.id}
            AND ${quoteIdentifier("deletedAt")} IS NULL
          RETURNING ${quoteIdentifier("id")}
        `);
        return rows.length > 0;
      }

      const rows = await client.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        DELETE FROM ${quoteIdentifier(args.tableName)}
        WHERE ${quoteIdentifier("id")} = ${args.id}
        RETURNING ${quoteIdentifier("id")}
      `);
      return rows.length > 0;
    },

    transaction,
  };
}

function createTransactionRepository(client: RuntimePrismaClient): BuilderGenericRuntimeRepository {
  let repository: BuilderGenericRuntimeRepository;
  repository = createGenericRuntimeRepository(client, (run) => run(repository));
  return repository;
}

export const genericRuntimeRepository: BuilderGenericRuntimeRepository =
  createGenericRuntimeRepository(prisma, (run) =>
    prisma.$transaction((tx) => run(createTransactionRepository(tx))),
  );
