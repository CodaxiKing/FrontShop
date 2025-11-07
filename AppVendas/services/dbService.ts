// services/dbService.ts
import { Database } from "@/database/Database";
import { SQLiteDatabase } from "expo-sqlite";

export const getDb = (): SQLiteDatabase => {
  return Database.getConnection();
};

export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDb();

  const startTime = Date.now();
  try {
    const result = await db.getAllAsync<T>(sql, params);

    const endTime = Date.now();
    const duration = endTime - startTime;
    //console.warn(`[PARAMS] → [${JSON.stringify(params)}]:[QUERY-START] → ${new Date(startTime).toISOString()} [QUERY-END] → ${new Date(endTime).toISOString()} | Duration: ${duration} ms`);
    //console.warn(`[QUERY-COMMAND] → [${sql}]`);    
    return result;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`[QUERY-ERROR] → ${new Date(endTime).toISOString()} | Duration: ${duration} ms`);
    console.error(error);
    throw error;
  }
}
