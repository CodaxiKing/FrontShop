import { Database } from "@/database/Database";
import { CatalogoAuxQueries } from "@/database/queries/CatalogoAuxQueries";

export class CatalogoRepository {
  static async listarCodigoEImagens(): Promise<Array<{ codigo: string; imagens: string }>> {
    const db = Database.getConnection();
    return await db.getAllAsync(CatalogoAuxQueries.selectCodigoEImagens(), []);
  }

  static async count(): Promise<number> {
    const db = Database.getConnection();
    const row = await db.getFirstAsync(CatalogoAuxQueries.countAll(), []);
    return row?.total ?? 0;
  }
}
