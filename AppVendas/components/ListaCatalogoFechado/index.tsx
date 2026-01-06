// src/components/ListaCatalogoFechado/index.tsx
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Alert, View } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";

import { useListaProdutos } from "@/hooks/useListaProdutos";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import { useOrientation } from "@/context/OrientationContext";
import AuthContext from "@/context/AuthContext";
import { useProdutoQuantidade } from "@/context/ProdutoQuantidadeContext";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useAdvancedFilterApplied } from "@/hooks/useAdvancedFilterApplied";
import { HistoricoComprasCacheService } from "@/services/HistoricoComprasCacheService";
import { useJaComprouTemp } from "@/hooks/useJaComprouTemp";

import { RootStackParamList } from "@/types/types";
import ListaProdutos from "./ListaProdutos";
import FiltroBusca from "./FiltroBusca";
import { FormSearch } from "./style";
import LegendaSinalizadores from "./LegendaSinalizadores";

// DEV tools (apenas UI e logs em modo dev)
import { eventBus } from "@/core/eventBus";
import { FiltroService, FILTERS_EVENTS } from "@/services/FiltroService";
import { fetchIconToCodesMap } from "@/utils/filters/sinalizadorIconMap";
import { usePedidoCopia } from "@/context/PedidoCopiaContext";
import { triggerAutoCreateCart } from "@/services/pedidoCopiaService";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import { ModalDistribuirProdutoPorLojas } from "@/modal/ModalDistribuirProdutoPorLojas";
import { fetchStoresByCliente, Store } from "@/services/fetchStores";
import { buscarPedido } from "@/repositories/PedidoRepository";
import { aplicarDistribuicaoProdutoPorLojas } from "@/services/aplicarDistribuicaoProdutoPorLojas";
import { useTopContext } from "@/context/TopContext";
import { getCodigosDoCarrinho } from "@/services/CarrinhoFiltroService";
import { set } from "date-fns";
import { useMenuContext } from "@/context/MenuProvider";

type CatalogoFechadoRouteProp = RouteProp<
  RootStackParamList,
  "CatalogoFechado"
>;

