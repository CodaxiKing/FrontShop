// services/ImageService.ts

import { ProdutoImagemRepository } from "@/repositories/ProdutoImagemRepository";
import { ProdutoRepository } from "@/repositories/ProdutoRepository";
import { ImageStorage } from "@/core/infra/ImageStorage";
import { eventBus } from "@/core/eventBus";

type DownloadOpts = { batchSize?: number; concurrency?: number; verbose?: boolean };

// habilita log automático em dev; para forçar em prod, passe { verbose: true }
const DEBUG_IMG = __DEV__;
const logImg = (...args: any[]) => {
  if (DEBUG_IMG) console.log("[img]", ...args);
};
const warnImg = (...args: any[]) => {
  if (DEBUG_IMG) console.warn("[img]", ...args);
};

export const ImageService = {
  /** Recria storage e tabela, e repovoa ProdutoImagem a partir do Catalogo local (JSON imagens). */
  async reindexFromCatalogLocal() {
    logImg("reindexFromCatalogLocal: resetando storage + tabela...");
    await ImageStorage.resetAll();
    // garante o schema antes de mexer
    await ProdutoImagemRepository.ensureSchema();
    await ProdutoImagemRepository.resetAll();

    const rows = await ProdutoRepository.listarCodigosEImagens();
    const batch: { codigoProduto: string; ordem: number; urlRemota: string }[] = [];

    for (const r of rows) {
      if (!r?.imagens) continue;
      let arr: Array<{ imagemUrl?: string }> = [];
      try { arr = JSON.parse(r.imagens) || []; } catch { arr = []; }
      arr.forEach((img, idx) => {
        if (img?.imagemUrl) {
          batch.push({
            codigoProduto: r.codigo,
            ordem: idx,
            urlRemota: img.imagemUrl,
          });
        }
      });
    }

    if (batch.length) {
      await ProdutoImagemRepository.insertMany(batch);
    }

    const counts = await ProdutoImagemRepository.counts(); // <= faltava await
    logImg("reindexFromCatalogLocal: ok", counts);
    return counts;
  },

  /** Baixa todas as pendentes em lotes, emitindo progresso para a segunda barra. */
  async downloadAll(opts: DownloadOpts = {}) {
    const batchSize   = opts.batchSize ?? 25;  // lotes menores deixam a UI mais fluida
    const concurrency = opts.concurrency ?? 1; // 1 evita o erro prepareAsync no SQLite
    const verbose     = !!opts.verbose;

    await ProdutoImagemRepository.ensureSchema();
    logImg(`downloadAll: init batchSize=${batchSize} concurrency=${concurrency} verbose=${verbose}`);

    // antes do pushProgress("start")
    const startCounts = await ProdutoImagemRepository.counts();
    if (startCounts.total > 0 && startCounts.ok === startCounts.total) {
      // nada a fazer: já está 100%
      eventBus.emit("sync:images:done", startCounts);
      return startCounts;
    }

    eventBus.emit("sync:images:start", {
      total: startCounts.total,
      ok: startCounts.ok,
      percent: startCounts.total ? Math.floor((startCounts.ok / startCounts.total) * 100) : 0,
    });

    const pushProgress = async (tag?: string) => {
      const c = await ProdutoImagemRepository.counts();
      if (tag) logImg(`progress(${tag}): ${c.ok}/${c.total} (${c.total ? Math.floor((c.ok / c.total) * 100) : 0}%)`);
      eventBus.emit("sync:images:progress", {
        total: c.total,
        ok: c.ok,
        percent: c.total ? Math.floor((c.ok / c.total) * 100) : 0,
      });
    };

    // Heartbeat: mesmo se um chunk demorar, a barra continua viva
    let hbActive = true;
    const hb = setInterval(() => { if (hbActive) pushProgress("hb"); }, 1500);

    await pushProgress("start");

    const worker = async (item: any) => {
      try {
        if (verbose) 
          logImg("DOWN ⬇️", `id=${item.id}`, `cod=${item.codigoProduto}`, `#${item.ordem}`, item.urlRemota);
        const local = await ImageStorage.download(item.urlRemota);
        await ProdutoImagemRepository.setOk(item.id, local);
        if (verbose) 
          logImg("OK   ✅", `id=${item.id}`, `local=${local}`);
      } catch (e) {
        try {
          await ProdutoImagemRepository.setFalha(item.id);
        } finally {
          warnImg("FAIL ❌", `id=${item.id}`, item.urlRemota, String(e));
        }
      }
    };

    try {
      let pend = await ProdutoImagemRepository.selectPendentes(batchSize);
      while (pend.length) {
        // processa em janelas de "concurrency"
        for (let i = 0; i < pend.length; i += concurrency) {
          await Promise.allSettled(pend.slice(i, i + concurrency).map(worker));
          // atualiza a cada chunk (não espera o lote inteiro)
          await pushProgress("chunk");
        }
        pend = await ProdutoImagemRepository.selectPendentes(batchSize);
      }

      await pushProgress("done");
      const doneCounts = await ProdutoImagemRepository.counts();
      eventBus.emit("sync:images:done", doneCounts);
      logImg("downloadAll: finished", doneCounts);
      return doneCounts;
    } finally {
      hbActive = false;
      clearInterval(hb);
    }
  },

  /** Atalho para o card “Só imagens”: reindexa e baixa. */
  async reindexAndDownload(opts?: DownloadOpts) {
    logImg("reindexAndDownload: start");
    await this.reindexFromCatalogLocal();
    const r = await this.downloadAll(opts);
    logImg("reindexAndDownload: done", r);
    return r;
  },
};
