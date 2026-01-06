/**
 * Path: src/repositories/HistoricoComprasCacheRepository.ts
 * Propósito: encapsular o acesso às queries da TEMP de "já comprou".
 */

import { executeQuery } from "@/services/dbService";
import {
  queryCreateTempCompras,
  queryCreateIndexTempCompras,
  queryClearTempCompras,
  queryPopulateTempCompras,
  queryCountTempCompras,
  queryListAllTempCompras,
  queryDetectHistoricoTable,
  buildQueryPopulateTempComprasFor,
} from "@/database/queries/historicoComprasCacheQueries";

let _historicoDetectedName: string | null = null;

async function detectHistoricoTable(): Promise<string | null> {
  if (_historicoDetectedName) return _historicoDetectedName;
  try {
    const rows: Array<{ name: string }> = await executeQuery(
      queryDetectHistoricoTable,
      []
    );
    _historicoDetectedName = rows?.[0]?.name ? String(rows[0].name) : null;
  } catch (e) {
    console.warn("[TEMP compras] falha ao detectar tabela de histórico:", e);
    _historicoDetectedName = null;
  }
  return _historicoDetectedName;
}

export const HistoricoComprasCacheRepository = {
  async ensureTemp() {
    await executeQuery(queryCreateTempCompras, []);
    await executeQuery(queryCreateIndexTempCompras, []); // ok ser redundante
  },

  async clear() {
    await this.ensureTemp();
    await executeQuery(queryClearTempCompras, []);
  },

  async populateForCliente(codigoCliente: string) {
    await this.ensureTemp();
    await executeQuery(queryClearTempCompras, []);
    if (!codigoCliente?.trim()) return;

    // tenta detectar qual tabela de histórico existe
    const detected = await detectHistoricoTable();

    if (detected && detected !== "HistoricoCompraCliente") {
      // usa populate dinâmico para HistoricoCompraClienteItem (ou o que houver)
      const sql = buildQueryPopulateTempComprasFor(detected);
      await executeQuery(sql, [codigoCliente]);
    } else {
      // fallback (mantém compat com sua versão original)
      await executeQuery(queryPopulateTempCompras, [codigoCliente]);
    }
  },

  async count(): Promise<number> {
    const rows: Array<{ n: number }> = await executeQuery(
      queryCountTempCompras,
      []
    );
    return Number(rows?.[0]?.n ?? 0);
  },

  // para hooks (useJaComprouTemp...)
  async listAllCodes(): Promise<string[]> {
    const rows: Array<{ codigoBase: string }> = await executeQuery(
      queryListAllTempCompras,
      []
    );
    return rows.map((r) => String(r.codigoBase));
  },
};
