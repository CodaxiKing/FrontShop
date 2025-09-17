/**
 * Path: src/hooks/useAdvancedFilterApplied.ts
 * Propósito: ouvir eventBus("filters:applied"/"filters:cleared") e entregar o whereSql correto
 *            (de Catalogo ou de TabelaPrecoProduto) para ser injetado no useListaProdutos.
 */
import * as React from "react";
import { eventBus } from "@/core/eventBus";
import { FILTERS_EVENTS } from "@/services/FiltroService";

type AdvancedFilter = { whereSql: string } | null;

export function useAdvancedFilterApplied(tabelaPreco: string) {
  const [advancedFilter, setAdvancedFilter] = React.useState<AdvancedFilter>(null);

  React.useEffect(() => {
    const onApplied = (payload: {
      catalogo: { whereSql: string };
      tabela: { whereSql: string };
      rawState?: any;
    }) => {
      const isCatalogo = String(tabelaPreco) === "999999";
      const whereSql = isCatalogo ? payload.catalogo.whereSql : payload.tabela.whereSql;
      setAdvancedFilter(whereSql && whereSql.trim() ? { whereSql } : null);
    };
    const onCleared = () => setAdvancedFilter(null);

    eventBus.on(FILTERS_EVENTS.APPLIED, onApplied);
    eventBus.on(FILTERS_EVENTS.CLEARED, onCleared);
    return () => {
      eventBus.off?.(FILTERS_EVENTS.APPLIED, onApplied);
      eventBus.off?.(FILTERS_EVENTS.CLEARED, onCleared);
    };
  }, [tabelaPreco]);

  return { advancedFilter, clearAdvancedFilter: () => setAdvancedFilter(null) };
}
