// hooks/useCarrinho.ts
import { useCallback, useEffect, useState } from "react";
import { eventBus } from "@/core/eventBus";
import { CarrinhoService } from "@/services/CarrinhoService";
import { NovoPedidoItem } from "@/context/interfaces/NovoPedidoItem";

export function useCarrinho(representanteId?: string) {
  const [total, setTotal] = useState(0);
  const [carrinhos, setCarrinhos] = useState<NovoPedidoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!representanteId) {
      setTotal(0);
      setCarrinhos([]);
      return;
    }
    setLoading(true);
    try {
      const [c, r, t, list] = await Promise.all([
        CarrinhoService.removerProdutoDoCarrinhoIsNull(),
        // CarrinhoService.removerTodosProdutoDoCarrinho(),
        () => r,
        //  CarrinhoService.debugDump(representanteId),
        CarrinhoService.getCount(representanteId),
        CarrinhoService.listByRepresentante(representanteId),
      ]);
      setTotal(t ?? 0);
      setCarrinhos(list ?? []);
      // console.log("Fetched carts:", list); // DEBUG LOG
    } finally {
      setLoading(false);
    }
  }, [representanteId]);

  // roda na montagem e sempre que o representanteId mudar
  useEffect(() => {
    //console.log("[useCarrinho][useEffect] mount/rep change → refresh()");
    refresh();
  }, [refresh]);

  // reativa quando houver mutação no carrinho
  useEffect(() => {
    const off = eventBus.on("carrinho:changed", refresh);
    return () => off();
  }, [refresh]);

  return { total, carrinhos, loading, refresh };
}
