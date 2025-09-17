/**
 * Path: src/services/HistoricoComprasCacheService.ts
 * Propósito: orquestrar a TEMP _ComprasClienteAtual para o cliente ativo.
 * 
 */

import { HistoricoComprasCacheRepository as Repo } from "@/repositories/HistoricoComprasCacheRepository";

export const HistoricoComprasCacheService = {
  async ensureTempTable() {
    await Repo.ensureTemp();
     if (__DEV__) {
          console.log(`[ensureTempTable] Repo.ensureTemp()`);
      }
  },

  async clear() {
    await Repo.clear();
  },

  async populateForCliente(codigoCliente: string | number) {
    const cliente = String(codigoCliente ?? "").trim();
    await Repo.populateForCliente(cliente);
    if (__DEV__) {
      const n = await Repo.count();
      console.log(`[useJaComprouTemp] populateForCliente cliente=${cliente || "(vazio)"} carregados=${n}`);
    }
  },

  
};
