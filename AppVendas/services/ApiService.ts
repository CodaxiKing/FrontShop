// src/services/ApiService.ts

import { ProdutoImagemRepository } from "@/repositories/ProdutoImagemRepository";
import { ImageStorage } from "@/core/infra/ImageStorage";
import { ImageService } from "@/services/ImageService";
import { createCatalogoIndexes } from "@/database/queries/createCatalogoIndexes";
import { createTabelaPrecoProdutoIndexes } from "@/database/queries/createTabelaPrecoProdutoIndexes";

import {
  createCarteiraClienteTable,
  dropCarteiraClienteTable,
  insertCarteiraClienteData,
} from "@/context/queries/carteiraClienteQueries";
import * as SQLite from "expo-sqlite";
import { CarteiraClienteResponse } from "@/context/interfaces/CarteiraClienteItem";
import {
  selectControleIntegracaoData,
  updateControleIntegracaoData,
} from "@/context/queries/controleIntegracaoQueries";
import { E_CONTROLE_INTEGRACAO } from "@/constants/ControleIntegracaoConfig";
import apiClient from "@/client/apiClient";
import {
  CatalogoItem,
  CatalogoItemResponse,
} from "@/context/interfaces/CatalogoItem";
import {
  createCatalogoTable,
  dropCatalogoData,
  insertCatalogoData,
} from "@/context/queries/catalogoQueries";
import {
  createBandejaTable,
  dropBandejaData,
  insertBandejaData,
} from "@/context/queries/bandejaQueries";
import { BandejaItem, BandejaResponse } from "@/context/interfaces/BandejaItem";
import {
  createPedidoTable,
  dropPedidoData,
  insertPedidoData,
} from "@/context/queries/pedidoQueries";
import { PedidoItem } from "@/context/interfaces/PedidoItem";
import {
  RepresentanteItem,
  RepresentanteResponse,
} from "@/context/interfaces/RepresentanteItem";
import {
  createRepresentanteTable,
  dropRepresentanteData,
  insertRepresentanteData,
} from "@/context/queries/representanteQueries";
import { BandejaProdutoItem } from "@/context/interfaces/BandejaProdutoItem";
import {
  createBandejaProdutoTable,
  dropBandejaProdutoData,
  insertBandejaProdutoData,
} from "@/context/queries/bandejaProdutoQueries";
import {
  createBandejaVendedorTable,
  dropBandejaVendedorData,
  insertBandejaVendedorData,
} from "@/context/queries/bandejaVendedorQueries";
import {
  BandejaVendedorItem,
  BandejaVendedorResponse,
} from "@/context/interfaces/BandejaVendedorItem";
import {
  createBandejaVendedorProdutoTable,
  dropBandejaVendedorProdutoData,
  insertBandejaVendedorProdutoData,
} from "@/context/queries/bandejaVendedorProdutoQueries";
import {
  BandejaVendedorProdutoItem,
  BandejaVendedorProdutoResponse,
} from "@/context/interfaces/BandejaVendedorProdutoItem";
import {
  createFreteTable,
  dropFreteTable,
  insertFreteData,
} from "@/context/queries/freteQueries";
import { Frete } from "../types/types";
import { FreteItem, FreteResponse } from "@/context/interfaces/FreteItem";
import {
  createPagamentoClienteTable,
  dropPagamentoClienteData,
  insertPagamentoClienteData,
} from "@/context/queries/pagamentoClienteQueries";
import { PagamentoClienteItem } from "@/context/interfaces/PagamentoClienteItem";
import {
  ITabelaPrecoProduto,
  ITabelaPrecoProdutoResponse,
} from "@/context/interfaces/TabelaPrecoProdutoItem";
import {
  createTabelaPrecoProdutoTable,
  dropTabelaPrecoProdutoTable,
  insertTabelaPrecoProdutoData,
} from "@/context/queries/tabelaPrecoProdutoQueries";
import {
  createQuemComprouClienteTable,
  dropQuemComprouClienteData,
  insertQuemComprouClienteData,
} from "@/context/queries/quemComprouClienteQueries";
import {
  QuemComprouClienteItem,
  QuemComprouClienteResponse,
} from "@/context/interfaces/QuemComprouClientetem";
import {
  createExpositorTable,
  dropExpositorData,
  insertExpositorData,
} from "@/context/queries/expositorQueries";
import {
  ExpositorItem,
  ExpositorResponse,
} from "@/context/interfaces/ExpositorItem";
import {
  createPagamentoTable,
  dropPagamentoData,
  insertPagamentoData,
} from "@/context/queries/pagamentoQueries";
import {
  PagamentoItem,
  PagamentoResponse,
} from "@/context/interfaces/PagamentoItem";
import {
  createPedidoMinimoTable,
  dropPedidoMinimoTable,
  insertPedidoMinimoData,
} from "@/context/queries/pedidoMinimoQueries";
import {
  IPedidoMinimo,
  IPedidoMinimoResponse,
} from "@/context/interfaces/PedidoMinimoItem";
import {
  createHistoricoCompraClienteTable,
  dropHistoricoCompraClienteData,
  insertHistoricoCompraClienteData,
} from "@/context/queries/historicoCompraClienteQueries";
import {
  HistoricoCompraClienteItem,
  HistoricoCompraClienteResponse,
} from "@/context/interfaces/HistoricoCompraClienteItem";
import {
  createPedidoSincronizadoTable,
  dropPedidoSincronizadoData,
  insertPedidoSincronizadoData,
} from "@/context/queries/pedidoSincronizadoQueries";
import {
  PedidoSincronizadoItem,
  PedidoSincronizadoResponse,
} from "@/context/interfaces/PedidoSincronizadoItem";
import { CONFIGS } from "@/constants/Configs";
import { formatDuration } from "@/utils/formatDuration";

// Inicialize o banco de dados, caso não esteja configurado
const db = SQLite.openDatabaseSync("user_data.db");

const normalizeItem = (item: any, defaultValue: any = "") => {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key,
      value === null || value === undefined ? defaultValue : value,
    ])
  );
};

