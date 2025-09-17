// src/hooks/useSync.ts
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchAllBandejaData,
  fetchAllBandejaProdutoData,
  fetchAllBandejaVendedorData,
  fetchAllBandejaVendedorProdutoData,
  fetchAllCatalogo,
  fetchAllClientes,
  fetchAllExpositorData,
  fetchAllFreteData,
  fetchAllHistoricoCompraClienteData,
  // fetchAllPagamentoClienteData,
  fetchAllPagamentoData,
  fetchAllPedidoMinimoData,
  fetchAllPedidosSincronizados,
  fetchAllQuemComprouClienteData,
  fetchAllRepresentanteData,
  fetchAllTabelaPrecoProdutoData,
} from "@/services/ApiService";
import { formatTime } from "../utils/formatTime"; // Uma função utilitária para formatar hora
import { useTopContext } from "@/context/TopContext";

import * as SQLite from "expo-sqlite";

import { ImageService } from "@/services/ImageService";
import { ProdutoImagemRepository } from "@/repositories/ProdutoImagemRepository";
import { eventBus } from "@/core/eventBus";

export interface SyncCardData {
  title: string;
  icon: React.ReactNode;
  currentValue: number;
  totalValue: number;
  status: string;
  lastSync: string;
  endpoint: string;
  progress: number;
  isLoading: boolean;
}

const LAST_SYNC_STORAGE_KEY = "@AppVendas:lastSyncTime";

// Confirmação async para Alert
const confirmAsync = (title: string, message: string): Promise<boolean> =>
  new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });

