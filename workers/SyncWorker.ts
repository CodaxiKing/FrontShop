// src/workers/SyncWorker.ts
import {
  getBandejas,
  getCatalogo,
  getClientes,
  getPedido,
} from "@/services/ApiService";

// Aqui, poderíamos ter uma função que sincroniza todos os cards:
export async function syncAllData(accessToken: string) {
  const clientesPromise = getClientes(accessToken);
  const bandejaPromise = getBandejas(accessToken);
  const pedidoPromise = getPedido(accessToken);
  const catalogoPromise = getCatalogo(accessToken);

  // Retorna um array de Promises. No componente, você chamará Promise.all sobre isso.
  return [clientesPromise, bandejaPromise, pedidoPromise, catalogoPromise];
}
