/**
 * Path: /hooks/useJaComprouTemp.ts
 * Propósito: expor um predicado rápido para saber se um produto já foi comprado
 *            pelo cliente atual, usando a TEMP _ComprasClienteAtual.
 * Observação: NÃO popula a TEMP — isso já acontece ao trocar de cliente
 *             (ListaCatalogoFechado faz populate via HistoricoComprasCacheService).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { HistoricoComprasCacheRepository } from "@/repositories/HistoricoComprasCacheRepository";

function baseCode(codigo: string) {
  const s = String(codigo ?? "");
  const i = s.indexOf("/");
  return i > 0 ? s.slice(0, i) : s;
}

export function useJaComprouTemp(
  clienteId: string | number | null | undefined
) {
  const [setCodes, setSetCodes] = useState<Set<string>>(new Set());
  const key = useMemo(() => String(clienteId ?? ""), [clienteId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // carrega TODAS as bases já-compradas da TEMP
        const rows = await HistoricoComprasCacheRepository.listAllCodes?.();
        const set = new Set<string>((rows ?? []).map(String));
        if (!alive) return;
        setSetCodes(set);
        // if (__DEV__) {
        //   console.log(`[useJaComprouTemp] cliente=${key} loaded=${set.size}`);
        // }
      } catch (e) {
        console.error("[useJaComprouTemp] erro ao carregar TEMP:", e);
        setSetCodes(new Set());
      }
    })();
    return () => {
      alive = false;
    };
  }, [key]);

  const isJaComprou = useCallback(
    (codigoProduto: string) => {
      const b = baseCode(codigoProduto);
      return setCodes.has(b);
    },
    [setCodes]
  );

  return { isJaComprou, jaComprouSet: setCodes };
}