// Função que busca clientes
export const fetchAllClientes = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalClientes = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='CarteiraCliente';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM CarteiraCliente;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0;
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync);

  await db.runAsync(dropCarteiraClienteTable, []);
  console.log("Tabela Cliente deletada.");

  const fetchClientes = async () => {
    try {
      const response = await apiClient.get("/api/carteiracliente", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar clientes.");
        return { total: 0, synced: 0 };
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar carteira de clientes:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveCarteiraClienteData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalClientes += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalClientes, totalRegistros);

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalClientes / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalClientes} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchClientes();
      }

      return { total: totalClientes, synced: totalClientes };
    } catch (error) {
      console.error("Erro ao buscar carteira de clientes:", error);
      throw error;
    }
  };

  await fetchClientes();

  updateProgress?.(100);
  updateCounts?.(totalClientes, totalClientes);

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.CARTEIRA_CLIENTE,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Clientes]: ${formatDuration(durationMs)}`
  );
  return { total: totalClientes, synced: totalClientes };
};

const saveCarteiraClienteData = async (response: CarteiraClienteResponse) => {
  const clientes = response;
  const tableInfo = await db.getAllAsync(
    `PRAGMA table_info("CarteiraCliente");`
  );

  if (tableInfo.length === 0) {
    await db.execAsync(createCarteiraClienteTable);
    console.log("Tabela Cliente criada com sucesso.");
  }

  if (!Array.isArray(clientes)) {
    console.error("Erro: clientes não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of clientes) {
      const enderecosString = JSON.stringify(item.enderecos || []);
      const bloqueiosString = JSON.stringify(item.bloqueios || []);

      await db.runAsync(insertCarteiraClienteData, [
        item.clienteId || "",
        item.codigo || "",
        item.codigoFilial || "",
        item.cpfCnpj || "",
        item.cpfCnpjPai || "",
        item.codigoLoja || "",
        item.razaoSocial || "",
        item.nomeReduzido || "",
        item.tipoPessoa || "",
        item.tipo || "",
        item.codigoColigado || "",
        item.lojaPrincipal || "",
        item.pais || "",
        item.representanteId || "",
        item.tipologia || "",
        item.atraso || 0,
        item.tipoFrete || "",
        item.desconto || 0,
        item.saldo || 0,
        item.saldoDuplicatas || 0,
        item.risco || "",
        item.tituloPrestados || 0,
        item.limiteCredito || 0,
        item.limiteCreditoFinanceiro || 0,
        item.ddd || "",
        item.email || "",
        item.telefone || "",
        item.fax || "",
        item.contato || "",
        enderecosString,
        bloqueiosString,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados da carteira de clientes:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllBandejaData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalBandejas = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;
  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='Bandeja';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM Bandeja;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropBandejaData, []);
  console.log("Tabela Bandeja deletada.");

  const fetchBandeja = async () => {
    try {
      const response = await apiClient.get("/api/bandeja", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Bandejas.");
        return { total: 0, synced: 0 };
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar Bandejas:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveBandejaData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalBandejas += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalBandejas, totalRegistros);

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalBandejas / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalBandejas} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchBandeja();
      }

      return { total: totalBandejas, synced: totalBandejas };
    } catch (error) {
      console.error("Erro ao buscar Bandeja:", error);
      throw error;
    }
  };

  await fetchBandeja();

  // // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalBandejas, totalBandejas); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.BANDEJA,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Bandeja]: ${formatDuration(durationMs)}`
  );

  return { total: totalBandejas, synced: totalBandejas };
};

const saveBandejaData = async (response: BandejaResponse) => {
  const bandeja = response;
  const tableInfo = await db.getAllAsync(`PRAGMA table_info("Bandeja");`);

  if (tableInfo.length === 0) {
    await db.execAsync(createBandejaTable);
    console.log("Tabela Bandeja criada com sucesso.");
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  if (!Array.isArray(bandeja)) {
    console.error("Erro: 'Bandeja' não é um array válido.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of bandeja) {
      await db.runAsync(insertBandejaData, [
        item.codigo,
        item.codigoFilial,
        item.nome,
        item.dataInicio,
        item.usuarioInclusao,
        item.status,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Bandeja:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllBandejaProdutoData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalBandejaProduto = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='BandejaProduto';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM BandejaProduto;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync);

  await db.runAsync(dropBandejaProdutoData, []);
  console.log("Tabela Bandeja Produto deletada.");

  const fetchBandejaProduto = async () => {
    try {
      const response = await apiClient.get("/api/bandeja/produto", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Bandeja Produto.");
        return { total: 0, synced: 0 };
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar Bandeja Produto:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveBandejaProdutoData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalBandejaProduto += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalBandejaProduto, totalRegistros);

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalBandejaProduto / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalBandejaProduto} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchBandejaProduto();
      }

      return { total: totalBandejaProduto, synced: totalBandejaProduto };
    } catch (error) {
      console.error("Erro ao buscar Bandeja Produto:", error);
      throw error;
    }
  };

  await fetchBandejaProduto();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalBandejaProduto, totalBandejaProduto);

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.BANDEJA_PRODUTO,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Bandeja Produto]: ${formatDuration(
      durationMs
    )}`
  );

  return { total: totalBandejaProduto, synced: totalBandejaProduto };
};

const saveBandejaProdutoData = async (response: BandejaProdutoItem[]) => {
  const bandejaProduto = response;
  const tableInfo = await db.getAllAsync(
    `PRAGMA table_info("BandejaProduto");`
  );

  if (tableInfo.length === 0) {
    await db.execAsync(createBandejaProdutoTable);
    console.log("Tabela Bandeja Produto criada com sucesso.");
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  if (!Array.isArray(bandejaProduto)) {
    console.error("Erro: 'Bandeja Produto' não é um array válido.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of bandejaProduto) {
      await db.runAsync(insertBandejaProdutoData, [
        item.codigoProduto,
        item.codigoBandeja,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Bandeja Produto:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllBandejaVendedorData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalBandejaVendedor = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='BandejaVendedor';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM BandejaVendedor;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync);

  await db.runAsync(dropBandejaVendedorData, []);
  console.log("Tabela Bandeja Vendedor deletada.");

  const fetchBandejaVendedor = async () => {
    try {
      const response = await apiClient.get("/api/bandejavendedor", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Bandeja Vendedor.");
        return { total: 0, synced: 0 };
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar Bandeja Vendedor:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveBandejaVendedorData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalBandejaVendedor += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalBandejaVendedor, totalRegistros);

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalBandejaVendedor / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalBandejaVendedor} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchBandejaVendedor();
      }

      return { total: totalBandejaVendedor, synced: totalBandejaVendedor };
    } catch (error) {
      console.error("Erro ao buscar Bandeja Vendedor:", error);
      throw error;
    }
  };

  await fetchBandejaVendedor();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalBandejaVendedor, totalBandejaVendedor);

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.BANDEJA_VENDEDOR,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Bandeja Vendedor]: ${formatDuration(
      durationMs
    )}`
  );

  return { total: totalBandejaVendedor, synced: totalBandejaVendedor };
};

