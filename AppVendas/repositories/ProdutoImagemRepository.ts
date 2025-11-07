import { Database } from "@/database/Database";
import { ProdutoImagemQueries, viewProdutoImagemPrincipalLocal } from "@/database/queries/ProdutoImagemQueries";

type InsertItem = { codigoProduto: string; ordem: number; urlRemota: string };

export class ProdutoImagemRepository {
  static async ensureSchema() {
    const db = Database.getConnection();
    await db.execAsync(ProdutoImagemQueries.createTable());
    await db.execAsync(ProdutoImagemQueries.createIndexes());
    // cria/atualiza a VIEW usada pelos selects do catálogo
    await db.execAsync(viewProdutoImagemPrincipalLocal);
  }  

  static async resetAll() {
    await this.ensureSchema();
    const db = Database.getConnection();
    await db.execAsync(ProdutoImagemQueries.createTable());
    await db.execAsync(ProdutoImagemQueries.deleteAll());
  }

  static async insertMany(items: InsertItem[]) {
    if (!items.length) return;
    const db = Database.getConnection();
    const sql = ProdutoImagemQueries.insertMany(items.length);
    const params: any[] = [];
    for (const it of items) {
      params.push(it.codigoProduto, it.ordem, it.urlRemota);
    }
    await db.runAsync(sql, params);
  }

  static async selectPendentes(limit = 100) {
    const db = Database.getConnection();
    const sql = ProdutoImagemQueries.selectPendentes(limit);
    return await db.getAllAsync<any>(sql, []);
  }

  static async setOk(id: number, pathLocal: string) {
    const db = Database.getConnection();
    await db.runAsync(ProdutoImagemQueries.setPathOk(), [pathLocal, id]);
  }

  static async setFalha(id: number) {
    const db = Database.getConnection();
    await db.runAsync(ProdutoImagemQueries.setStatus(), ["FALHA", id]);
  }

  static async counts() {
    const db = Database.getConnection();
    const total = (await db.getFirstAsync<any>(ProdutoImagemQueries.countAll(), []))?.total ?? 0;
    const ok    = (await db.getFirstAsync<any>(ProdutoImagemQueries.countOk(), []))?.ok ?? 0;
    return { total, ok, pendentes: total - ok };
  }
  
}