export function useSync(initialCards: SyncCardData[]) {
  const { incrementPendingSync, decrementPendingSync } = useTopContext();
  const [cards, setCards] = useState<SyncCardData[]>(initialCards);
  const [lastSyncTime, setLastSyncTime] = useState<string>("-");
  const [nextSyncTime, setNextSyncTime] = useState<string>("14:00");

  const [isSingleCardSyncing, setIsSingleCardSyncing] = useState(false);
  const db = SQLite.openDatabaseSync("user_data.db");

  // Carregar o último horário de sincronização do AsyncStorage
  useEffect(() => {
    const loadLastSyncTime = async () => {
      try {
        const storedLastSyncTime = await AsyncStorage.getItem(
          LAST_SYNC_STORAGE_KEY
        );
        if (storedLastSyncTime) {
          setLastSyncTime(storedLastSyncTime);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar o último horário de sincronização:",
          error
        );
      }
    };

    loadLastSyncTime();
  }, []);

  // Atualizar a quantidade ao carregar a tela
  useEffect(() => {
    const loadInitialCounts = async () => {
      const updatedCards = await Promise.all(
        cards.map(async (card) => {
          // Card de IMAGENS: usa counts() (ok/total) do repositório
          if (card.endpoint === "/internal/images") {
            const { ok, total } = await ProdutoImagemRepository.counts();
            return {
              ...card,
              currentValue: ok,
              totalValue: total,
              status:
                total > 0 && ok === total ? "Imagens Atualizadas" : card.status,
            };
          }

          // Demais cards: mantém o comportamento atual (COUNT da tabela)
          const tableName = getTableNameFromEndpoint(card.endpoint);
          const count = await getTableRowCount(tableName);
          return { ...card, currentValue: count, totalValue: count };
        })
      );
      setCards(updatedCards);
    };

    loadInitialCounts();
  }, []);

  const getTableNameFromEndpoint = (endpoint: string): string => {
    const tableMap: Record<string, string> = {
      "/api/carteiracliente": "CarteiraCliente",
      "/api/bandeja": "Bandeja",
      "/api/bandeja/produto": "BandejaProduto",
      "/api/bandejavendedor": "BandejaVendedor",
      "/api/bandejavendedor/produto": "BandejaVendedorProduto",
      "/api/pedido": "PedidoSincronizado",
      "/api/catalogo": "Catalogo",
      "/api/tabelapreco/produto": "TabelaPrecoProduto",
      "/api/representante": "Representante",
      "/api/frete": "Frete",
      "/api/pagamento": "Pagamento",
      "/api/quemcomproucliente": "QuemComprouCliente",
      "/api/expositor": "Expositor",
      "/api/pedidominimo": "PedidoMinimo",
      "/api/historicocompracliente": "HistoricoCompraCliente",
      // >>> Novo para Download de Imagem <<<
      "/internal/images": "ProdutoImagem",
    };

    return tableMap[endpoint] || "";
  };

  // Atualizar o lastSyncTime no AsyncStorage
  const updateLastSyncTime = async () => {
    try {
      const now = new Date();
      const formattedTime = `Hoje às ${formatTime(now)}`;
      setLastSyncTime(formattedTime);
      await AsyncStorage.setItem(LAST_SYNC_STORAGE_KEY, formattedTime);
    } catch (error) {
      console.error("Erro ao salvar o último horário de sincronização:", error);
    }
  };

  const getTableRowCount = async (tableName: string): Promise<number> => {
    try {
      // Verifica se a tabela existe antes de tentar contar os registros
      const tableExists = await db.getFirstAsync(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
        [tableName]
      );

      if (!tableExists) return 0; // Se a tabela não existe, retorna 0

      const result = await db.getFirstAsync(
        `SELECT COUNT(*) AS count FROM ${tableName};`
      );
      return result?.count || 0;
    } catch (error) {
      console.error(
        `Erro ao obter contagem de registros da tabela ${tableName}:`,
        error
      );
      return 0;
    }
  };

  const syncFunctions: Record<
    string,
    (
      accessToken: string,
      updateProgress: (progress: number) => void,
      updateCounts?: (synced: number, total: number) => void
    ) => Promise<{ total: number; synced: number }>
  > = {
    "/api/carteiracliente": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllClientes(accessToken, updateProgress, updateCounts),

    "/api/bandeja": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllBandejaData(accessToken, updateProgress, updateCounts),

    "/api/bandeja/produto": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllBandejaProdutoData(
        accessToken,
        updateProgress,
        updateCounts
      ),

    "/api/bandejavendedor": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllBandejaVendedorData(
        accessToken,
        updateProgress,
        updateCounts
      ),

    "/api/bandejavendedor/produto": async (
      accessToken,
      updateProgress,
      updateCounts
    ) =>
      await fetchAllBandejaVendedorProdutoData(
        accessToken,
        updateProgress,
        updateCounts
      ),

    "/api/pedido": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllPedidosSincronizados(
        accessToken,
        updateProgress,
        updateCounts
      ),

    "/api/tabelapreco/produto": async (
      accessToken,
      updateProgress,
      updateCounts
    ) =>
      await fetchAllTabelaPrecoProdutoData(
        accessToken,
        updateProgress,
        updateCounts
      ),

    "/api/representante": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllRepresentanteData(
        accessToken,
        updateProgress,
        updateCounts
      ),

    "/api/frete": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllFreteData(accessToken, updateProgress, updateCounts),

    "/api/pagamento": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllPagamentoData(accessToken, updateProgress, updateCounts),

    // #TODO: Não remover, será usada novamente em breve.
    // "/api/pagamento/cliente": async (accessToken, updateProgress) =>
    //   await fetchAllPagamentoClienteData(accessToken, updateProgress),

    "/api/quemcomproucliente": async (
      accessToken,
      updateProgress,
      updateCounts
    ) =>
      await fetchAllQuemComprouClienteData(
        accessToken,
        updateProgress,
        updateCounts
      ),

    "/api/expositor": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllExpositorData(accessToken, updateProgress, updateCounts),

    "/api/pedidominimo": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllPedidoMinimoData(accessToken, updateProgress, updateCounts),

    "/api/catalogo": async (accessToken, updateProgress, updateCounts) =>
      await fetchAllCatalogo(accessToken, updateProgress, updateCounts),

    "/internal/images": async (_accessToken, updateProgress, updateCounts) => {
      // estado inicial do card
      const { total, ok } = await ProdutoImagemRepository.counts();
      updateCounts?.(ok, total);
      updateProgress?.(0);

      // dispara e aguarda o término do download (o progresso vai por eventBus)
      await ImageService.downloadAll({
        batchSize: 100,
        concurrency: 4,
        verbose: true,
      });

      // lê contagem final (após término)
      const { total: total2, ok: ok2 } = await ProdutoImagemRepository.counts();
      updateCounts?.(ok2, total2);
      updateProgress?.(100);

      return { total: total2, synced: ok2 };
    },

    "/api/historicocompracliente": async (
      accessToken,
      updateProgress,
      updateCounts
    ) =>
      await fetchAllHistoricoCompraClienteData(
        accessToken,
        updateProgress,
        updateCounts
      ),
  };

  const updateCardState = (index: number, partial: Partial<SyncCardData>) => {
    setCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...partial };
      return updated;
    });
  };

  const syncCard = async (index: number, accessToken: string) => {
    // guard clause para evitar sincronização concorrente
    if (cards[index].isLoading) {
      return;
    }

    const card = cards[index];

    try {
      const now = new Date();
      const formattedTime = `Hoje às ${formatTime(now)}`;

      const updateCounts = (synced: number, total: number) => {
        updateCardState(index, { currentValue: synced, totalValue: total });
      };

      const updateProgress = (progress: number) => {
        updateCardState(index, { progress });
      };

      const syncFunction = syncFunctions[card.endpoint];
      if (!syncFunction) {
        throw new Error(
          `Nenhuma função de sincronização encontrada para ${card.endpoint}`
        );
      }

      // >>> guardas específicos para o card de imagens <<<
      if (card.endpoint === "/internal/images") {
        // 1) Catálogo precisa existir
        const catCount = await getTableRowCount("Catalogo");
        if (!catCount) {
          throw new Error(
            "Catálogo vazio. Sincronize 'Produtos/Catálogo' antes de baixar imagens."
          );
        }

        // 2) Não roda enquanto o catálogo estiver sincronizando
        const catalogoCard = cards.find((c) => c.endpoint === "/api/catalogo");
        if (catalogoCard?.isLoading) {
          throw new Error(
            "Aguarde a sincronização de 'Produtos/Catálogo' terminar."
          );
        }

        // 3) Checagem robusta: DB OU UI indicam 100%
        await ProdutoImagemRepository.ensureSchema();
        const db = await ProdutoImagemRepository.counts(); // { total, ok, pendentes? }
        const uiTotal = card.totalValue ?? 0;
        const uiOk = card.currentValue ?? 0;

        const dbFull = db.total > 0 && db.ok === db.total;
        const uiFull = uiTotal > 0 && uiOk === uiTotal;
        const fullySynced = dbFull || uiFull;

        if (fullySynced) {
          const yes = await confirmAsync(
            "Download Imagens",
            "Todas as imagens serão apagadas e baixadas novamente, deseja continuar?"
          );
          if (!yes) return; // usuário cancelou → não inicia nada

          // confirmação positiva → reindexa + baixa tudo do zero
          setIsSingleCardSyncing(true);
          cards[index].isLoading = true;
          incrementPendingSync();
          updateCardState(index, {
            isLoading: true,
            progress: 0,
            status: "Sincronizando...",
          });

          await ImageService.reindexAndDownload({
            batchSize: 100,
            concurrency: 1,
            verbose: true,
          });

          const fin = await ProdutoImagemRepository.counts();
          updateCardState(index, {
            lastSync: formattedTime,
            status: "Atualizado",
            currentValue: fin.ok,
            totalValue: fin.total,
            progress: 100,
            isLoading: false,
          });
          await updateLastSyncTime();
          return; // encerra aqui; não cai no fluxo padrão
        }
      }
      // <<< fim dos guardas >>>

      // Fluxo Padrão (inclusive para imagens quando ainda há pendentes)
      setIsSingleCardSyncing(true); // Bloqueia outros botões

      cards[index].isLoading = true;
      incrementPendingSync();

      updateCardState(index, {
        isLoading: true,
        progress: 0,
        status: "Sincronizando...",
      });

      const result = await syncFunction(
        accessToken,
        updateProgress,
        updateCounts
      );

      if (result.total === 0) {
        throw new Error(`Nenhum dado para sincronizar.`);
      }

      // Correção: Atualizar `currentValue` baseado na contagem do banco
      const tableName = getTableNameFromEndpoint(card.endpoint);
      const count = await getTableRowCount(tableName);

      updateCardState(index, {
        lastSync: formattedTime,
        status: "Atualizado",
        currentValue: count, // Atualiza a contagem real do banco
        totalValue: result.total,
        progress: 100, // Finaliza em 100%
        isLoading: false,
      });

      // Atualiza o último horário de sincronização quando um card é sincronizado com sucesso
      await updateLastSyncTime();

      console.log(
        `Sincronização do card ${card.title} concluída. Total: ${result.total}, Sincronizados: ${result.synced}`
      );
    } catch (error: any) {
      console.error(`Erro ao sincronizar card ${card.title}:`, error.message);
      console.log(
        ` useSync - Erro ao sincronizar card ${card.title}:`,
        error.message
      );

      updateCardState(index, {
        isLoading: false,
        progress: 0,
        status: `Pendente: ${error.message}`,
      });
    } finally {
      cards[index].isLoading = false;
      decrementPendingSync();
      setIsSingleCardSyncing(false); // Libera os outros botões
    }
  };

  const syncAll = async (accessToken: string) => {
    // Verifica se já existe uma sincronização em andamento
    if (isSingleCardSyncing) return;

    try {
      for (let i = 0; i < cards.length; i++) {
        try {
          await syncCard(i, accessToken);
        } catch (error) {
          console.error(`Erro ao sincronizar card ${i}:`, error);
          console.log(` useSync - Erro ao sincronizar card ${i}:`, error);
        }
      }
      Alert.alert("Sucesso", "Todos os dados foram sincronizados.");
    } catch (error) {
      console.error("Erro na sincronização completa:", error);
      Alert.alert("Erro", "Ocorreu um erro durante a sincronização.");
    }
  };

  // --- Imagens: atualiza a barra via eventos do ImageService ---
  useEffect(() => {
    // início automático (ou manual): bloqueia o card e troca o ícone para ampulheta
    const offStart = eventBus.on("sync:images:start", (p: any) => {
      setIsSingleCardSyncing(true);
      incrementPendingSync();

      setCards((prev) =>
        prev.map((c) =>
          c.endpoint === "/internal/images"
            ? {
                ...c,
                isLoading: true, // bloqueia clique e mostra ampulheta
                status: "Baixando Imagens...",
                currentValue: p?.ok ?? c.currentValue,
                totalValue: p?.total ?? c.totalValue,
                progress: p?.percent ?? c.progress,
              }
            : c
        )
      );
    });

    const offProgress = eventBus.on("sync:images:progress", (p: any) => {
      // mantém o bloqueio enquanto progride
      setCards((prev) =>
        prev.map((c) =>
          c.endpoint === "/internal/images"
            ? {
                ...c,
                isLoading: true,
                progress: p?.percent ?? c.progress,
                currentValue: p?.ok ?? c.currentValue,
                totalValue: p?.total ?? c.totalValue,
                status:
                  p?.total && p?.ok === p?.total
                    ? "Imagens Atualizadas"
                    : "Baixando Imagens...",
              }
            : c
        )
      );
    });

    const offDone = eventBus.on("sync:images:done", (p: any) => {
      const now = new Date();
      const hhmm = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setCards((prev) =>
        prev.map((c) =>
          c.endpoint === "/internal/images"
            ? {
                ...c,
                isLoading: false, // libera clique e volta ícone normal
                progress: 100,
                currentValue: p?.ok ?? c.currentValue,
                totalValue: p?.total ?? c.totalValue,
                status: `Imagens Atualizadas - Hoje às ${hhmm}`,
              }
            : c
        )
      );
    });

    return () => {
      offStart?.();
      offProgress?.();
      offDone?.();
    };
  }, []);

  return {
    cards,
    lastSyncTime,
    nextSyncTime,
    syncCard,
    syncAll,
    isSingleCardSyncing,
  };
}