const saveBandejaVendedorData = async (response: BandejaVendedorResponse) => {
  const bandejaVendedor = response;
  const tableInfo = await db.getAllAsync(
    `PRAGMA table_info("BandejaVendedor");`
  );

  if (tableInfo.length === 0) {
    await db.execAsync(createBandejaVendedorTable);
    console.log("Tabela Bandeja Vendedor criada com sucesso.");
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  if (!Array.isArray(bandejaVendedor)) {
    console.error("Erro: 'Bandeja Vendedor' não é um array válido.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of bandejaVendedor) {
      await db.runAsync(insertBandejaVendedorData, [
        item.codigo,
        item.representanteId,
        item.nome,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");

    console.log("Dados de Bandeja Vendedor salvos com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar dados de Bandeja Vendedor:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllBandejaVendedorProdutoData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalBandejaVendedorProduto = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='BandejaVendedorProduto';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM BandejaVendedorProduto;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync);

  await db.runAsync(dropBandejaVendedorProdutoData, []);
  console.log("Tabela Bandeja Vendedor Produto deletada.");

  const fetchBandejaVendedorProduto = async () => {
    try {
      const response = await apiClient.get("/api/bandejavendedor/produto", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Bandeja Vendedor Produto.");
        return { total: 0, synced: 0 };
      }

      if (response.status < 200 || response.status >= 300) {
        console.error(
          "Erro ao buscar Bandeja Vendedor Produto:",
          response.data
        );
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveBandejaVendedorProdutoData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalBandejaVendedorProduto += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalBandejaVendedorProduto, totalRegistros);

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalBandejaVendedorProduto / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalBandejaVendedorProduto} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchBandejaVendedorProduto();
      }

      return {
        total: totalBandejaVendedorProduto,
        synced: totalBandejaVendedorProduto,
      };
    } catch (error) {
      console.error("Erro ao buscar Bandeja Vendedor Produto:", error);
      throw error;
    }
  };

  await fetchBandejaVendedorProduto();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalBandejaVendedorProduto, totalBandejaVendedorProduto);

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.BANDEJA_VENDEDOR_PRODUTO,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Bandeja Vendedor Produto]: ${formatDuration(
      durationMs
    )}`
  );

  return {
    total: totalBandejaVendedorProduto,
    synced: totalBandejaVendedorProduto,
  };
};

const saveBandejaVendedorProdutoData = async (
  response: BandejaVendedorProdutoResponse
) => {
  const bandejaVendedorProduto = response;
  const tableInfo = await db.getAllAsync(
    `PRAGMA table_info("BandejaVendedorProduto");`
  );

  if (tableInfo.length === 0) {
    await db.execAsync(createBandejaVendedorProdutoTable);
    console.log("Tabela Bandeja Vendedor Produto criada com sucesso.");
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  if (!Array.isArray(bandejaVendedorProduto)) {
    console.error("Erro: 'Bandeja Vendedor Produto' não é um array válido.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");
    for (const item of bandejaVendedorProduto) {
      await db.runAsync(insertBandejaVendedorProdutoData, [
        item.representanteId,
        item.codigoBandeja,
        item.codigoProduto,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");

    console.log("Dados de Bandeja Vendedor Produto salvos com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar dados de Bandeja Vendedor Produto:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllPedidosSincronizados = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalPedidosSincronizados = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // Checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='PedidoSincronizado';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM PedidoSincronizado;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropPedidoSincronizadoData, []); // Limpa a tabela antes de sincronizar

  const fetchPedidosSincronizados = async () => {
    try {
      const response = await apiClient.get("/api/pedido", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Pedido Sincronizado.");
        return { total: 0, synced: 0 }; // Retorno padrão
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar Pedido Sincronizado:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await savePedidoSincronizadoData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalPedidosSincronizados += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalPedidosSincronizados, totalRegistros);

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalPedidosSincronizados / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalPedidosSincronizados} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchPedidosSincronizados();
      }

      await db.runAsync(updateControleIntegracaoData, [
        E_CONTROLE_INTEGRACAO.PEDIDO,
      ]);

      return {
        total: totalPedidosSincronizados,
        synced: totalPedidosSincronizados,
      };
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      throw error;
    }
  };

  await fetchPedidosSincronizados(); // Executa as requisições de fetch

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalPedidosSincronizados, totalPedidosSincronizados);

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.PEDIDO,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Pedido]: ${formatDuration(durationMs)}`
  );

  return {
    total: totalPedidosSincronizados,
    synced: totalPedidosSincronizados,
  };
};

const savePedidoSincronizadoData = async (
  response: PedidoSincronizadoResponse
) => {
  const pedidosSincronizados = response;
  const tableInfo = await db.getAllAsync(
    `PRAGMA table_info("PedidoSincronizado");`
  );

  if (tableInfo.length === 0) {
    await db.execAsync(createPedidoSincronizadoTable);
    console.log("Tabela Pedido Sincronizado criada com sucesso.");
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  if (!Array.isArray(pedidosSincronizados)) {
    console.error("Erro: 'pedidosSincronizados' não é um array válido.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of pedidosSincronizados) {
      await db.runAsync(insertPedidoSincronizadoData, [
        item.codigoMobile,
        item.alterarEnderecoDeEntrega,
        item.bairroEntrega,
        item.cepEntrega,
        item.clienteId,
        item.complementoEntrega,
        item.dataPedidoSaldo,
        item.dataPrevistaPA,
        item.descricaoMotivoBonificacao,
        item.diasPrimeiroVencimento,
        item.enderecoEntrega,
        item.estadoEntrega,
        item.ganhadores,
        item.motivoBonificacao,
        item.municipioEntrega,
        item.numeroEntrega,
        item.numeroPedido,
        item.percentualDeDesconto,
        item.plataforma,
        item.quantidadeItens,
        item.quantidadePecas,
        item.quebraPreVenda,
        item.representanteCreateId,
        item.representanteId,
        item.tabelaDePrecoId,
        item.tipoLogradouroEntrega,
        item.tipoPedido,
        item.dataCriacao,
        item.dataSincronizacao,
        item.statusCodigo,
        item.statusDescricao,
        item.valorTotal,
        item.valorTotalComIPI,
        item.valorTotalDescontos,
        JSON.stringify(item.produtos), // JSON para armazenar lista
        JSON.stringify(item.meiosPagamento), // JSON para meios de pagamento
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de pedidosSincronizados:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllCatalogo = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  // limpar tabela + storage de imagens (carga limpa, sem merge)
  await ProdutoImagemRepository.ensureSchema();
  await ProdutoImagemRepository.resetAll();
  await ImageStorage.resetAll();

  let page = 1;
  let totalPages = 1;
  let totalCatalogo = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='Catalogo';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM Catalogo;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropCatalogoData, []);
  console.log("Tabela Catalogo dropada.");

  const fetchCatalogo = async () => {
    try {
      const response = await apiClient.get("/api/catalogo", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar catálogo.");
        return { total: 0, synced: 0 };
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar catálogo:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveCatalogoData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalCatalogo += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalCatalogo, totalRegistros); // Atualiza UI com os novos valores

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalCatalogo / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(`Página ${page}/${totalPages} | Total sincronizado: ${totalCatalogo} | ${progressPercent}%`);

      page++;

      if (page <= totalPages) {
        await fetchCatalogo();
      }          

      return { total: totalCatalogo, synced: totalCatalogo };
    } catch (error) {
      console.error("Erro ao buscar catálogo:", error);
      throw error;
    }
  };

  await fetchCatalogo();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalCatalogo, totalCatalogo); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [E_CONTROLE_INTEGRACAO.CATALOGO, ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(`Tempo total de sincronização [Catalogo]: ${formatDuration(durationMs)}`);

  // dispara em background; a UI depois cola na 2ª barra via eventBus
  ImageService.downloadAll({ batchSize: 100, concurrency: 4 , verbose: true})
  .catch((e) => console.warn("[IMG-SYNC] downloadAll error:", e));

  return { total: totalCatalogo, synced: totalCatalogo };
};

const saveCatalogoData = async (response: CatalogoItemResponse) => {
  const catalogo = response;
  const tableInfo = await db.getAllAsync(`PRAGMA table_info("Catalogo");`);

  if (tableInfo.length === 0) {
    await db.execAsync(createCatalogoTable);
    await db.execAsync(createCatalogoIndexes);
    console.log("Tabela Catalogo criada com sucesso.");
  }

  if (!Array.isArray(catalogo)) {
    console.error("Erro: clientes não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    // Lote de imagens desta página
    const imagensBatch: { codigoProduto: string; ordem: number; urlRemota: string }[] = [];

    for (const item of catalogo) {
      const normalizedItem = normalizeItem(item);

      await db.runAsync(insertCatalogoData, [
        normalizedItem.codigo,
        normalizedItem.tipoProduto,
        normalizedItem.nomeEcommerce,
        normalizedItem.filialMarca,
        normalizedItem.codigoMarca,
        normalizedItem.descricaoMarca,
        normalizedItem.garantia,
        normalizedItem.codigoBarra,
        normalizedItem.ncm,
        normalizedItem.precoUnitario,
        normalizedItem.precoUnitario, // precoUnitarioComIPI: é utilizado somente no envio para bff, o valor dele é igual ao precoUnitario pois não sofre alteração de IPI no processo de adição ao carrinho
        normalizedItem.precoComIPI,
        normalizedItem.descricaoComercial,
        normalizedItem.descricaoTecnica,
        normalizedItem.tamanhoCaixa,
        normalizedItem.peso,
        normalizedItem.fecho,
        normalizedItem.resistenciaAgua,
        normalizedItem.materialPulseira,
        normalizedItem.materialCaixa,
        normalizedItem.tipoFundo,
        normalizedItem.funcaoMecanismo,
        normalizedItem.filialSubGrupo,
        normalizedItem.codigoSubGrupo,
        normalizedItem.descricaoSubGrupo,
        normalizedItem.grupoSubGrupo,
        normalizedItem.filialLinha,
        normalizedItem.codigoLinha,
        normalizedItem.descricaoLinha,
        normalizedItem.subGrupoLinha,
        normalizedItem.display,
        normalizedItem.flagBestSeller,
        normalizedItem.flagComKit,
        normalizedItem.flagLancamento,
        normalizedItem.flagMonteSeuKit,
        normalizedItem.flagPreVenda,
        normalizedItem.genero,
        normalizedItem.nacionalImportado,
        normalizedItem.flagRetorno,
        normalizedItem.exclusividadeVendedor,
        normalizedItem.espessuraCaixa,
        normalizedItem.tamanhoPulseira,
        normalizedItem.quantidadeEstoquePA,
        normalizedItem.grupo,
        normalizedItem.corMostrador,
        normalizedItem.corPulseira,
        normalizedItem.precoPromo,
        normalizedItem.descontoPromo,
        normalizedItem.precoSemIPI,
        normalizedItem.dataPrevistaPA,
        normalizedItem.banho,
        normalizedItem.corCaixa,
        normalizedItem.ipi,
        normalizedItem.filialOrigem,
        normalizedItem.codigoOrigem,
        normalizedItem.descricaoOrigem,
        normalizedItem.filialSubLinha,
        normalizedItem.codigoSubLinha,
        normalizedItem.descricaoSubLinha,
        normalizedItem.linhaSubLinha,
        normalizedItem.filialTipoProduto,
        normalizedItem.codigoTipoProduto,
        normalizedItem.descricaoTipoProduto,
        JSON.stringify(normalizedItem.imagens || []),
        JSON.stringify(normalizedItem.sinalizadores || []),
        JSON.stringify(normalizedItem.codigoBarraFeiras || []),
      ]);

      // coletar urls de imagens mantendo a ordem do array (0 = principal)
      try {
        const raw = normalizedItem.imagens;
        const imgs = Array.isArray(raw) ? raw : (typeof raw === "string" ? JSON.parse(raw || "[]") : []);
        imgs.forEach((img: any, idx: number) => {
          const url = img?.imagemUrl ?? img?.url ?? (typeof img === "string" ? img : null);
          if (url) {
            imagensBatch.push({
              codigoProduto: normalizedItem.codigo,
              ordem: idx,
              urlRemota: String(url),
            });
          }
        });
      } catch {
        // se o JSON vier malformado, ignora silenciosamente
        console.error("[normalizedItem.imagens[L:1413]]: Coletar urls de imagens mantendo a ordem do array (0 = principal)");
      }
    }

    // Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");

    // Insere o batch desta página
    if (imagensBatch.length > 0) {
      await ProdutoImagemRepository.insertMany(imagensBatch);
    }

  } catch (error) {
    console.error("Erro ao salvar dados do catálogo:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllTabelaPrecoProdutoData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalTabelaPrecoProduto = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='TabelaPrecoProduto';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM TabelaPrecoProduto;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropTabelaPrecoProdutoTable, []);
  console.log("Tabela Preco Produto deletada.");

  const fetchTabelaPrecoProduto = async () => {
    try {
      const response = await apiClient.get("/api/tabelapreco/produto", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Tabela Produto.");
        return { total: 0, synced: 0 }; // Retorno padrão
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar Tabela Produto:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      console.log(`Bearer ${token}`);
     

      await saveTabelaPrecoProdutoData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalTabelaPrecoProduto += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalTabelaPrecoProduto, totalRegistros); // Atualiza UI com os novos valores

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalTabelaPrecoProduto / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalTabelaPrecoProduto} | ${progressPercent}%`
      );

      page++;

       

      if (page <= totalPages) {
        await fetchTabelaPrecoProduto();
      }

      return {
        total: totalTabelaPrecoProduto,
        synced: totalTabelaPrecoProduto,
      };
    } catch (error) {
      console.error("Erro ao buscar Tabela Preço Produto:", error);
      throw error;
    }
  };

  await fetchTabelaPrecoProduto();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalTabelaPrecoProduto, totalTabelaPrecoProduto); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.TABELA_PRECO_PRODUTO,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Tabela Preço Produto]: ${formatDuration(
      durationMs
    )}`
  );

  return { total: totalTabelaPrecoProduto, synced: totalTabelaPrecoProduto };
};

const saveTabelaPrecoProdutoData = async (
  response: ITabelaPrecoProdutoResponse
) => {
  const tabelaPrecoProduto = response;
  const tableInfo = await db.getAllAsync(
    `PRAGMA table_info("TabelaPrecoProduto");`
  );

  if (tableInfo.length === 0) {
    await db.execAsync(createTabelaPrecoProdutoTable);
    await db.execAsync(createTabelaPrecoProdutoIndexes);
    console.log("Tabela TabelaPrecoProduto criada com sucesso.");
  }

  if (!Array.isArray(tabelaPrecoProduto)) {
    console.error("Erro: clientes não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of tabelaPrecoProduto) {
      await db.runAsync(insertTabelaPrecoProdutoData, [
        item.codigo,
        item.prefixoReferencia,
        item.tipoProduto,
        item.nomeEcommerce,
        item.filialMarca,
        item.codigoMarca,
        item.descricaoMarca,
        item.garantia,
        item.codigoBarra,
        item.ncm,
        item.precoUnitario,
        item.precoUnitarioRelacaoEstoque,
        item.desconto,
        item.precoComIPI,
        item.descricaoComercial,
        item.tamanhoCaixa,
        item.peso,
        item.fecho,
        item.resistenciaAgua,
        item.materialPulseira,
        item.materialCaixa,
        item.tipoFundo,
        item.funcaoMecanismo,
        item.filialSubGrupo,
        item.codigoSubGrupo,
        item.descricaoSubGrupo,
        item.grupoSubGrupo,
        item.filialLinha,
        item.codigoLinha,
        item.descricaoLinha,
        item.subGrupoLinha,
        item.display,
        item.flagBestSeller,
        item.flagComKit,
        item.flagLancamento,
        item.flagMonteSeuKit,
        item.flagPreVenda,
        item.genero,
        item.nacionalImportado,
        item.flagRetorno,
        item.exclusividadeVendedor,
        item.espessuraCaixa,
        item.tamanhoPulseira,
        item.quantidadeEstoquePA,
        item.grupo,
        item.corMostrador,
        item.corPulseira,
        item.precoPromo,
        item.descontoPromo,
        item.precoSemIPI,
        item.dataPrevistaPA,
        item.banho,
        item.corCaixa,
        item.ipi,
        item.filialOrigem,
        item.codigoOrigem,
        item.descricaoOrigem,
        item.filialSubLinha,
        item.codigoSubLinha,
        item.descricaoSubLinha,
        item.linhaSubLinha,
        item.filialTipoProduto,
        item.codigoTipoProduto,
        item.descricaoTipoProduto,
        item.codigoTabelaPreco,
        item.filial,
        item.codigoItem,
        item.precoVenda,
        item.valorDesconto,
        item.percentualDesconto,
        item.ativo,
        item.frete,
        item.estado,
        item.tipoOperacao,
        item.quantidadeLote,
        item.indicadorLote,
        item.moeda,
        item.dataVigencia,
        item.referenciaGrade,
        item.precoMaximo,
        item.itemGrupo,
        item.dataUltimaMovimentacao,
        item.horaUltimaMovimentacao,
        item.dataExportacaoEC,
        item.sequenciaExportacaoEC,
        item.usuarioGeracaoInicial,
        item.usuarioGeracaoAtualizacao,
        item.mensagemExportacao,
        item.horaExportacao,
        item.envioEC,
        item.dataAlteracao,
        item.horaAlteracao,
        item.horaExportacaoFinal,
        item.tipoPreco,
        JSON.stringify(item.imagens || []),
        JSON.stringify(item.sinalizadores || []),
        JSON.stringify(item.codigoBarraFeiras || []),
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Tabela Preco Produto:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllRepresentanteData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalRepresentante = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='Representante';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM Representante;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropRepresentanteData, []);
  console.log("Tabela Representante deletada.");

  const fetchRepresentante = async () => {
    try {
      const response = await apiClient.get("/api/representante", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Representante.");
        return { total: 0, synced: 0 };
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar carteira de clientes:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveRepresentanteData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalRepresentante += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalRepresentante, totalRegistros); // Atualiza UI com os novos valores

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalRepresentante / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalRepresentante} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchRepresentante();
      }

      return { total: totalRepresentante, synced: totalRepresentante };
    } catch (error) {
      console.error("Erro ao buscar Representante:", error);
      throw error;
    }
  };

  await fetchRepresentante();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalRepresentante, totalRepresentante); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.REPRESENTANTE,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Representantes]: ${formatDuration(
      durationMs
    )}`
  );

  return { total: totalRepresentante, synced: totalRepresentante };
};

const saveRepresentanteData = async (response: RepresentanteResponse) => {
  const representante = response;
  const tableInfo = await db.getAllAsync(`PRAGMA table_info("Representante");`);

  if (tableInfo.length === 0) {
    await db.execAsync(createRepresentanteTable);
    console.log("Tabela Representante criada com sucesso.");
  }

  if (!Array.isArray(representante)) {
    console.error("Erro: Representantes não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of representante) {
      // Converte o campo tabelaPrecos para uma string JSON
      const tabelaPrecosJSON = JSON.stringify(item.tabelaPrecos || []);
      const bloqueiosJSON = JSON.stringify(item.bloqueios || []);

      await db.runAsync(insertRepresentanteData, [
        item.codigo,
        item.representanteId,
        item.codigoFilial || "",
        item.nome || "",
        item.nomeReduzido || "",
        item.endereco || "",
        item.bairro || "",
        item.cidade || "",
        item.estado || "",
        item.cep || "",
        item.telefone || "",
        item.fax || "",
        item.cpfCnpj || "",
        item.email || "",
        item.gerente || "",
        item.supervisor || "",
        item.diretor || "",
        item.codigoCentroCusto || "",
        item.codigoLoja || "",
        item.cargo || "",
        item.pais || "",
        item.telefoneCelular || "",
        item.filialRepresentanteGerente || "",
        item.filialRepresentanteCodigoFilial || "",
        item.filialRepresentanteCodigoFilialRepresentante || "",
        item.filialRepresentanteSigla || "",
        item.filialRepresentanteDescricao || "",
        item.filialRepresentantePercentualFixoRepasseMensal || 0,
        item.filialRepresentanteValorFixoRepasseMensal || 0,
        tabelaPrecosJSON,
        bloqueiosJSON,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Representante:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllFreteData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalFrete = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='Frete';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM Frete;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropFreteTable, []);
  console.log("Tabela Frete deletada.");

  const fetchFrete = async () => {
    try {
      const response = await apiClient.get("/api/frete", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Frete.");
        return { total: 0, synced: 0 }; // Retorno padrão
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar carteira de clientes:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveFreteData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalFrete += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalFrete, totalRegistros); // Atualiza UI com os novos valores

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalFrete / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalFrete} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchFrete();
      }

      return { total: totalFrete, synced: totalFrete };
    } catch (error) {
      console.error("Erro ao buscar Frete:", error);
      throw error;
    }
  };

  await fetchFrete();

  updateProgress?.(100);
  updateCounts?.(totalFrete, totalFrete); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.FRETE,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Frete]: ${formatDuration(durationMs)}`
  );

  return { total: totalFrete, synced: totalFrete };
};

const saveFreteData = async (response: FreteResponse) => {
  const frete = response;
  const tableInfo = await db.getAllAsync(`PRAGMA table_info("Frete");`);

  if (tableInfo.length === 0) {
    await db.execAsync(createFreteTable);
    console.log("Tabela Frete criada com sucesso.");
  }

  if (!Array.isArray(frete)) {
    console.error("Erro: Frete não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of frete) {
      await db.runAsync(insertFreteData, [
        item.codigoColigado,
        item.percentualFretePedidoMinimo,
        item.valorFrete,
        item.fretePadrao,
        item.valorFretePedidoMinimo,
        item.filialRepresentante,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Frete:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllPagamentoData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalPagamento = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='Pagamento';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM Pagamento;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropPagamentoData, []);
  console.log("Tabela Pagamento deletada.");

  const fetchPagamento = async () => {
    try {
      const response = await apiClient.get("/api/pagamento", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Pagamento.");
        return { total: 0, synced: 0 }; // Retorno padrão
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar Pagamento:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await savePagamentoData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalPagamento += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalPagamento, totalRegistros); // Atualiza UI com os novos valores

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalPagamento / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalPagamento} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchPagamento();
      }

      return { total: totalPagamento, synced: totalPagamento };
    } catch (error) {
      console.error("Erro ao buscar Pagamento:", error);
      throw error;
    }
  };

  await fetchPagamento();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalPagamento, totalPagamento); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.PAGAMENTO,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Pagamento]: ${formatDuration(durationMs)}`
  );

  return { total: totalPagamento, synced: totalPagamento };
};

const savePagamentoData = async (response: PagamentoResponse) => {
  const pagamento = response;
  const tableInfo = await db.getAllAsync(`PRAGMA table_info("Pagamento");`);

  if (tableInfo.length === 0) {
    await db.execAsync(createPagamentoTable);
    console.log("Tabela Pagamento criada com sucesso.");
  }

  if (!Array.isArray(pagamento)) {
    console.error("Erro: pagamento não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of pagamento) {
      await db.runAsync(insertPagamentoData, [
        item.filial,
        item.codigo,
        item.descricao,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Pagamento:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

// #TODO: NÃO REMOVER, SERÁ USADA NOVAMENTE EM BREVE
// export const fetchAllPagamentoClienteData = async (
//   token: string,
//   updateProgress?: (progress: number) => void
// ) => {
//   let requestCount = 0;
//   let nextid: string | null = null;
//   let totalPagamentoCliente = 0;
//   let progress = 0;
//   const progressIncrement = 0.6;

//   const resultSelectControle = await db.getFirstAsync(
//     selectControleIntegracaoData,
//     [E_CONTROLE_INTEGRACAO.PAGAMENTO_CLIENTE]
//   );

//   await db.runAsync(dropPagamentoClienteData, []);
//   console.log("Tabela Pagamento deletada.");

//   const fetchPagamentoCliente = async () => {
//     try {
//       requestCount++;
//       const response = await apiClient.get("/api/pagamento/cliente", {
//         headers: { Authorization: `Bearer ${token}` },
//         params: nextid ? { nextid } : {},
//       });

//       if (!response.data || !Array.isArray(response.data.itens)) {
//         console.error("Resposta inválida ao buscar Pagamento Cliente.");
//         return { total: 0, synced: 0 }; // Retorno padrão
//       }

//       await savePagamentoClienteData(response.data.itens);

//       totalPagamentoCliente += response.data.itens.length;
//       nextid = response.data.nextid || null;

//       // Incrementa o progresso e notifica o callback
//       progress = Math.min(progress + progressIncrement, 95); // Limita a 95% antes do ajuste final
//       updateProgress?.(progress);

//       console.log(`Requisição ${requestCount} concluída. | NextId: ${nextid}`);

//       if (nextid) {
//         await fetchPagamentoCliente();
//       }

//       // Ajusta o progresso para 100% ao final
//       updateProgress?.(100);

//       await db.runAsync(updateControleIntegracaoData, [
//         E_CONTROLE_INTEGRACAO.PAGAMENTO_CLIENTE,
//       ]);

//       return { total: totalPagamentoCliente, synced: totalPagamentoCliente };
//     } catch (error) {
//       console.error("Erro ao buscar PagamentoCliente:", error);
//       throw error;
//     }
//   };

//   await fetchPagamentoCliente();

//   await db.runAsync(updateControleIntegracaoData, [
//     E_CONTROLE_INTEGRACAO.PAGAMENTO_CLIENTE,
//   ]);

//   return { total: totalPagamentoCliente, synced: totalPagamentoCliente };
// };

// #TODO: NÃO REMOVER, SERÁ USADA NOVAMENTE EM BREVE
// const savePagamentoClienteData = async (
//   pagamentoCliente: PagamentoClienteItem[]
// ) => {
//   const tableInfo = await db.getAllAsync(
//     `PRAGMA table_info("PagamentoCliente");`
//   );

//   if (tableInfo.length === 0) {
//     await db.execAsync(createPagamentoClienteTable);
//     console.log("Tabela Pagamento Cliente criada com sucesso.");
//   }

//   try {
//     for (const item of pagamentoCliente) {
//       await db.runAsync(insertPagamentoClienteData, [
//         item.codigo,
//         item.codigoFilial,
//         item.cpfCnpj,
//         item.item,
//         item.codigoFormaPagamento,
//         item.descricao,
//         item.quantidadeParcelas,
//         item.prazoEntreParcelas,
//         item.diasParaPrimeiraParcela,
//       ]);
//     }

//     console.log("Dados de Pagamento Cliente salvos com sucesso.");
//   } catch (error) {
//     console.error("Erro ao salvar dados de Pagamento Cliente:", error);
//     throw error;
//   }
// };

export const fetchAllQuemComprouClienteData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalQuemComprouCliente = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='QuemComprouCliente';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM QuemComprouCliente;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropQuemComprouClienteData, []);
  console.log("Tabela Quem Comprou Cliente deletada.");

  const fetchQuemComprouCliente = async () => {
    try {
      const response = await apiClient.get("/api/quemcomproucliente", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Quem Comprou Cliente.");
        return { total: 0, synced: 0 }; // Retorno padrão
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar carteira de clientes:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveQuemComprouClienteData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalQuemComprouCliente += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalQuemComprouCliente, totalRegistros); // Atualiza UI com os novos valores

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalQuemComprouCliente / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalQuemComprouCliente} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchQuemComprouCliente();
      }

      return {
        total: totalQuemComprouCliente,
        synced: totalQuemComprouCliente,
      };
    } catch (error) {
      console.error("Erro ao buscar QuemComprouCliente:", error);
      throw error;
    }
  };

  await fetchQuemComprouCliente();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalQuemComprouCliente, totalQuemComprouCliente); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.QUEM_COMPROU_CLIENTE,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Quem Comprou Cliente]: ${formatDuration(
      durationMs
    )}`
  );

  return { total: totalQuemComprouCliente, synced: totalQuemComprouCliente };
};

const saveQuemComprouClienteData = async (
  response: QuemComprouClienteResponse
) => {
  const quemComprouCliente = response;
  const tableInfo = await db.getAllAsync(
    `PRAGMA table_info("QuemComprouCliente");`
  );

  if (tableInfo.length === 0) {
    await db.execAsync(createQuemComprouClienteTable);
    console.log("Tabela Quem Comprou Cliente criada com sucesso.");
  }

  if (!Array.isArray(quemComprouCliente)) {
    console.error("Erro: Quem Comprou Cliente não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of quemComprouCliente) {
      await db.runAsync(insertQuemComprouClienteData, [
        item.filial,
        item.cpfCnpj,
        item.codigoMarca,
        item.subGrupo,
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Quem Comprou Cliente:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllExpositorData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalExpositor = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='Expositor';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM Expositor;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropExpositorData, []);
  console.log("Tabela Expositor deletada.");

  const fetchExpositor = async () => {
    try {
      const response = await apiClient.get("/api/expositor", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Expositor.");
        return { total: 0, synced: 0 }; // Retorno padrão
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar Expositor:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveExpositorData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalExpositor += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalExpositor, totalRegistros); // Atualiza UI com os novos valores

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalExpositor / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalExpositor} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchExpositor();
      }

      return {
        total: totalExpositor,
        synced: totalExpositor,
      };
    } catch (error) {
      console.error("Erro ao buscar Expositor:", error);
      throw error;
    }
  };

  await fetchExpositor();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalExpositor, totalExpositor); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.QUEM_COMPROU_CLIENTE,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Expositor]: ${formatDuration(durationMs)}`
  );

  return { total: totalExpositor, synced: totalExpositor };
};

const saveExpositorData = async (response: ExpositorResponse) => {
  const expositor = response;
  const tableInfo = await db.getAllAsync(`PRAGMA table_info("Expositor");`);

  if (tableInfo.length === 0) {
    await db.execAsync(createExpositorTable);
    console.log("Tabela Expositor criada com sucesso.");
  }

  if (!Array.isArray(expositor)) {
    console.error("Erro: Expositor não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of expositor) {
      await db.runAsync(insertExpositorData, [
        item.codigo,
        item.nomeEcommerce,
        item.codigoBarra,
        item.peso,
        item.ncm,
        item.precoUnitario,
        item.ipi,
        item.saldo,
        item.filialMarca,
        item.codigoMarca,
        item.descricaoMarca,
        item.importMarca,
        JSON.stringify(item.imagens || []),
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Expositor:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllPedidoMinimoData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalPedidoMinimo = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='PedidoMinimo';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM PedidoMinimo;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropPedidoMinimoTable, []);
  console.log("Tabela Pedido Minimo deletada.");

  const fetchPedidoMinimo = async () => {
    try {
      const response = await apiClient.get("/api/pedidominimo", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Pedido Minimo.");
        return { total: 0, synced: 0 }; // Retorno padrão
      }

      if (response.status < 200 || response.status >= 300) {
        console.error("Erro ao buscar carteira de clientes:", response.data);
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await savePedidoMinimoData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalPedidoMinimo += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalPedidoMinimo, totalRegistros); // Atualiza UI com os novos valores

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalPedidoMinimo / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalPedidoMinimo} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchPedidoMinimo();
      }

      return {
        total: totalPedidoMinimo,
        synced: totalPedidoMinimo,
      };
    } catch (error) {
      console.error("Erro ao buscar Pedido Minimo:", error);
      throw error;
    }
  };

  await fetchPedidoMinimo();

  // Ajusta o progresso para 100% ao final
  updateProgress?.(100);
  updateCounts?.(totalPedidoMinimo, totalPedidoMinimo); // Atualiza UI com os novos valores

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.PEDIDO_MINIMO,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Pedido Minimo]: ${formatDuration(
      durationMs
    )}`
  );

  return { total: totalPedidoMinimo, synced: totalPedidoMinimo };
};

const savePedidoMinimoData = async (response: IPedidoMinimoResponse) => {
  const pedidoMinimo = response;
  const tableInfo = await db.getAllAsync(`PRAGMA table_info("PedidoMinimo");`);

  if (tableInfo.length === 0) {
    await db.execAsync(createPedidoMinimoTable);
    console.log("Tabela Pedido Minimo criada com sucesso.");
  }

  if (!Array.isArray(pedidoMinimo)) {
    console.error("Erro: Pedido Minimo não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of pedidoMinimo) {
      await db.runAsync(insertPedidoMinimoData, [
        item.filial,
        item.descricao,
        item.tipo,
        item.quantidadeMinima,
        item.verificarQuemComprouCliente,
        item.exposicao,
        item.diferenciaProduto,
        item.bloqueio,
        item.ordem,
        JSON.stringify(item.disney),
        JSON.stringify(item.marvel),
      ]);
    }

    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Pedido Minimo:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const fetchAllHistoricoCompraClienteData = async (
  token: string,
  updateProgress?: (progress: number) => void,
  updateCounts?: (synced: number, total: number) => void
) => {
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;
  let totalHistoricoCompraClientes = 0;
  let totalRegistros = 0;

  const pageSize = CONFIGS.REQUEST_PAGE_SIZE;

  // checa se a tabela existe no banco e se existir, pega a quantidade de registros
  const tableExists = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='HistoricoCompraCliente';`
  );

  let existingData = { count: 0 };

  if (tableExists) {
    existingData = (await db.getFirstAsync(
      "SELECT COUNT(*) AS count FROM HistoricoCompraCliente;"
    )) || { count: 0 };
  }

  const dataExistingBeforeSync = existingData.count ?? 0; // Quantidade inicial no banco
  updateCounts?.(dataExistingBeforeSync, dataExistingBeforeSync); // Atualiza a UI antes da sincronização começar

  await db.runAsync(dropHistoricoCompraClienteData, []);
  console.log("Tabela Historico Compra Cliente deletada.");

  const fetchHistoricoCompraCliente = async () => {
    try {
      const response = await apiClient.get("/api/historicocompracliente", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          pageSize,
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Resposta inválida ao buscar Historico Compra Cliente.");
        return { total: 0, synced: 0 }; // Retorno padrão
      }

      if (response.status < 200 || response.status >= 300) {
        console.error(
          "Erro ao buscar Historico Compra Cliente:",
          response.data
        );
        return { total: 0, synced: 0 };
      }

      const t0 = Date.now();

      await saveHistoricoCompraClienteData(response.data.data);

      const t1 = Date.now();
      console.log(`⏱️ Tempo por página: ${t1 - t0} ms`);

      totalHistoricoCompraClientes += response.data.data.length;
      totalPages = response.data.totalPages ?? totalPages;
      totalRegistros = response.data.totalRecords ?? totalRegistros;

      updateCounts?.(totalHistoricoCompraClientes, totalRegistros);

      // 🎯 Cálculo percentual real com precisão
      const progressPercent = Math.min(
        (totalHistoricoCompraClientes / totalRegistros) * 100,
        100
      ).toFixed(2); // 2 casas decimais

      updateProgress?.(parseFloat(progressPercent));

      console.log(
        `Página ${page}/${totalPages} | Total sincronizado: ${totalHistoricoCompraClientes} | ${progressPercent}%`
      );

      page++;

      if (page <= totalPages) {
        await fetchHistoricoCompraCliente();
      }

      return {
        total: totalHistoricoCompraClientes,
        synced: totalHistoricoCompraClientes,
      };
    } catch (error) {
      console.error("Erro ao buscar totalHistoricoCompraClientes:", error);
      throw error;
    }
  };

  await fetchHistoricoCompraCliente();

  updateProgress?.(100);
  updateCounts?.(totalHistoricoCompraClientes, totalHistoricoCompraClientes);

  await db.runAsync(updateControleIntegracaoData, [
    E_CONTROLE_INTEGRACAO.HISTORICO_COMPRA_CLIENTE,
  ]);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Helper para exibir tempo total de sincronização
  console.log(
    `🚩 Tempo total de sincronização [Historico Compra Cliente]: ${formatDuration(
      durationMs
    )}`
  );

  return {
    total: totalHistoricoCompraClientes,
    synced: totalHistoricoCompraClientes,
  };
};

const saveHistoricoCompraClienteData = async (
  response: HistoricoCompraClienteResponse
) => {
  const historicoCompraCliente = response;
  const tableInfo = await db.getAllAsync(
    `PRAGMA table_info("HistoricoCompraCliente");`
  );

  if (tableInfo.length === 0) {
    await db.execAsync(createHistoricoCompraClienteTable);
    console.log("Tabela Historico Compra Cliente criada com sucesso.");
  }

  if (!Array.isArray(historicoCompraCliente)) {
    console.error("Erro: historicoCompraCliente não é um array válido.");
    return;
  }

  if (!db) {
    console.error("Banco de dados não inicializado.");
    return;
  }

  try {
    // 🚀 Inicia uma transação explícita
    await db.runAsync("BEGIN TRANSACTION");

    for (const item of historicoCompraCliente) {
      await db.runAsync(insertHistoricoCompraClienteData, [
        item.filial,
        item.codigoCliente,
        item.loja,
        item.filialVenda,
        item.codigoProduto,
        item.dataProcessamento,
        item.dataVenda,
        item.quantidade,
        item.totalVenda,
        item.chaveSecundaria,
      ]);
    }
    // ✅ Finaliza a transação se tudo ocorreu bem
    await db.runAsync("COMMIT");
  } catch (error) {
    console.error("Erro ao salvar dados de Historico Compra Cliente:", error);
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

// Função para normalizar os produtos
const normalizeProdutos = (produtos: any): any[] => {
  let parsedProdutos: any[] = [];

  try {
    // Caso seja string, tenta converter
    if (typeof produtos === "string") {
      parsedProdutos = JSON.parse(produtos);
    } else if (Array.isArray(produtos)) {
      parsedProdutos = produtos;
    }
  } catch (error) {
    console.warn("Erro ao fazer parse de produtos:", error);
    return [];
  }

  return parsedProdutos.map((produto) => ({
    ...produto,
    imagem: typeof produto.imagem === "string" ? produto.imagem : "",
  }));
};

// Post para enviar os dados para o BFF
export const postPedidoData = async (token: string, pedidos: PedidoItem[]) => {
  if (!Array.isArray(pedidos)) {
    console.error("Erro: os pedidos devem ser um array.");
    return;
  }

  for (const pedido of pedidos) {
    try {
      const pedidoFormatado = {
        ...pedido,
        tabelaDePrecoId:
          typeof pedido.tabelaDePrecoId === "string"
            ? JSON.parse(pedido.tabelaDePrecoId)
            : pedido.tabelaDePrecoId,
        meiosPagamento:
          typeof pedido.meiosPagamento === "string"
            ? JSON.parse(pedido.meiosPagamento)
            : pedido.meiosPagamento,
        produtos: normalizeProdutos(pedido.produtos),
      };
      console.log("Pedido Antes de ser Enviado:", JSON.stringify(pedidoFormatado, null, 2));

      const response = await apiClient.post("/api/pedido", pedidoFormatado, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Pedido Enviado:", JSON.stringify(pedidoFormatado, null, 2));
      console.log(`Pedido ${pedido.id} enviado com sucesso.`);
      return response;
    } catch (error) {
      console.error(
        `Erro ao enviar o pedido ${pedido.id}:`,
        JSON.stringify(error)
      );
      throw error;
    }
  }
};
