// database/Database.ts
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

export class Database {
  private static dbInstance: SQLite.SQLiteDatabase;

  public static getConnection(): SQLite.SQLiteDatabase {
    if (Platform.OS === "web") {
      throw new Error("[Database] SQLite não é suportado no ambiente web.");
    }

    if (!this.dbInstance) {
      this.dbInstance = SQLite.openDatabaseSync("user_data.db");
      console.log(" Conexão com banco SQLite criada.");
    }

    return this.dbInstance;
  }
}
