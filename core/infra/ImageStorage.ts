// src/core/infra/ImageStorage.ts
import * as FileSystem from "expo-file-system";

const BASE_DIR = FileSystem.documentDirectory + "img/";

// Cache em memória: urlRemota -> caminho local
// Observação: só colocamos aqui quando tivermos certeza que o arquivo existe.
const memoryCache = new Map<string, string>();

// util simples de hash + extensão
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
function extFromUrl(url: string) {
  const m = url.split("?")[0].match(/\.(\w{1,8})$/i);
  return m ? "." + m[1].toLowerCase() : ".bin";
}

// timeout para evitar downloads que ficam pendurados
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout ${ms}ms @ ${label}`)), ms)
    ),
  ]) as Promise<T>;
}

export const ImageStorage = {
  async ensureBaseDir() {
    const info = await FileSystem.getInfoAsync(BASE_DIR);
    if (!info.exists)
      await FileSystem.makeDirectoryAsync(BASE_DIR, { intermediates: true });
  },

  async resetAll() {
    const info = await FileSystem.getInfoAsync(BASE_DIR);
    if (info.exists)
      await FileSystem.deleteAsync(BASE_DIR, { idempotent: true });
    await FileSystem.makeDirectoryAsync(BASE_DIR, { intermediates: true });
    memoryCache.clear();
  },

  buildLocalPath(urlRemota: string) {
    return BASE_DIR + hash(urlRemota) + extFromUrl(urlRemota);
  },

  /**
   * Retorna o caminho local se o arquivo já existir (NÃO baixa).
   * Usa cache em memória para fast-path; caso não tenha em cache,
   * confere no filesystem e atualiza o cache.
   */
  async getLocalIfExists(urlRemota: string): Promise<string | null> {
    if (!urlRemota) return null;

    // Fast-path: se já sabemos que existe, retorna direto
    const cached = memoryCache.get(urlRemota);
    if (cached) return cached;

    await this.ensureBaseDir();
    const dest = this.buildLocalPath(urlRemota);
    try {
      const info = await FileSystem.getInfoAsync(dest);
      if (info.exists) {
        memoryCache.set(urlRemota, dest);
        return dest;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Conveniência: tenta reaproveitar o arquivo local; se não houver, baixa.
   * Útil quando queremos garantir o arquivo pronto para uso.
   */
  async getPathOrDownload(urlRemota: string): Promise<string> {
    const local = await this.getLocalIfExists(urlRemota);
    if (local) return local;
    return this.download(urlRemota);
  },

  async download(urlRemota: string): Promise<string> {
    if (!urlRemota) throw new Error("urlRemota vazia");
    await this.ensureBaseDir();
    const dest = this.buildLocalPath(urlRemota);

    // cache-hit em memória → confiança de que existe em disco
    const cached = memoryCache.get(urlRemota);
    if (cached) return cached;

    // cache-hit em disco (sem baixar de novo)
    try {
      const info = await FileSystem.getInfoAsync(dest);
      if (info.exists) {
        memoryCache.set(urlRemota, dest);
        // console.log("[img:fs] cache-hit", { dest, bytes: info.size ?? "?" });
        return dest;
      }
    } catch {
      // segue para download
    }

    try {
      const t0 = Date.now();
      // console.log("[img:fs] downloading", { url: urlRemota, to: dest });

      // timeout de 30s protege contra travas de rede
      const { uri, status } = await withTimeout(
        FileSystem.downloadAsync(urlRemota, dest),
        30_000,
        urlRemota
      );

      const dt = Date.now() - t0;
      // console.log("[img:fs] downloaded", { status, ms: dt, from: urlRemota, to: uri });

      if (status >= 200 && status < 300) {
        const saved = await FileSystem.getInfoAsync(uri);
        // console.log("[img:fs] saved", { uri, bytes: saved.size ?? "?" });
        memoryCache.set(urlRemota, uri);
        return uri;
      }

      throw new Error(`HTTP ${status} ao baixar imagem`);
    } catch (e) {
      console.warn("[img:fs] fail", { url: urlRemota, dest, err: String(e) });
      throw e;
    }
  },
};
