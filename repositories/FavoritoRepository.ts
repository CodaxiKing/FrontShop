// repositories/FavoritoRepository.ts
import { executeQuery } from "@/services/dbService";
import {
  queryCreateFavoritosTable,
  queryAddFavorito,
  queryRemoveFavorito,
  queryIsFavorito,
  buildQueryFavoritosMapIn,
} from "@/database/queries/favoritoQueries";

export const FavoritoRepository = {
  async ensureSchema() {
    // alguns drivers não aceitam batch separado por ;, então execute em partes se preciso
    const parts = queryCreateFavoritosTable.split(";").map(s => s.trim()).filter(Boolean);
    for (const stmt of parts) await executeQuery(stmt);
  },

  async add(produtoId: string, cpfCnpj: string, clienteId: string, representanteId: string) {
    await executeQuery(queryAddFavorito, [produtoId, cpfCnpj, clienteId, representanteId]);
  },

  async remove(produtoId: string, cpfCnpj: string, clienteId: string, representanteId: string) {
    await executeQuery(queryRemoveFavorito, [produtoId, cpfCnpj, clienteId, representanteId]);
  },

  async exists(produtoId: string, cpfCnpj: string, clienteId: string, representanteId: string) {
    const rows = await executeQuery<any>(queryIsFavorito, [produtoId, cpfCnpj, clienteId, representanteId]);
    return rows && rows.length > 0;
  },

  async mapForList(
    produtoIds: (string|number)[],
    cpfCnpj: string,
    clienteId: string,
    representanteId: string
  ): Promise<Record<string, boolean>> {
    if (!produtoIds.length) return {};
    const sql = buildQueryFavoritosMapIn(produtoIds.length);
    const params = [cpfCnpj, clienteId, representanteId, ...produtoIds.map(String)];
    const rows = await executeQuery<any>(sql, params);
    const map: Record<string, boolean> = {};
    rows.forEach((r: any) => { map[String(r.produtoId)] = true; });
    return map;
  },
};
