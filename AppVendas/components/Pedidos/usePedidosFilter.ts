import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type Pedido = {
  id: number | string;
  razaoSocial?: string;
  dataCriacao?: string;
  dataFormatada?: string;
  status?: string | number;
  statusDescricao?: string;
  cpfCnpj?: string;
  [key: string]: any;
};

export function usePedidosFilter(pedidos: Pedido[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const filteredPedidos = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return pedidos;
    }

    const lowerSearch = debouncedSearch.toLowerCase().trim();

    return pedidos.filter((pedido) => {
      const id = String(pedido.id || "").toLowerCase();
      const razaoSocial = (pedido.razaoSocial || "").toLowerCase();
      const statusDescricao = (pedido.statusDescricao || "").toLowerCase();
      const dataFormatada = (pedido.dataFormatada || "").toLowerCase();
      const dataCriacao = (pedido.dataCriacao || "").toLowerCase();
      const cpfCnpj = (pedido.cpfCnpj || "").toLowerCase();

      return (
        id.includes(lowerSearch) ||
        razaoSocial.includes(lowerSearch) ||
        statusDescricao.includes(lowerSearch) ||
        dataFormatada.includes(lowerSearch) ||
        dataCriacao.includes(lowerSearch) ||
        cpfCnpj.includes(lowerSearch)
      );
    });
  }, [pedidos, debouncedSearch]);

  return {
    searchTerm,
    setSearchTerm,
    filteredPedidos,
    totalCount: pedidos.length,
    filteredCount: filteredPedidos.length,
  };
}
