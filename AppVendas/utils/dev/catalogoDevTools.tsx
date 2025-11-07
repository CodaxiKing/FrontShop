// src/utils/dev/catalogoDevTools.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { eventBus } from "@/core/eventBus";
import { FiltroService, FILTERS_EVENTS } from "@/services/FiltroService";
import type { CatalogoItem } from "@/context/interfaces/CatalogoItem";

type Params = {
  produtos: CatalogoItem[];
  loading: boolean;
  selectedTabelaPreco: string;
  codigoCliente: string;
  advancedWhere: string; // whereSql atual (para logs AFTER)
};

export function useCatalogoDevTools(params: Params) {
  const { produtos, loading, selectedTabelaPreco, codigoCliente, advancedWhere } = params;

  // refs para log after (snapshot da lista antes de aplicar o filtro)
  const pendingRef = React.useRef<{
    run: number;
    beforeCount: number;
    beforeIds: string[];
  } | null>(null);
  const runRef = React.useRef(0);

  const getIds = React.useCallback((arr: any[], limit = 24) => {
    return arr
      .slice(0, limit)
      .map((p) => String((p as any)?.codigo ?? (p as any)?.id ?? ""));
  }, []);

  const applyDevFilter = React.useCallback(async () => {
    // snapshot BEFORE
    const beforeIds = getIds(produtos, 24);
    const beforeCount = produtos.length;
    const run = ++runRef.current;
    pendingRef.current = { run, beforeCount, beforeIds };
    // console.log(`[DEV BEFORE#${run}] count=${beforeCount} ids=${beforeIds.join(",")}`);

    // Estratégia simples: escolhe um item e usa seus códigos para compor um filtro,
    // mas por padrão envia filtros vazios (você pode ajustar aqui como preferir).
    const p0 = produtos[0];
    const marca = String((p0 as any)?.codigoMarca ?? "").trim();
    const linha = String((p0 as any)?.codigoLinha ?? "").trim();
    const subgrupo = String((p0 as any)?.codigoSubGrupo ?? "").trim();

    let marcas = marca ? [marca] : [];
    let linhas = linha ? [linha] : [];
    let subgrupos = subgrupo ? [subgrupo] : [];
    let outros: string[] = []; // ex: ["FEMININO", "MASCULINO", "UNISSEX", NACIONAL, IMPORTADO]
    let sinalizadores: string[] = ["111"]; // ex: ["001","002","003", "004", "005"]; pode incluir "000" para JA COMPROU ou "111" FAVORITOS
    let bandejaVals: string[] = [];   // ex: ["000001", "000007"]

    // zera por padrão (você liga/desliga durante testes)
    marcas = [];
    linhas = [];
    subgrupos = [];
    outros = [];
    //sinalizadores = [];
    bandejaVals = [];

    console.log(">>> sinalizadores enviados:", sinalizadores);


    const compiled = FiltroService.compile(
      {
        marca: { values: [marcas] },
        linha: { values: [linhas] },
        subgrupo: { values: [subgrupos] },
        outros: { values: [outros] },
        bandeja: { values: bandejaVals },
        sinalizadores: { include: sinalizadores, exclude: [] },
      },
      { tabelaPreco: selectedTabelaPreco, codigoCliente: String(codigoCliente ?? "") } //686327 - 09635158000102 Luiz Afonso Condessado
    );

    const where =
      String(selectedTabelaPreco) === "999999"
        ? compiled.catalogo.whereSql
        : compiled.tabela.whereSql;

    // Logs úteis
    console.log("[DEV apply] whereSql usado:", where);
    try {
      const repo = await import("@/repositories/ProdutoRepository");
      await (repo as any)?.ProdutoRepository?.debugCountFiltered?.(
        String(selectedTabelaPreco),
        where
      );
    } catch (e) {
      // silencioso
    }

    eventBus.emit(FILTERS_EVENTS.APPLIED, compiled);
  }, [produtos, selectedTabelaPreco, codigoCliente, getIds]);

  const clearDevFilter = React.useCallback(() => {
    pendingRef.current = null;
    eventBus.emit(FILTERS_EVENTS.CLEARED);
  }, []);

  // AFTER log — compara BEFORE vs AFTER quando loading termina e where muda
  React.useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    if (loading) return;
    if (!advancedWhere) return;

    const { run, beforeCount, beforeIds } = pending;
    const afterCount = produtos.length;
    const afterIds = getIds(produtos, 24);

    const setBefore = new Set(beforeIds);
    const inter = afterIds.filter((id) => setBefore.has(id));
    const jaccard = inter.length / (new Set([...beforeIds, ...afterIds]).size || 1);

    console.log(`[DEV AFTER#${run}] count=${afterCount} ids=${afterIds.join(",")}`);
    console.log(
      `[DEV DIFF#${run}] delta=${afterCount - beforeCount} | before=${beforeCount} | after=${afterCount} | inter=${inter.length} | jaccard=${jaccard.toFixed(
        2
      )}`
    );

    pendingRef.current = null;
  }, [loading, produtos, advancedWhere, getIds]);

  // Pequeno painel com botões (renderizar somente em __DEV__)
  const DevButtons: React.FC = () => {
    if (!__DEV__) return null;
    return (
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingTop: 8, marginBottom: 5 }}>
        <TouchableOpacity
          onPress={applyDevFilter}
          style={{
            backgroundColor: "#e8f0ff",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
          }}
        >
          <Text>DEV: Aplicar filtro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearDevFilter}
          style={{
            backgroundColor: "#ffecec",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
          }}
        >
          <Text>DEV: Limpar filtro</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return { DevButtons, applyDevFilter, clearDevFilter };
}