const ListaCatalogoFechado: React.FC = () => {
  const route = useRoute<CatalogoFechadoRouteProp>();
  const {
    selectedTabelaPrecoContext,
    clienteIdContext,
    selectedClientContext,
  } = useClientInfoContext();
  const { userData } = React.useContext(AuthContext);
  const representanteId = userData?.representanteId || "";
  const cpfCnpj = userData?.cpfCnpj || "";
  const razaoSocial = selectedClientContext?.razaoSocial || "";
  const codigoCliente = selectedClientContext?.codigoCliente || "";
  const cpfCnpjCliente = selectedClientContext?.cpfCnpj || "";
  const catalogOpen = (route.params?.catalogOpen as boolean) || false;

  const processingRef = React.createRef<{ current: boolean }>() as any;

  const { numColumns } = useOrientation();
  const { preloadQuantidades, setQuantidade } = useProdutoQuantidade();
  const { updateCarrinhosCount } = useTopContext();

  const [cartOnly, setCartOnly] = useState(false);
  const [cartCodes, setCartCodes] = useState<string[]>([]);
  const [cartVersion, setCartVersion] = useState(0); // força recarregar a lista quando atualizar

  let selectedTabelaPreco = useMemo(() => {
    if (catalogOpen) {
      return "999999";
    }
    const ctx = selectedTabelaPrecoContext as any;
    const param = route.params?.selectedTabelaPreco as any;
    return (
      (ctx && typeof ctx === "object"
        ? String(ctx.value)
        : ctx
        ? String(ctx)
        : "") ||
      (param && typeof param === "object"
        ? String(param.value)
        : param
        ? String(param)
        : "") ||
      "999999"
    );
  }, [selectedTabelaPrecoContext, route.params?.selectedTabelaPreco]);

  const [termoBusca, setTermoBusca] = React.useState("");
  const termoBuscaNorm = useMemo(() => termoBusca.trim(), [termoBusca]);

  const [modalLojasVisible, setModalLojasVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<CatalogoItem | null>(null);
  const [storesColigadas, setStoresColigadas] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);

  const [pedidoAtual, setPedidoAtual] = useState<any | null>(null);
  const [isApplyingDistribuicao, setIsApplyingDistribuicao] = useState(false);

  const { setLojasParaCliente } = useMenuContext();

  const storesVM = React.useMemo(() => {
    return (storesColigadas ?? [])
      .filter((s) => !!s.cpfCnpj)
      .map((s) => ({
        cpfCnpj: String(s.cpfCnpj),
        nomeReduzido: String(s.nomeReduzido ?? ""),
        razaoSocial: String(s.razaoSocial ?? ""),
      }));
  }, [storesColigadas]);

  const handleOpenLojasColigadas = useCallback(
    async (produto: CatalogoItem) => {
      setProdutoSelecionado(produto);
      setModalLojasVisible(true);

      try {
        const rows = await buscarPedido(
          cpfCnpjCliente,
          String(clienteIdContext),
          representanteId
        );
        setPedidoAtual(rows?.[0] ?? null);
      } catch (e) {
        setPedidoAtual(null);
      }
    },
    [cpfCnpjCliente, clienteIdContext, representanteId]
  );

  const handleCloseLojasColigadas = React.useCallback(() => {
    setModalLojasVisible(false);
    setProdutoSelecionado(null);
    setPedidoAtual(null);
  }, []);

  // Consome params de rota vindos do Sidebar (scanner de código de barras e busca geral)
  //const navigation = useNavigation();
  useEffect(() => {
    const p: any = route.params || {};
    const tipo = p.filtroTipo;
    if (!tipo) return;

    if (tipo === "codigoBarra") {
      const codigo = String(p.filtroCodigo ?? "").trim();
      if (codigo) setTermoBusca(codigo);
    } else if (tipo === "buscaGeral") {
      const nome = String(p.filtroNome ?? "").trim();
      if (nome) setTermoBusca(nome);
    }
    // Para evitar reprocesso ao voltar de telas, pode limpar os params:
    // navigation.setParams({ filtroTipo: undefined, filtroCodigo: undefined, filtroNome: undefined });
  }, [
    route.params?.filtroTipo,
    route.params?.filtroCodigo,
    route.params?.filtroNome,
  ]);

  // Filtro avançado vindo do drawer via eventBus
  const { advancedFilter } = useAdvancedFilterApplied(selectedTabelaPreco);

  const { produtos, loading, carregarMais } = useListaProdutos({
    tabelaPreco: selectedTabelaPreco,
    termoBusca: termoBuscaNorm,
    advancedFilter,

    codigoIn: cartOnly ? cartCodes : undefined, // ✅ novo
    versionKey: cartVersion, // ✅ opcional (pra forçar refresh interno)
  });

  const {
    stagedCartItems,
    shouldAutoCreateCart,
    consumeAutoCreateFlag,
    targetClient,
    selectedTabela,
  } = usePedidoCopia();

  useEffect(() => {
    // deps mínimos: só a flag — os demais valores são “snapshotados” no service
    if (!shouldAutoCreateCart) return;

    triggerAutoCreateCart({
      shouldAutoCreateCart,
      consumeAutoCreateFlag,
      stagedCartItems,
      client: targetClient as any,
      representanteId,
      selectedTabela,
      setQuantidade,
      processingRef, // opcional, mas recomendado
    }).catch(() => {
      // trate erros silenciosamente se quiser
    });
  }, [shouldAutoCreateCart]);

  //console.warn(`SelectedTabelaPreco ${route.params?.selectedTabelaPreco}`)
  //console.warn(`Produtos Total ${produtos.length}`)

  const [iconToCodesMap, setIconToCodesMap] = useState<
    Partial<Record<any, string[]>>
  >({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const map = await fetchIconToCodesMap();
        if (alive) setIconToCodesMap(map);
      } catch (e) {
        // silencioso
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    // ✅ se não tem cliente, zera tudo e não deixa loading preso
    if (!cpfCnpjCliente) {
      setStoresColigadas([]);
      setLoadingStores(false);
      return () => {
        alive = false;
      };
    }

    (async () => {
      setLoadingStores(true);

      try {
        const stores = await fetchStoresByCliente(cpfCnpjCliente);
        if (!alive) return;
        setStoresColigadas(stores ?? []);
      } catch (e) {
        if (!alive) return;
        setStoresColigadas([]);
      } finally {
        // ✅ garante que sai do null (mas só se ainda estiver vivo)
        if (alive) setLoadingStores(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [cpfCnpjCliente]);

  const hasColigadas = useMemo(() => {
    const stores = storesColigadas ?? [];

    // só retorna null se estiver carregando E ainda não tem nenhum dado
    if (loadingStores && stores.length === 0) return null;

    if (stores.length === 0) return false;

    const norm = (v: any) => String(v ?? "").trim();

    const cpf = norm(stores[0]?.cpfCnpj);
    const pai = norm(stores[0]?.cpfCnpjPai);

    // regra: se só tem 1 loja e ela é a principal (cpfCnpj == cpfCnpjPai), então NÃO tem coligadas
    if (stores.length === 1 && cpf === pai) {
      return false; // igual => false
    }

    return true;
  }, [storesColigadas, loadingStores]);

  // Pré-carrega quantidades (uma vez por abertura / troca de cliente/rep)
  // da um fetch nas lojas coligadas também
  useEffect(() => {
    if (!cpfCnpj || !clienteIdContext || !representanteId) return;

    preloadQuantidades(
      String(cpfCnpj),
      String(clienteIdContext),
      String(representanteId),
      String(codigoCliente ?? "")
    );
  }, [
    cpfCnpj,
    clienteIdContext,
    representanteId,
    codigoCliente,
    preloadQuantidades,
  ]);

  // Cache "já comprou" por cliente (TEMP)
  useEffect(() => {
    (async () => {
      const cli = String(codigoCliente ?? "");
      if (cli) {
        await HistoricoComprasCacheService.populateForCliente(cli);
      } else {
        await HistoricoComprasCacheService.clear();
      }
    })();
  }, [codigoCliente]);

  // ids dos produtos da página (para favoritos)
  const produtoIds = useMemo(
    () => produtos.map((p) => String((p as any)?.id ?? p.codigo)),
    [produtos]
  );

  const {
    isFavorite,
    toggleFavorite,
    favoritesMap,
    favoritesVersion = 0,
  } = useFavoritos(produtoIds, {
    cpfCnpj: String(cpfCnpj),
    clienteId: String(clienteIdContext ?? ""),
    representanteId: String(representanteId ?? ""),
  });

  const favDeps = useMemo(
    () => ({ isFavoriteById: isFavorite, toggleFavoriteById: toggleFavorite }),
    [isFavorite, toggleFavorite]
  );

  // Predicado "já comprou" a partir da TEMP
  const { isJaComprou } = useJaComprouTemp(codigoCliente);

  // handler: tocar no título “Legendas:” -> limpar filtros aplicados
  const handleLegendReset = React.useCallback(() => {
    setCartOnly(false);
    setCartCodes([]);
    setCartVersion((v) => v + 1);

    eventBus.emit(FILTERS_EVENTS.CLEARED);
  }, []);

  // handler: tocar num ícone de legenda -> filtrar pelos códigos mapeados
  const handleLegendFilter = React.useCallback(
    async (codes: string[]) => {
      handleLegendReset();
      // ✅ badge especial “Carrinho”

      if (codes?.includes("006")) {
        // toggle
        if (cartOnly) {
          setCartOnly(false);
          setCartCodes([]);
          setCartVersion((v) => v + 1);
          return;
        }

        const { codigos } = await getCodigosDoCarrinho({
          cpfCnpj: String(cpfCnpjCliente ?? ""),
          clienteId: String(clienteIdContext ?? ""),
          representanteId: String(representanteId ?? ""),
        });

        if (!codigos.length) {
          // opcional: feedback
          setCartOnly(false);
          setCartCodes([]);
          setCartVersion((v) => v + 1);
          return;
        }

        setCartOnly(true);
        setCartCodes(codigos);
        setCartVersion((v) => v + 1);
        return;
      }

      const compiled = FiltroService.compile(
        { sinalizadores: { include: codes, exclude: [] } },
        {
          tabelaPreco: selectedTabelaPreco,
          codigoCliente: String(codigoCliente ?? ""), // para "já comprou"
          cpfCnpj: String(cpfCnpj ?? ""), // para "favorito"
          clienteId: String(clienteIdContext ?? ""), // para "favorito"
          representanteId: String(representanteId ?? ""), // para "favorito"
        }
      );
      eventBus.emit(FILTERS_EVENTS.APPLIED, compiled);
    },
    [
      selectedTabelaPreco,
      codigoCliente,
      cpfCnpj,
      cpfCnpjCliente,
      cartOnly,
      clienteIdContext,
      representanteId,
    ]
  );

  const handleConfirmDistribuicao = useCallback(
    async (qtdMap: Record<string, number>) => {
      const temAlgumaQtd = Object.values(qtdMap).some((q) => (q ?? 0) > 0);

      if (!temAlgumaQtd) {
        Alert.alert(
          "Aviso",
          "Selecione ao menos uma loja com quantidade maior que 0."
        );
        return;
      }

      if (!produtoSelecionado) return;

      // Anti double-tap
      if (isApplyingDistribuicao) return;

      try {
        setIsApplyingDistribuicao(true);

        // ⚠️ precisa existir
        if (!cpfCnpjCliente) {
          Alert.alert("Aviso", "Cliente não selecionado.");
          return;
        }

        const result = await aplicarDistribuicaoProdutoPorLojas({
          produto: produtoSelecionado,
          qtdMap,
          pedidoAtual, // state que você já preenche ao abrir modal
          clientePrincipalCpfCnpj: String(cpfCnpjCliente),
          clienteId: String(clienteIdContext),
          representanteId: String(representanteId),
          representanteCreateId: String(representanteId), // ou outro se você tiver
          selectedTabelaPreco: String(selectedTabelaPreco),
          selectedClient: {
            clienteId: String(clienteIdContext),
            cpfCnpj: String(cpfCnpjCliente),
            razaoSocial: String(razaoSocial ?? ""),
            enderecoCompleto: String(
              selectedClientContext?.enderecoCompleto ?? ""
            ),
            enderecos: Array.isArray(selectedClientContext?.enderecos)
              ? selectedClientContext.enderecos
              : [],
            codigoCliente: String(selectedClientContext?.codigoCliente ?? ""),
          },
        });

        // ✅ Feedback de falha parcial
        if (result.falha.length > 0) {
          const lojasFalha = result.falha
            .map((f) => {
              const loja = storesVM.find((s) => s.cpfCnpj === f.cpfCnpj);
              return loja?.razaoSocial || f.cpfCnpj;
            })
            .join("\n");

          Alert.alert(
            "Aviso",
            `Falhou em ${result.falha.length} loja(s):\n\n${lojasFalha}`
          );
        }

        // atualizar pedidoAtual após insert/update (pra reabrir modal já “batendo”)
        const rows = await buscarPedido(
          String(selectedClientContext?.cpfCnpj),
          String(selectedClientContext?.clienteId),
          String(representanteId)
        );
        setPedidoAtual(rows?.[0] ?? null);

        handleCloseLojasColigadas(); // ✅ fecha no final
        updateCarrinhosCount();

        const lojasDoDB = (result.sucesso ?? []).map((lojas) => lojas);
        setLojasParaCliente(cpfCnpjCliente, lojasDoDB);
      } catch (e: any) {
        Alert.alert("Erro", e?.message ?? "Falha ao aplicar distribuição.");
      } finally {
        // updateCarrinhosCount();
        setIsApplyingDistribuicao(false);
      }
    },
    [
      produtoSelecionado,
      pedidoAtual,
      selectedClientContext,
      representanteId,
      selectedTabelaPreco,
      storesVM,
      isApplyingDistribuicao,
      handleCloseLojasColigadas,
    ]
  );

  // // DEV tools (apenas em desenvolvimento)
  // const { DevButtons } = useCatalogoDevTools({
  //   produtos,
  //   loading,
  //   selectedTabelaPreco,
  //   codigoCliente: String(codigoCliente ?? ""),
  //   advancedWhere: advancedFilter?.whereSql ?? "",
  // });

  //console.warn(`catalogOpen:[${catalogOpen}]`);

  return (
    <View style={{ flex: 1 }}>
      <FormSearch>
        <FiltroBusca onChangeSearch={setTermoBusca} value={termoBusca} />
      </FormSearch>

      {/* Legenda dinâmica */}
      <LegendaSinalizadores
        forceAll
        produtos={produtos}
        iconToCodesMap={iconToCodesMap}
        onPressIcon={handleLegendFilter}
        onReset={handleLegendReset}
      />

      {/* {__DEV__ && <DevButtons />}        */}

      <ListaProdutos
        catalogOpen={catalogOpen}
        representanteId={representanteId}
        produtos={produtos}
        loading={loading}
        carregarMais={carregarMais}
        numColumns={numColumns}
        // favoritos
        favDeps={favDeps}
        favoritesMap={favoritesMap}
        favoritesVersion={favoritesVersion}
        listKey={advancedFilter?.whereSql ?? ""}
        // "já comprou"
        isJaComprou={isJaComprou}
        // abrir lojas coligadas
        onOpenLojasColigadas={handleOpenLojasColigadas}
        // flag de existência de lojas coligadas
        hasColigadas={hasColigadas}
      />

      {modalLojasVisible && (
        <ModalDistribuirProdutoPorLojas
          visible={modalLojasVisible}
          produto={produtoSelecionado}
          stores={storesVM}
          // stores={storesMock}
          onClose={handleCloseLojasColigadas}
          onConfirm={handleConfirmDistribuicao}
          loading={loadingStores}
          pedidoAtual={pedidoAtual}
          isApplying={isApplyingDistribuicao}
        />
      )}
    </View>
  );
};

export default ListaCatalogoFechado;
