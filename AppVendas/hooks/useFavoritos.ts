// hooks/useFavoritos.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FavoritoService, CtxFavorito } from "@/services/FavoritoService";
import { eventBus, getHoraAtualComMs } from "@/core/eventBus";

export function useFavoritos(produtoIds: (string | number)[], ctx: CtxFavorito) {
  const [mapFav, setMapFav] = useState<Record<string, boolean>>({});
  const [version, setVersion] = useState(0); // incrementa a cada mudança visual necessária

  // chaves de dependência
  const ctxKey = useMemo(
    () => `${ctx.cpfCnpj}|${ctx.clienteId}|${ctx.representanteId}`,
    [ctx.cpfCnpj, ctx.clienteId, ctx.representanteId]
  );
  const idsKey = useMemo(
    () => JSON.stringify(produtoIds.map(String).sort()),
    [produtoIds]
  );

  console.log(`[${getHoraAtualComMs()}]: ${JSON.stringify(ctx)}`)

  // Set com ids da página (lookup O(1))
  const idsSetRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    idsSetRef.current = new Set(produtoIds.map(String));
  }, [idsKey]); // recalcula quando ids mudarem

  // carregamento inicial por página/ctx
  useEffect(() => {
    let alive = true;
    (async () => {
      await FavoritoService.ensureSchema();
      const map = await FavoritoService.mapForList(produtoIds, ctx);
      if (!alive) return;
      setMapFav(map);
      setVersion((v) => v + 1); // força re-render inicial da FlatList
    })();
    return () => {
      alive = false;
    };
  }, [ctxKey, idsKey]);

  // Escuta eventos globais (favorito:toggled) de qualquer lugar
  useEffect(() => {
    const handler = (payload: {
      produtoId: string;
      isFavorite: boolean;
      cpfCnpj: string;
      clienteId: string | number;
      representanteId: string | number;
    }) => {
      const sameCtx =
        String(payload.cpfCnpj) === String(ctx.cpfCnpj) &&
        String(payload.clienteId) === String(ctx.clienteId) &&
        String(payload.representanteId) === String(ctx.representanteId);

      if (!sameCtx) return;

      const id = String(payload.produtoId);
      const isOnPage = idsSetRef.current.has(id);
      if (!isOnPage) return; // só atualiza se o item está nesta página

      const nextVal = !!payload.isFavorite;

      setMapFav((prev) => {
        const cur = prev[id];
        if (cur === nextVal) return prev; // evita renders desnecessários
        const newMap = { ...prev, [id]: nextVal };
        return newMap;
      });
      setVersion((v) => v + 1); // re-render imediato dos itens visíveis
    };

    eventBus.on("favorito:toggled", handler);
    return () => {
      eventBus.off?.("favorito:toggled", handler);
    };
  }, [ctxKey, idsKey]);

  const isFavorite = useCallback(
    (produtoId: string | number) => !!mapFav[String(produtoId)],
    [mapFav]
  );

  const toggleFavorite = useCallback(
    async (produtoId: string | number) => {
      const id = String(produtoId);
      const novo = await FavoritoService.toggleFavorite(id, ctx);

      setMapFav((prev) => {
        const cur = prev[id];
        const nextVal = !!novo;
        if (cur === nextVal) return prev;
        return { ...prev, [id]: nextVal };
      });

      setVersion((v) => v + 1); // garante atualização visual do card atual
      return novo;
    },
    [ctxKey]
  );

  return {
    isFavorite,
    toggleFavorite,
    favoritesMap: mapFav,
    favoritesVersion: version,
  };
}
