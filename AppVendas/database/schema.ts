import { SQLiteDatabase } from "expo-sqlite";
import { createCarteiraClienteTable } from "./queries/clienteQueries";

const migrations = [
  {
    version: 1,
    queries: [
      createCarteiraClienteTable
    ],
  },
];

export async function applyMigrations(db: SQLiteDatabase): Promise<void> {
  const [res] = await db.getAllAsync("PRAGMA user_version;");
  const currentVersion = res?.user_version || 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      await db.transactionAsync(async (tx) => {
        for (const query of migration.queries) {
          await tx.executeSqlAsync(query);
        }
      });
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    }
  }
}
