/**
 * Path: src/hooks/useListaProdutos.ts
 * Propósito: manter a paginação atual e, quando houver whereSql, usar listarProdutosPaginaComFiltro.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProdutoService } from "@/services/ProdutoService";
import { useBloqueios } from "./useBloqueios";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";

type AdvancedFilter = { whereSql: string } | null; // params não são usados no pipeline atual

interface Params {
  tabelaPreco: string;
  termoBusca?: string;
  enabled?: boolean;
  advancedFilter?: AdvancedFilter; // novo (opcional)
}

export function useListaProdutos({
  tabelaPreco,
  termoBusca = "",
  enabled = true,
  advancedFilter = null, // novo (default)
}: Params) {
  const PAGE_SIZE = 400;

  const [pagina, setPagina] = useState(1);
  const [produtos, setProdutos] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [temMais, setTemMais] = useState(true);

  const loadingRef = useRef(false);
  const temMaisRef = useRef(true);
  const isPagingRef = useRef(false);
  const lastRequestedPageRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    temMaisRef.current = temMais;
  }, [temMais]);

  const { bloqueios } = useBloqueios();

  const termoNorm = useMemo(() => (termoBusca ?? "").trim(), [termoBusca]);

  // inclui o filtro para resetar ao aplicar/limpar
  const depsKey = useMemo(
    () => JSON.stringify([tabelaPreco, termoNorm, advancedFilter?.whereSql ?? ""]),
    [tabelaPreco, termoNorm, advancedFilter?.whereSql]
  );

  const carregarPagina = useCallback(
    async (paginaDesejada: number, force = false) => {
      if (!enabled) return;

      // Guards com refs (estado mais recente)
      if (!force) {
        if (loadingRef.current || isPagingRef.current) return;
        // Só bloqueia se NÃO for primeira página; página 1 sempre pode carregar
        if (paginaDesejada !== 1 && !temMaisRef.current && termoNorm === "") return;
        if (lastRequestedPageRef.current === paginaDesejada) return;
      }
      isPagingRef.current = true;
      lastRequestedPageRef.current = paginaDesejada;
      setLoading(true);
      loadingRef.current = true;
      const myReqId = ++requestIdRef.current;

      try {
        let novosProdutos: CatalogoItem[] = [];

        if (termoNorm !== "") {
          // Fluxo atual de busca permanece igual
          const resposta = await ProdutoService.buscarPorTermo(termoNorm, tabelaPreco, bloqueios);
          if (requestIdRef.current !== myReqId) return; // resposta velha, ignora
          novosProdutos = Array.isArray(resposta) ? resposta : [];
          setTemMais(false);
          temMaisRef.current = false;
        } else {
          // Sem busca — decide entre paginação normal ou com filtro
          const hasWhere =
            !!advancedFilter?.whereSql && advancedFilter.whereSql.trim().length > 0;

          if (hasWhere && typeof (ProdutoService as any).listarProdutosPaginaComFiltro === "function") {
            // usa paginação COM filtro (quando o método existir)
            const resposta = await ProdutoService.listarProdutosPaginaComFiltro(
              PAGE_SIZE,
              paginaDesejada,
              tabelaPreco,
              bloqueios,
              advancedFilter!.whereSql
            );
            if (requestIdRef.current !== myReqId) return;
            novosProdutos = Array.isArray(resposta) ? resposta : [];
          } else {
            // fallback: comporta-se como hoje (sem filtro extra)
            const resposta = await ProdutoService.listarProdutosPagina(
              PAGE_SIZE,
              paginaDesejada,
              tabelaPreco,
              bloqueios
            );
            if (requestIdRef.current !== myReqId) return;
            novosProdutos = Array.isArray(resposta) ? resposta : [];
          }

          const haMais = novosProdutos.length === PAGE_SIZE;
          setTemMais(haMais);
          temMaisRef.current = haMais;
        }

        setProdutos((prev) => (paginaDesejada === 1 ? novosProdutos : [...prev, ...novosProdutos]));
        setPagina(paginaDesejada);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        if (requestIdRef.current === myReqId) {
          setLoading(false);
          loadingRef.current = false;
          isPagingRef.current = false;
        }
      }
    },
    [enabled, PAGE_SIZE, termoNorm, tabelaPreco, bloqueios, advancedFilter?.whereSql]
  );

  const carregarMais = useCallback(() => {
    if (!enabled) return;
    if (loadingRef.current) return;
    if (!temMaisRef.current || termoNorm !== "") return;
    carregarPagina(pagina + 1);
  }, [enabled, carregarPagina, pagina, termoNorm]);

  const resetar = useCallback(() => {
    if (!enabled) return;

    // Zera refs ANTES de pedir a página 1
    isPagingRef.current = false;
    lastRequestedPageRef.current = null;
    temMaisRef.current = true;
    loadingRef.current = false;

    // Zera estados
    setProdutos([]);
    setPagina(1);
    setTemMais(true);
    setLoading(false);

    // Força recarregar página 1 mesmo que temMais antigo fosse false
    carregarPagina(1, true);
  }, [enabled, carregarPagina]);

  // reseta quando (tabela/termo/filtro) muda
  const prevDepsKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (prevDepsKeyRef.current === depsKey) return;
    prevDepsKeyRef.current = depsKey;
    resetar();
  }, [enabled, depsKey, resetar]);

  return { produtos, loading, carregarMais, resetar, temMais, pagina };
}
