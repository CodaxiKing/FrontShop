// src/components/ListaCatalogoFechado/index.tsx
import React, { useMemo, useEffect, useState } from "react";
import { View } from "react-native";
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
import { useCatalogoDevTools } from "@/utils/dev/catalogoDevTools";
import { eventBus } from "@/core/eventBus";
import { FiltroService, FILTERS_EVENTS } from "@/services/FiltroService";
import { fetchIconToCodesMap } from "@/utils/filters/sinalizadorIconMap";
import { useNavigation } from "@react-navigation/native";
import { usePedidoCopia } from "@/context/PedidoCopiaContext";
import { triggerAutoCreateCart } from "@/services/pedidoCopiaService";

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
  const codigoCliente = selectedClientContext?.codigoCliente || "";
  const catalogOpen = (route.params?.catalogOpen as boolean) || false;

  const processingRef = React.createRef<{ current: boolean }>() as any;

  const { numColumns } = useOrientation();
  const { preloadQuantidades, setQuantidade } = useProdutoQuantidade();

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

  // Pré-carrega quantidades (uma vez por abertura / troca de cliente/rep)
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
    eventBus.emit(FILTERS_EVENTS.CLEARED);
  }, []);

  // handler: tocar num ícone de legenda -> filtrar pelos códigos mapeados
  const handleLegendFilter = React.useCallback(
    (codes: string[]) => {
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
      clienteIdContext,
      representanteId,
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
      />
    </View>
  );
};

export default ListaCatalogoFechado;
