import { HistoricoComprasCacheRepository as Repo } from "@/repositories/HistoricoComprasCacheRepository";

let _populateInFlight = false;
let _lastCliente: string | null = null;
const _norm = (v: string | number | null | undefined) => String(v ?? "").trim();

export const HistoricoComprasCacheService = {
  async ensureTempTable() {
    await Repo.ensureTemp();
  },

  async clear() {
    await Repo.clear();
    _lastCliente = null;
  },

  async populateForCliente(codigoCliente: string | number, opts?: { force?: boolean }) {
    const cliente = _norm(codigoCliente);
    if (!cliente) return;

    // Evita repopular se o cliente não mudou (a menos que force=true)
    if (!opts?.force && _lastCliente === cliente) {
      if (__DEV__) console.log(`[Cache Já Comprou] skip populate (cliente não mudou): ${cliente}`);
      return;
    }

    // Mutex simples: evita rodar duas populações em paralelo
    if (_populateInFlight) {
      if (__DEV__) console.log(`[Cache Já Comprou] populate em andamento — ignorando chamada: ${cliente}`);
      return;
    }

    _populateInFlight = true;
    try {
      await Repo.populateForCliente(cliente);
      if (__DEV__) {
        const n = await Repo.count();
        console.log(`[Cache Já Comprou] cliente=${cliente} carregados=${n}`);
      }
      _lastCliente = cliente;
    } finally {
      _populateInFlight = false;
    }
  },
};
